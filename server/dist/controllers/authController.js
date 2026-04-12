"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getMe = getMe;
const authService_1 = require("../services/authService");
async function register(req, res, next) {
    try {
        const result = await (0, authService_1.registerUser)(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        if (error instanceof authService_1.AuthError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function login(req, res, next) {
    try {
        const result = await (0, authService_1.loginUser)(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof authService_1.AuthError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function getMe(req, res) {
    if (!req.authUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    res.status(200).json(req.authUser);
}
