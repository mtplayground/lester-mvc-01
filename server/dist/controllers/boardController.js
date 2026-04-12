"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBoards = getBoards;
exports.postBoard = postBoard;
exports.putBoard = putBoard;
exports.removeBoard = removeBoard;
const boardService_1 = require("../services/boardService");
async function getBoards(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const boards = await (0, boardService_1.listBoards)(req.authUser.id);
        res.status(200).json(boards);
    }
    catch (error) {
        next(error);
    }
}
async function postBoard(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const board = await (0, boardService_1.createBoard)(req.authUser.id, req.body);
        res.status(201).json(board);
    }
    catch (error) {
        if (error instanceof boardService_1.BoardError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function putBoard(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { id } = req.params;
    try {
        const board = await (0, boardService_1.updateBoard)(req.authUser.id, id, req.body);
        res.status(200).json(board);
    }
    catch (error) {
        if (error instanceof boardService_1.BoardError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function removeBoard(req, res, next) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { id } = req.params;
    try {
        await (0, boardService_1.deleteBoard)(req.authUser.id, id);
        res.status(204).send();
    }
    catch (error) {
        if (error instanceof boardService_1.BoardError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
