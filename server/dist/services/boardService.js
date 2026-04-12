"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardError = void 0;
exports.listBoards = listBoards;
exports.createBoard = createBoard;
exports.updateBoard = updateBoard;
exports.deleteBoard = deleteBoard;
const prisma_1 = require("../lib/prisma");
class BoardError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'BoardError';
        this.statusCode = statusCode;
    }
}
exports.BoardError = BoardError;
const boardInclude = {
    columns: {
        orderBy: {
            position: 'asc'
        }
    }
};
async function listBoards(userId) {
    return prisma_1.prisma.board.findMany({
        where: { createdBy: userId },
        orderBy: {
            createdAt: 'desc'
        },
        include: boardInclude
    });
}
async function createBoard(userId, input) {
    const board = await prisma_1.prisma.board.create({
        data: {
            name: input.name,
            createdBy: userId
        }
    });
    const boardWithColumns = await prisma_1.prisma.board.findUnique({
        where: { id: board.id },
        include: boardInclude
    });
    if (!boardWithColumns) {
        throw new BoardError('Board creation failed', 500);
    }
    return boardWithColumns;
}
async function updateBoard(userId, boardId, input) {
    const existingBoard = await prisma_1.prisma.board.findFirst({
        where: {
            id: boardId,
            createdBy: userId
        }
    });
    if (!existingBoard) {
        throw new BoardError('Board not found', 404);
    }
    return prisma_1.prisma.board.update({
        where: { id: boardId },
        data: {
            name: input.name
        },
        include: boardInclude
    });
}
async function deleteBoard(userId, boardId) {
    const existingBoard = await prisma_1.prisma.board.findFirst({
        where: {
            id: boardId,
            createdBy: userId
        }
    });
    if (!existingBoard) {
        throw new BoardError('Board not found', 404);
    }
    await prisma_1.prisma.board.delete({
        where: { id: boardId }
    });
}
