"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLabels = getLabels;
exports.postLabel = postLabel;
exports.putLabel = putLabel;
exports.removeLabel = removeLabel;
exports.postTaskLabel = postTaskLabel;
exports.deleteTaskLabel = deleteTaskLabel;
const labelService_1 = require("../services/labelService");
async function getLabels(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { boardId } = req.query;
    try {
        const labels = await (0, labelService_1.listLabels)(req.authUser.id, boardId);
        res.status(200).json(labels);
    }
    catch (error) {
        if (error instanceof labelService_1.LabelError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function postLabel(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const label = await (0, labelService_1.createLabel)(req.authUser.id, req.body);
        res.status(201).json(label);
    }
    catch (error) {
        if (error instanceof labelService_1.LabelError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function putLabel(req, res, next) {
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
        const label = await (0, labelService_1.updateLabel)(req.authUser.id, id, req.body);
        res.status(200).json(label);
    }
    catch (error) {
        if (error instanceof labelService_1.LabelError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function removeLabel(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { id } = req.params;
    try {
        await (0, labelService_1.deleteLabel)(req.authUser.id, id);
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof labelService_1.LabelError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function postTaskLabel(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { taskId, labelId } = req.body;
    try {
        const task = await (0, labelService_1.attachLabelToTask)(req.authUser.id, taskId, labelId);
        res.status(200).json(task);
    }
    catch (error) {
        if (error instanceof labelService_1.LabelError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function deleteTaskLabel(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { taskId, labelId } = req.body;
    try {
        const task = await (0, labelService_1.detachLabelFromTask)(req.authUser.id, taskId, labelId);
        res.status(200).json(task);
    }
    catch (error) {
        if (error instanceof labelService_1.LabelError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
