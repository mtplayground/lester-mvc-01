import { prisma } from '../lib/prisma';
import type { BulkReorderTasksBody, CreateTaskBody, UpdateTaskBody } from '../validators/task';

export class TaskError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'TaskError';
    this.statusCode = statusCode;
  }
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

async function findOwnedTask(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      column: {
        board: {
          createdBy: userId
        }
      }
    }
  });

  if (!task) {
    throw new TaskError('Task not found', 404);
  }

  return task;
}

export async function listTasksInColumn(userId: string, columnId: string) {
  await assertColumnOwnership(columnId, userId);

  return prisma.task.findMany({
    where: { columnId },
    orderBy: {
      position: 'asc'
    }
  });
}

export async function getTaskById(userId: string, taskId: string) {
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

  return prisma.task.create({
    data: {
      columnId: input.columnId,
      title: input.title,
      description: input.description ?? null,
      dueDate: input.dueDate ?? null,
      priority: input.priority ?? 'MEDIUM',
      position,
      createdBy: userId
    }
  });
}

export async function updateTask(userId: string, taskId: string, input: UpdateTaskBody) {
  const existingTask = await findOwnedTask(taskId, userId);

  if (input.columnId && input.columnId !== existingTask.columnId) {
    await assertColumnOwnership(input.columnId, userId);
  }

  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.columnId ? { columnId: input.columnId } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.position !== undefined ? { position: input.position } : {})
    }
  });
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
      id: true
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

  return prisma.task.findMany({
    where: { id: { in: taskIds } },
    orderBy: {
      position: 'asc'
    }
  });
}
