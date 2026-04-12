"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityError = void 0;
exports.listTaskActivities = listTaskActivities;
exports.logTaskCreated = logTaskCreated;
exports.logTaskAssigned = logTaskAssigned;
exports.logTaskMoved = logTaskMoved;
const prisma_1 = require("../lib/prisma");
class ActivityError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'ActivityError';
        this.statusCode = statusCode;
    }
}
exports.ActivityError = ActivityError;
function isDoneColumnName(columnName) {
    return (columnName ?? '').trim().toLowerCase() === 'done';
}
async function assertTaskOwnership(taskId, ownerId) {
    const task = await prisma_1.prisma.task.findFirst({
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
async function createActivity(taskId, userId, action, metadata) {
    return prisma_1.prisma.activity.create({
        data: {
            taskId,
            userId,
            action,
            metadata: metadata ?? undefined
        }
    });
}
async function getColumnNames(columnIds) {
    const uniqueColumnIds = Array.from(new Set(columnIds));
    if (uniqueColumnIds.length === 0) {
        return new Map();
    }
    const columns = await prisma_1.prisma.column.findMany({
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
async function listTaskActivities(ownerId, taskId) {
    await assertTaskOwnership(taskId, ownerId);
    const activities = await prisma_1.prisma.activity.findMany({
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
async function logTaskCreated(userId, taskId) {
    await createActivity(taskId, userId, 'TASK_CREATED');
}
async function logTaskAssigned(userId, taskId, assigneeUserId) {
    const assignee = await prisma_1.prisma.user.findUnique({
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
async function logTaskMoved(input) {
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
