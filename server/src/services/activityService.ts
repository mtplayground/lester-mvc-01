import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class ActivityError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ActivityError';
    this.statusCode = statusCode;
  }
}

type ActivityAction = 'TASK_CREATED' | 'TASK_MOVED' | 'TASK_ASSIGNED' | 'TASK_COMPLETED';

type ActivityMetadata = Prisma.InputJsonValue;

interface LogTaskMovedInput {
  taskId: string;
  userId: string;
  fromColumnId: string;
  toColumnId: string;
  fromPosition: number;
  toPosition: number;
}

function isDoneColumnName(columnName: string | null | undefined): boolean {
  return (columnName ?? '').trim().toLowerCase() === 'done';
}

async function assertTaskOwnership(taskId: string, ownerId: string): Promise<void> {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      column: {
        board: {
          createdBy: ownerId
        }
      }
    },
    select: {
      id: true
    }
  });

  if (!task) {
    throw new ActivityError('Task not found', 404);
  }
}

async function createActivity(taskId: string, userId: string, action: ActivityAction, metadata?: ActivityMetadata) {
  return prisma.activity.create({
    data: {
      taskId,
      userId,
      action,
      metadata: metadata ?? undefined
    }
  });
}

async function getColumnNames(columnIds: string[]): Promise<Map<string, string>> {
  const uniqueColumnIds = Array.from(new Set(columnIds));

  if (uniqueColumnIds.length === 0) {
    return new Map();
  }

  const columns = await prisma.column.findMany({
    where: {
      id: {
        in: uniqueColumnIds
      }
    },
    select: {
      id: true,
      name: true
    }
  });

  return new Map(columns.map((column) => [column.id, column.name]));
}

export async function listTaskActivities(ownerId: string, taskId: string) {
  await assertTaskOwnership(taskId, ownerId);

  const activities = await prisma.activity.findMany({
    where: {
      taskId
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  return activities.map((activity) => ({
    id: activity.id,
    taskId: activity.taskId,
    userId: activity.userId,
    userName: activity.user.name,
    action: activity.action,
    metadata: activity.metadata,
    createdAt: activity.createdAt
  }));
}

export async function logTaskCreated(userId: string, taskId: string) {
  await createActivity(taskId, userId, 'TASK_CREATED');
}

export async function logTaskAssigned(userId: string, taskId: string, assigneeUserId: string) {
  const assignee = await prisma.user.findUnique({
    where: {
      id: assigneeUserId
    },
    select: {
      id: true,
      name: true
    }
  });

  await createActivity(taskId, userId, 'TASK_ASSIGNED', {
    assigneeUserId,
    assigneeName: assignee?.name ?? null
  });
}

export async function logTaskMoved(input: LogTaskMovedInput) {
  const moved = input.fromColumnId !== input.toColumnId || input.fromPosition !== input.toPosition;

  if (!moved) {
    return;
  }

  const columnNames = await getColumnNames([input.fromColumnId, input.toColumnId]);
  const fromColumnName = columnNames.get(input.fromColumnId) ?? null;
  const toColumnName = columnNames.get(input.toColumnId) ?? null;

  await createActivity(input.taskId, input.userId, 'TASK_MOVED', {
    fromColumnId: input.fromColumnId,
    toColumnId: input.toColumnId,
    fromColumnName,
    toColumnName,
    fromPosition: input.fromPosition,
    toPosition: input.toPosition
  });

  if (!isDoneColumnName(fromColumnName) && isDoneColumnName(toColumnName)) {
    await createActivity(input.taskId, input.userId, 'TASK_COMPLETED', {
      completedInColumnId: input.toColumnId,
      completedInColumnName: toColumnName
    });
  }
}
