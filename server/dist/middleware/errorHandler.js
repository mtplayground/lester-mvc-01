"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const validators_1 = require("../validators");
function notFoundHandler(_req, res) {
    res.status(404).json({
        message: 'Route not found'
    });
}
function errorHandler(error, _req, res, _next) {
    if ((0, validators_1.isRequestValidationError)(error)) {
        res.status(400).json({
            message: error.message,
            issues: error.issues
        });
        return;
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
        message
    });
}
