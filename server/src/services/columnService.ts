import { prisma } from '../lib/prisma';
import type { CreateColumnBody, ReorderColumnBody, UpdateColumnBody } from '../validators/column';

export class ColumnError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ColumnError';
    this.statusCode = statusCode;
  }
}

async function assertBoardOwnership(boardId: string, userId: string): Promise<void> {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      createdBy: userId
    },
    select: { id: true }
  });

  if (!board) {
    throw new ColumnError('Board not found', 404);
  }
}

async function findOwnedColumn(columnId: string, userId: string) {
  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      board: {
        createdBy: userId
      }
    }
  });

  if (!column) {
    throw new ColumnError('Column not found', 404);
  }

  return column;
}

export async function createColumn(userId: string, input: CreateColumnBody) {
  await assertBoardOwnership(input.boardId, userId);

  let position = input.position;

  if (position === undefined) {
    const lastColumn = await prisma.column.findFirst({
      where: { boardId: input.boardId },
      orderBy: { position: 'desc' },
      select: { position: true }
    });

    position = lastColumn ? lastColumn.position + 1 : 0;
  }

  return prisma.column.create({
    data: {
      boardId: input.boardId,
      name: input.name,
      position
    }
  });
}

export async function renameColumn(userId: string, columnId: string, input: UpdateColumnBody) {
  await findOwnedColumn(columnId, userId);

  return prisma.column.update({
    where: { id: columnId },
    data: {
      name: input.name
    }
  });
}

export async function reorderColumn(userId: string, columnId: string, input: ReorderColumnBody) {
  await findOwnedColumn(columnId, userId);

  return prisma.column.update({
    where: { id: columnId },
    data: {
      position: input.position
    }
  });
}

export async function deleteColumn(userId: string, columnId: string) {
  await findOwnedColumn(columnId, userId);

  await prisma.column.delete({
    where: { id: columnId }
  });
}
