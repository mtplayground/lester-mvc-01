import { prisma } from '../lib/prisma';
import { getTaskWithAssigneesById, TaskError } from './taskService';
import type { CreateLabelBody, UpdateLabelBody } from '../validators/label';

export class LabelError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'LabelError';
    this.statusCode = statusCode;
  }
}

async function assertBoardOwnership(boardId: string, userId: string): Promise<void> {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      createdBy: userId
    },
    select: {
      id: true
    }
  });

  if (!board) {
    throw new LabelError('Board not found', 404);
  }
}

async function findOwnedLabel(labelId: string, userId: string) {
  const label = await prisma.label.findFirst({
    where: {
      id: labelId,
      board: {
        createdBy: userId
      }
    }
  });

  if (!label) {
    throw new LabelError('Label not found', 404);
  }

  return label;
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
    },
    select: {
      id: true,
      column: {
        select: {
          boardId: true
        }
      }
    }
  });

  if (!task) {
    throw new LabelError('Task not found', 404);
  }

  return task;
}

export async function listLabels(userId: string, boardId: string) {
  await assertBoardOwnership(boardId, userId);

  return prisma.label.findMany({
    where: { boardId },
    orderBy: {
      name: 'asc'
    }
  });
}

export async function createLabel(userId: string, input: CreateLabelBody) {
  await assertBoardOwnership(input.boardId, userId);

  return prisma.label.create({
    data: {
      boardId: input.boardId,
      name: input.name,
      color: input.color
    }
  });
}

export async function updateLabel(userId: string, labelId: string, input: UpdateLabelBody) {
  await findOwnedLabel(labelId, userId);

  return prisma.label.update({
    where: { id: labelId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.color !== undefined ? { color: input.color } : {})
    }
  });
}

export async function deleteLabel(userId: string, labelId: string) {
  await findOwnedLabel(labelId, userId);

  await prisma.label.delete({
    where: {
      id: labelId
    }
  });
}

export async function attachLabelToTask(userId: string, taskId: string, labelId: string) {
  const [task, label] = await Promise.all([findOwnedTask(taskId, userId), findOwnedLabel(labelId, userId)]);

  if (label.boardId !== task.column.boardId) {
    throw new LabelError('Label and task must belong to the same board', 400);
  }

  await prisma.taskLabel.upsert({
    where: {
      taskId_labelId: {
        taskId,
        labelId
      }
    },
    create: {
      taskId,
      labelId
    },
    update: {}
  });

  try {
    return await getTaskWithAssigneesById(taskId);
  } catch (error: unknown) {
    if (error instanceof TaskError) {
      throw new LabelError(error.message, error.statusCode);
    }

    throw error;
  }
}

export async function detachLabelFromTask(userId: string, taskId: string, labelId: string) {
  const [task, label] = await Promise.all([findOwnedTask(taskId, userId), findOwnedLabel(labelId, userId)]);

  if (label.boardId !== task.column.boardId) {
    throw new LabelError('Label and task must belong to the same board', 400);
  }

  await prisma.taskLabel.deleteMany({
    where: {
      taskId,
      labelId
    }
  });

  try {
    return await getTaskWithAssigneesById(taskId);
  } catch (error: unknown) {
    if (error instanceof TaskError) {
      throw new LabelError(error.message, error.statusCode);
    }

    throw error;
  }
}
