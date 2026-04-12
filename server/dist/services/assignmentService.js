"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentError = void 0;
exports.listAssignableUsers = listAssignableUsers;
exports.assignUserToTask = assignUserToTask;
exports.unassignUserFromTask = unassignUserFromTask;
const prisma_1 = require("../lib/prisma");
const activityService_1 = require("./activityService");
const taskService_1 = require("./taskService");
class AssignmentError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'AssignmentError';
        this.statusCode = statusCode;
    }
}
exports.AssignmentError = AssignmentError;
async function assertOwnedTask(taskId, ownerId) {
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
        throw new AssignmentError('Task not found', 404);
    }
}
async function listAssignableUsers(ownerId, taskId) {
    await assertOwnedTask(taskId, ownerId);
    const [users, assignments] = await Promise.all([
        prisma_1.prisma.user.findMany({
            orderBy: {
                createdAt: 'asc'
            },
            select: {
                id: true,
                email: true,
                name: true
            }
        }),
        prisma_1.prisma.taskAssignment.findMany({
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
async function assignUserToTask(ownerId, taskId, assigneeUserId) {
    await assertOwnedTask(taskId, ownerId);
    const assignee = await prisma_1.prisma.user.findUnique({
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
    const existingAssignment = await prisma_1.prisma.taskAssignment.findUnique({
        where: {
            taskId_userId: {
                taskId,
                userId: assigneeUserId
            }
        },
        select: {
            taskId: true
        }
    });
    if (!existingAssignment) {
        await prisma_1.prisma.taskAssignment.create({
            data: {
                taskId,
                userId: assigneeUserId
            }
        });
        await (0, activityService_1.logTaskAssigned)(ownerId, taskId, assigneeUserId);
    }
    try {
        return await (0, taskService_1.getTaskWithAssigneesById)(taskId);
    }
    catch (error) {
        if (error instanceof taskService_1.TaskError) {
            throw new AssignmentError(error.message, error.statusCode);
        }
        throw error;
    }
}
async function unassignUserFromTask(ownerId, taskId, assigneeUserId) {
    await assertOwnedTask(taskId, ownerId);
    await prisma_1.prisma.taskAssignment.deleteMany({
        where: {
            taskId,
            userId: assigneeUserId
        }
    });
    try {
        return await (0, taskService_1.getTaskWithAssigneesById)(taskId);
    }
    catch (error) {
        if (error instanceof taskService_1.TaskError) {
            throw new AssignmentError(error.message, error.statusCode);
        }
        throw error;
    }
}
