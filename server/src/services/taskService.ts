import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { logTaskCreated, logTaskMoved } from './activityService';
import type { BulkReorderTasksBody, CreateTaskBody, UpdateTaskBody } from '../validators/task';

export class TaskError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'TaskError';
    this.statusCode = statusCode;
  }
}

const taskWithAssigneesInclude = {
  taskAssignments: {
    select: {
      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  },
  taskLabels: {
    select: {
      label: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    }
  }
} as const;

type TaskWithAssigneesRecord = Prisma.TaskGetPayload<{
  include: typeof taskWithAssigneesInclude;
}>;

function mapTaskWithAssignees(task: TaskWithAssigneesRecord) {
  const { taskAssignments, taskLabels, ...taskData } = task;

  return {
    ...taskData,
    assignees: taskAssignments.map((assignment) => ({
      id: assignment.user.id,
      name: assignment.user.name
    })),
    labels: taskLabels.map((taskLabel) => ({
      id: taskLabel.label.id,
      name: taskLabel.label.name,
      color: taskLabel.label.color
    }))
  };
}

async function assertColumnOwnership(columnId: string, userId: string): Promise<void> {
  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      board: {
        createdBy: userId
      }
    },
    select: {
      id: true
    }
  });

  if (!column) {
    throw new TaskError('Column not found', 404);
  }
}

async function findOwnedTask(taskId: string, userId: string): Promise<TaskWithAssigneesRecord> {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      column: {
        board: {
          createdBy: userId
        }
      }
    },
    include: taskWithAssigneesInclude
  });

  if (!task) {
    throw new TaskError('Task not found', 404);
  }

  return task;
}

export async function listTasksInColumn(userId: string, columnId: string) {
  await assertColumnOwnership(columnId, userId);

  const tasks = await prisma.task.findMany({
    where: { columnId },
    orderBy: {
      position: 'asc'
    },
    include: taskWithAssigneesInclude
  });

  return tasks.map(mapTaskWithAssignees);
}

export async function getTaskById(userId: string, taskId: string) {
  const task = await findOwnedTask(taskId, userId);
  return mapTaskWithAssignees(task);
}

export async function getOwnedTaskWithAssignees(userId: string, taskId: string) {
  return findOwnedTask(taskId, userId);
}

export async function createTask(userId: string, input: CreateTaskBody) {
  await assertColumnOwnership(input.columnId, userId);

  let position = input.position;

  if (position === undefined) {
    const lastTask = await prisma.task.findFirst({
      where: { columnId: input.columnId },
      orderBy: { position: 'desc' },
      select: { position: true }
    });

    position = lastTask ? lastTask.position + 1 : 0;
  }

  const task = await prisma.task.create({
    data: {
      columnId: input.columnId,
      title: input.title,
      description: input.description ?? null,
      dueDate: input.dueDate ?? null,
      priority: input.priority ?? 'MEDIUM',
      position,
      createdBy: userId
    },
    include: taskWithAssigneesInclude
  });

  await logTaskCreated(userId, task.id);

  return mapTaskWithAssignees(task);
}

export async function updateTask(userId: string, taskId: string, input: UpdateTaskBody) {
  const existingTask = await findOwnedTask(taskId, userId);

  if (input.columnId && input.columnId !== existingTask.columnId) {
    await assertColumnOwnership(input.columnId, userId);
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.columnId ? { columnId: input.columnId } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.position !== undefined ? { position: input.position } : {})
    },
    include: taskWithAssigneesInclude
  });

  await logTaskMoved({
    taskId: task.id,
    userId,
    fromColumnId: existingTask.columnId,
    toColumnId: task.columnId,
    fromPosition: existingTask.position,
    toPosition: task.position
  });

  return mapTaskWithAssignees(task);
}

export async function deleteTask(userId: string, taskId: string) {
  await findOwnedTask(taskId, userId);

  await prisma.task.delete({
    where: { id: taskId }
  });
}

export async function bulkReorderTasks(userId: string, input: BulkReorderTasksBody) {
  const uniqueColumnIds = Array.from(new Set(input.tasks.map((task) => task.columnId)));

  await Promise.all(uniqueColumnIds.map((columnId) => assertColumnOwnership(columnId, userId)));

  const taskIds = input.tasks.map((task) => task.id);

  const ownedTasks = await prisma.task.findMany({
    where: {
      id: { in: taskIds },
      column: {
        board: {
          createdBy: userId
        }
      }
    },
    select: {
      id: true,
      columnId: true,
      position: true
    }
  });

  if (ownedTasks.length !== taskIds.length) {
    throw new TaskError('One or more tasks were not found', 404);
  }

  await prisma.$transaction(
    input.tasks.map((task) =>
      prisma.task.update({
        where: { id: task.id },
        data: {
          columnId: task.columnId,
          position: task.position
        }
      })
    )
  );

  const taskBeforeById = new Map(ownedTasks.map((task) => [task.id, task]));

  await Promise.all(
    input.tasks.map(async (taskUpdate) => {
      const previousTask = taskBeforeById.get(taskUpdate.id);

      if (!previousTask) {
        return;
      }

      await logTaskMoved({
        taskId: taskUpdate.id,
        userId,
        fromColumnId: previousTask.columnId,
        toColumnId: taskUpdate.columnId,
        fromPosition: previousTask.position,
        toPosition: taskUpdate.position
      });
    })
  );

  const reorderedTasks = await prisma.task.findMany({
    where: { id: { in: taskIds } },
    orderBy: {
      position: 'asc'
    },
    include: taskWithAssigneesInclude
  });

  return reorderedTasks.map(mapTaskWithAssignees);
}

export async function getTaskWithAssigneesById(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: taskWithAssigneesInclude
  });

  if (!task) {
    throw new TaskError('Task not found', 404);
  }

  return mapTaskWithAssignees(task);
}
