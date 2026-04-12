"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postColumn = postColumn;
exports.putColumn = putColumn;
exports.patchColumnOrder = patchColumnOrder;
exports.removeColumn = removeColumn;
const columnService_1 = require("../services/columnService");
async function postColumn(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const column = await (0, columnService_1.createColumn)(req.authUser.id, req.body);
        res.status(201).json(column);
    }
    catch (error) {
        if (error instanceof columnService_1.ColumnError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function putColumn(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { id } = req.params;
    try {
        const column = await (0, columnService_1.renameColumn)(req.authUser.id, id, req.body);
        res.status(200).json(column);
    }
    catch (error) {
        if (error instanceof columnService_1.ColumnError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function patchColumnOrder(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { id } = req.params;
    try {
        const column = await (0, columnService_1.reorderColumn)(req.authUser.id, id, req.body);
        res.status(200).json(column);
    }
    catch (error) {
        if (error instanceof columnService_1.ColumnError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function removeColumn(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { id } = req.params;
    try {
        await (0, columnService_1.deleteColumn)(req.authUser.id, id);
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof columnService_1.ColumnError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
