"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRequestValidationError = isRequestValidationError;
exports.validateRequest = validateRequest;
const zod_1 = require("zod");
class RequestValidationError extends Error {
    constructor(issues) {
        super('Request validation failed');
        this.name = 'RequestValidationError';
        this.issues = issues;
    }
}
function isRequestValidationError(value) {
    return value instanceof RequestValidationError;
}
function validateRequest(schemas) {
    return (req, _res, next) => {
        try {
            if (schemas.params) {
                req.params = schemas.params.parse(req.params);
            }
            if (schemas.query) {
                req.query = schemas.query.parse(req.query);
            }
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                next(new RequestValidationError(error.issues));
                return;
            }
            next(error);
        }
    };
}
