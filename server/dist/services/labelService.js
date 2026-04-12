"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabelError = void 0;
exports.listLabels = listLabels;
exports.createLabel = createLabel;
exports.updateLabel = updateLabel;
exports.deleteLabel = deleteLabel;
exports.attachLabelToTask = attachLabelToTask;
exports.detachLabelFromTask = detachLabelFromTask;
const prisma_1 = require("../lib/prisma");
const taskService_1 = require("./taskService");
class LabelError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'LabelError';
        this.statusCode = statusCode;
    }
}
exports.LabelError = LabelError;
async function assertBoardOwnership(boardId, userId) {
    const board = await prisma_1.prisma.board.findFirst({
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
async function findOwnedLabel(labelId, userId) {
    const label = await prisma_1.prisma.label.findFirst({
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
async function findOwnedTask(taskId, userId) {
    const task = await prisma_1.prisma.task.findFirst({
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
async function listLabels(userId, boardId) {
    await assertBoardOwnership(boardId, userId);
    return prisma_1.prisma.label.findMany({
        where: { boardId },
        orderBy: {
            name: 'asc'
        }
    });
}
async function createLabel(userId, input) {
    await assertBoardOwnership(input.boardId, userId);
    return prisma_1.prisma.label.create({
        data: {
            boardId: input.boardId,
            name: input.name,
            color: input.color
        }
    });
}
async function updateLabel(userId, labelId, input) {
    await findOwnedLabel(labelId, userId);
    return prisma_1.prisma.label.update({
        where: { id: labelId },
        data: {
            ...(input.name !== undefined ? { name: input.name } : {}),
            ...(input.color !== undefined ? { color: input.color } : {})
        }
    });
}
async function deleteLabel(userId, labelId) {
    await findOwnedLabel(labelId, userId);
    await prisma_1.prisma.label.delete({
        where: {
            id: labelId
        }
    });
}
async function attachLabelToTask(userId, taskId, labelId) {
    const [task, label] = await Promise.all([findOwnedTask(taskId, userId), findOwnedLabel(labelId, userId)]);
    if (label.boardId !== task.column.boardId) {
        throw new LabelError('Label and task must belong to the same board', 400);
    }
    await prisma_1.prisma.taskLabel.upsert({
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
        return await (0, taskService_1.getTaskWithAssigneesById)(taskId);
    }
    catch (error) {
        if (error instanceof taskService_1.TaskError) {
            throw new LabelError(error.message, error.statusCode);
        }
        throw error;
    }
}
async function detachLabelFromTask(userId, taskId, labelId) {
    const [task, label] = await Promise.all([findOwnedTask(taskId, userId), findOwnedLabel(labelId, userId)]);
    if (label.boardId !== task.column.boardId) {
        throw new LabelError('Label and task must belong to the same board', 400);
    }
    await prisma_1.prisma.taskLabel.deleteMany({
        where: {
            taskId,
            labelId
        }
    });
    try {
        return await (0, taskService_1.getTaskWithAssigneesById)(taskId);
    }
    catch (error) {
        if (error instanceof taskService_1.TaskError) {
            throw new LabelError(error.message, error.statusCode);
        }
        throw error;
    }
}
