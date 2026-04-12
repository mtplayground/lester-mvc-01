import { prisma } from '../lib/prisma';
import { getTaskWithAssigneesById, TaskError } from './taskService';

export class AssignmentError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AssignmentError';
    this.statusCode = statusCode;
  }
}

async function assertOwnedTask(taskId: string, ownerId: string): Promise<void> {
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
    throw new AssignmentError('Task not found', 404);
  }
}

export async function listAssignableUsers(ownerId: string, taskId: string) {
  await assertOwnedTask(taskId, ownerId);

  const [users, assignments] = await Promise.all([
    prisma.user.findMany({
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    }),
    prisma.taskAssignment.findMany({
      where: {
        taskId
      },
      select: {
        userId: true
      }
    })
  ]);

  const assignedUserIds = new Set(assignments.map((assignment) => assignment.userId));

  return users.map((user) => ({
    ...user,
    assigned: assignedUserIds.has(user.id)
  }));
}

export async function assignUserToTask(ownerId: string, taskId: string, assigneeUserId: string) {
  await assertOwnedTask(taskId, ownerId);

  const assignee = await prisma.user.findUnique({
    where: {
      id: assigneeUserId
    },
    select: {
      id: true
    }
  });

  if (!assignee) {
    throw new AssignmentError('User not found', 404);
  }

  await prisma.taskAssignment.upsert({
    where: {
      taskId_userId: {
        taskId,
        userId: assigneeUserId
      }
    },
    create: {
      taskId,
      userId: assigneeUserId
    },
    update: {}
  });

  try {
    return await getTaskWithAssigneesById(taskId);
  } catch (error: unknown) {
    if (error instanceof TaskError) {
      throw new AssignmentError(error.message, error.statusCode);
    }

    throw error;
  }
}

export async function unassignUserFromTask(ownerId: string, taskId: string, assigneeUserId: string) {
  await assertOwnedTask(taskId, ownerId);

  await prisma.taskAssignment.deleteMany({
    where: {
      taskId,
      userId: assigneeUserId
    }
  });

  try {
    return await getTaskWithAssigneesById(taskId);
  } catch (error: unknown) {
    if (error instanceof TaskError) {
      throw new AssignmentError(error.message, error.statusCode);
    }

    throw error;
  }
}
