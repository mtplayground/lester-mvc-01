import { prisma } from '../lib/prisma';
import type { CreateBoardBody, UpdateBoardBody } from '../validators/board';

export class BoardError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'BoardError';
    this.statusCode = statusCode;
  }
}

const boardInclude = {
  columns: {
    orderBy: {
      position: 'asc'
    }
  }
} as const;

export async function listBoards(userId: string) {
  return prisma.board.findMany({
    where: { createdBy: userId },
    orderBy: {
      createdAt: 'desc'
    },
    include: boardInclude
  });
}

export async function createBoard(userId: string, input: CreateBoardBody) {
  const board = await prisma.board.create({
    data: {
      name: input.name,
      createdBy: userId
    }
  });

  const boardWithColumns = await prisma.board.findUnique({
    where: { id: board.id },
    include: boardInclude
  });

  if (!boardWithColumns) {
    throw new BoardError('Board creation failed', 500);
  }

  return boardWithColumns;
}

export async function updateBoard(userId: string, boardId: string, input: UpdateBoardBody) {
  const existingBoard = await prisma.board.findFirst({
    where: {
      id: boardId,
      createdBy: userId
    }
  });

  if (!existingBoard) {
    throw new BoardError('Board not found', 404);
  }

  return prisma.board.update({
    where: { id: boardId },
    data: {
      name: input.name
    },
    include: boardInclude
  });
}

export async function deleteBoard(userId: string, boardId: string) {
  const existingBoard = await prisma.board.findFirst({
    where: {
      id: boardId,
      createdBy: userId
    }
  });

  if (!existingBoard) {
    throw new BoardError('Board not found', 404);
  }

  await prisma.board.delete({
    where: { id: boardId }
  });
}
