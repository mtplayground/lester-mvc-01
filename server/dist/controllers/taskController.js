"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasksByColumn = getTasksByColumn;
exports.getTask = getTask;
exports.postTask = postTask;
exports.putTask = putTask;
exports.deleteTaskById = deleteTaskById;
exports.patchTaskReorder = patchTaskReorder;
const taskService_1 = require("../services/taskService");
async function getTasksByColumn(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { columnId } = req.params;
    try {
        const tasks = await (0, taskService_1.listTasksInColumn)(req.authUser.id, columnId);
        res.status(200).json(tasks);
    }
    catch (error) {
        if (error instanceof taskService_1.TaskError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function getTask(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { id } = req.params;
    try {
        const task = await (0, taskService_1.getTaskById)(req.authUser.id, id);
        res.status(200).json(task);
    }
    catch (error) {
        if (error instanceof taskService_1.TaskError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function postTask(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const task = await (0, taskService_1.createTask)(req.authUser.id, req.body);
        res.status(201).json(task);
    }
    catch (error) {
        if (error instanceof taskService_1.TaskError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function putTask(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { id } = req.params;
    if (Object.keys(req.body).length === 0) {
        res.status(400).json({ message: 'At least one field must be provided' });
        return;
    }
    try {
        const task = await (0, taskService_1.updateTask)(req.authUser.id, id, req.body);
        res.status(200).json(task);
    }
    catch (error) {
        if (error instanceof taskService_1.TaskError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function deleteTaskById(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { id } = req.params;
    try {
        await (0, taskService_1.deleteTask)(req.authUser.id, id);
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof taskService_1.TaskError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function patchTaskReorder(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const tasks = await (0, taskService_1.bulkReorderTasks)(req.authUser.id, req.body);
        res.status(200).json(tasks);
    }
    catch (error) {
        if (error instanceof taskService_1.TaskError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
