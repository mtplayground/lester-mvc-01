"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskError = void 0;
exports.listTasksInColumn = listTasksInColumn;
exports.getTaskById = getTaskById;
exports.getOwnedTaskWithAssignees = getOwnedTaskWithAssignees;
exports.createTask = createTask;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
exports.bulkReorderTasks = bulkReorderTasks;
exports.getTaskWithAssigneesById = getTaskWithAssigneesById;
const prisma_1 = require("../lib/prisma");
const activityService_1 = require("./activityService");
class TaskError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'TaskError';
        this.statusCode = statusCode;
    }
}
exports.TaskError = TaskError;
const taskWithAssigneesInclude = {
    taskAssignments: {
        select: {
            user: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    },
    taskLabels: {
        select: {
            label: {
                select: {
                    id: true,
                    name: true,
                    color: true
                }
            }
        }
    }
};
function mapTaskWithAssignees(task) {
    const { taskAssignments, taskLabels, ...taskData } = task;
    return {
        ...taskData,
        assignees: taskAssignments.map((assignment) => ({
            id: assignment.user.id,
            name: assignment.user.name
        })),
        labels: taskLabels.map((taskLabel) => ({
            id: taskLabel.label.id,
            name: taskLabel.label.name,
            color: taskLabel.label.color
        }))
    };
}
async function assertColumnOwnership(columnId, userId) {
    const column = await prisma_1.prisma.column.findFirst({
        where: {
            id: columnId,
            board: {
                createdBy: userId
            }
        },
        select: {
            id: true
        }
    });
    if (!column) {
        throw new TaskError('Column not found', 404);
    }
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
        include: taskWithAssigneesInclude
    });
    if (!task) {
        throw new TaskError('Task not found', 404);
    }
    return task;
}
async function listTasksInColumn(userId, columnId) {
    await assertColumnOwnership(columnId, userId);
    const tasks = await prisma_1.prisma.task.findMany({
        where: { columnId },
        orderBy: {
            position: 'asc'
        },
        include: taskWithAssigneesInclude
    });
    return tasks.map(mapTaskWithAssignees);
}
async function getTaskById(userId, taskId) {
    const task = await findOwnedTask(taskId, userId);
    return mapTaskWithAssignees(task);
}
async function getOwnedTaskWithAssignees(userId, taskId) {
    return findOwnedTask(taskId, userId);
}
async function createTask(userId, input) {
    await assertColumnOwnership(input.columnId, userId);
    let position = input.position;
    if (position === undefined) {
        const lastTask = await prisma_1.prisma.task.findFirst({
            where: { columnId: input.columnId },
            orderBy: { position: 'desc' },
            select: { position: true }
        });
        position = lastTask ? lastTask.position + 1 : 0;
    }
    const task = await prisma_1.prisma.task.create({
        data: {
            columnId: input.columnId,
            title: input.title,
            description: input.description ?? null,
            dueDate: input.dueDate ?? null,
            priority: input.priority ?? 'MEDIUM',
            position,
            createdBy: userId
        },
        include: taskWithAssigneesInclude
    });
    await (0, activityService_1.logTaskCreated)(userId, task.id);
    return mapTaskWithAssignees(task);
}
async function updateTask(userId, taskId, input) {
    const existingTask = await findOwnedTask(taskId, userId);
    if (input.columnId && input.columnId !== existingTask.columnId) {
        await assertColumnOwnership(input.columnId, userId);
    }
    const task = await prisma_1.prisma.task.update({
        where: { id: taskId },
        data: {
            ...(input.columnId ? { columnId: input.columnId } : {}),
            ...(input.title !== undefined ? { title: input.title } : {}),
            ...(input.description !== undefined ? { description: input.description } : {}),
            ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
            ...(input.priority !== undefined ? { priority: input.priority } : {}),
            ...(input.position !== undefined ? { position: input.position } : {})
        },
        include: taskWithAssigneesInclude
    });
    await (0, activityService_1.logTaskMoved)({
        taskId: task.id,
        userId,
        fromColumnId: existingTask.columnId,
        toColumnId: task.columnId,
        fromPosition: existingTask.position,
        toPosition: task.position
    });
    return mapTaskWithAssignees(task);
}
async function deleteTask(userId, taskId) {
    await findOwnedTask(taskId, userId);
    await prisma_1.prisma.task.delete({
        where: { id: taskId }
    });
}
async function bulkReorderTasks(userId, input) {
    const uniqueColumnIds = Array.from(new Set(input.tasks.map((task) => task.columnId)));
    await Promise.all(uniqueColumnIds.map((columnId) => assertColumnOwnership(columnId, userId)));
    const taskIds = input.tasks.map((task) => task.id);
    const ownedTasks = await prisma_1.prisma.task.findMany({
        where: {
            id: { in: taskIds },
            column: {
                board: {
                    createdBy: userId
                }
            }
        },
        select: {
            id: true,
            columnId: true,
            position: true
        }
    });
    if (ownedTasks.length !== taskIds.length) {
        throw new TaskError('One or more tasks were not found', 404);
    }
    await prisma_1.prisma.$transaction(input.tasks.map((task) => prisma_1.prisma.task.update({
        where: { id: task.id },
        data: {
            columnId: task.columnId,
            position: task.position
        }
    })));
    const taskBeforeById = new Map(ownedTasks.map((task) => [task.id, task]));
    await Promise.all(input.tasks.map(async (taskUpdate) => {
        const previousTask = taskBeforeById.get(taskUpdate.id);
        if (!previousTask) {
            return;
        }
        await (0, activityService_1.logTaskMoved)({
            taskId: taskUpdate.id,
            userId,
            fromColumnId: previousTask.columnId,
            toColumnId: taskUpdate.columnId,
            fromPosition: previousTask.position,
            toPosition: taskUpdate.position
        });
    }));
    const reorderedTasks = await prisma_1.prisma.task.findMany({
        where: { id: { in: taskIds } },
        orderBy: {
            position: 'asc'
        },
        include: taskWithAssigneesInclude
    });
    return reorderedTasks.map(mapTaskWithAssignees);
}
async function getTaskWithAssigneesById(taskId) {
    const task = await prisma_1.prisma.task.findUnique({
        where: { id: taskId },
        include: taskWithAssigneesInclude
    });
    if (!task) {
        throw new TaskError('Task not found', 404);
    }
    return mapTaskWithAssignees(task);
}
