"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnError = void 0;
exports.createColumn = createColumn;
exports.renameColumn = renameColumn;
exports.reorderColumn = reorderColumn;
exports.deleteColumn = deleteColumn;
const prisma_1 = require("../lib/prisma");
class ColumnError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'ColumnError';
        this.statusCode = statusCode;
    }
}
exports.ColumnError = ColumnError;
async function assertBoardOwnership(boardId, userId) {
    const board = await prisma_1.prisma.board.findFirst({
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
async function findOwnedColumn(columnId, userId) {
    const column = await prisma_1.prisma.column.findFirst({
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
async function createColumn(userId, input) {
    await assertBoardOwnership(input.boardId, userId);
    let position = input.position;
    if (position === undefined) {
        const lastColumn = await prisma_1.prisma.column.findFirst({
            where: { boardId: input.boardId },
            orderBy: { position: 'desc' },
            select: { position: true }
        });
        position = lastColumn ? lastColumn.position + 1 : 0;
    }
    return prisma_1.prisma.column.create({
        data: {
            boardId: input.boardId,
            name: input.name,
            position
        }
    });
}
async function renameColumn(userId, columnId, input) {
    await findOwnedColumn(columnId, userId);
    return prisma_1.prisma.column.update({
        where: { id: columnId },
        data: {
            name: input.name
        }
    });
}
async function reorderColumn(userId, columnId, input) {
    await findOwnedColumn(columnId, userId);
    return prisma_1.prisma.column.update({
        where: { id: columnId },
        data: {
            position: input.position
        }
    });
}
async function deleteColumn(userId, columnId) {
    await findOwnedColumn(columnId, userId);
    await prisma_1.prisma.column.delete({
        where: { id: columnId }
    });
}
