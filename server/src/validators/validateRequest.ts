import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { z, type AnyZodObject, type ZodError } from 'zod';

export interface RequestValidationSchemas {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

class RequestValidationError extends Error {
  readonly issues: ZodError['issues'];

  constructor(issues: ZodError['issues']) {
    super('Request validation failed');
    this.name = 'RequestValidationError';
    this.issues = issues;
  }
}

export function isRequestValidationError(value: unknown): value is RequestValidationError {
  return value instanceof RequestValidationError;
}

export function validateRequest(schemas: RequestValidationSchemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
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
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        next(new RequestValidationError(error.issues));
        return;
      }

      next(error);
    }
  };
}
