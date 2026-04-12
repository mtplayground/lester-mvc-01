"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComments = getComments;
exports.postComment = postComment;
exports.putComment = putComment;
exports.removeComment = removeComment;
const commentService_1 = require("../services/commentService");
async function getComments(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { taskId } = req.query;
    try {
        const comments = await (0, commentService_1.listCommentsByTask)(req.authUser.id, taskId);
        res.status(200).json(comments);
    }
    catch (error) {
        if (error instanceof commentService_1.CommentError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function postComment(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const comment = await (0, commentService_1.createComment)(req.authUser.id, req.body);
        res.status(201).json(comment);
    }
    catch (error) {
        if (error instanceof commentService_1.CommentError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function putComment(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { id } = req.params;
    try {
        const comment = await (0, commentService_1.updateComment)(req.authUser.id, id, req.body);
        res.status(200).json(comment);
    }
    catch (error) {
        if (error instanceof commentService_1.CommentError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function removeComment(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { id } = req.params;
    try {
        await (0, commentService_1.deleteComment)(req.authUser.id, id);
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof commentService_1.CommentError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
