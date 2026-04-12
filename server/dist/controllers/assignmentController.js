"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssignableUsers = getAssignableUsers;
exports.postTaskAssignment = postTaskAssignment;
exports.deleteTaskAssignment = deleteTaskAssignment;
const assignmentService_1 = require("../services/assignmentService");
async function getAssignableUsers(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { taskId } = req.query;
    try {
        const users = await (0, assignmentService_1.listAssignableUsers)(req.authUser.id, taskId);
        res.status(200).json(users);
    }
    catch (error) {
        if (error instanceof assignmentService_1.AssignmentError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function postTaskAssignment(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { taskId, userId } = req.body;
    try {
        const task = await (0, assignmentService_1.assignUserToTask)(req.authUser.id, taskId, userId);
        res.status(200).json(task);
    }
    catch (error) {
        if (error instanceof assignmentService_1.AssignmentError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function deleteTaskAssignment(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { taskId, userId } = req.body;
    try {
        const task = await (0, assignmentService_1.unassignUserFromTask)(req.authUser.id, taskId, userId);
        res.status(200).json(task);
    }
    catch (error) {
        if (error instanceof assignmentService_1.AssignmentError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
