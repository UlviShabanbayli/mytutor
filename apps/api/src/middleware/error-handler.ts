import type { ErrorHandler, NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ApiError } from '@mytutor/types';

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    const body: ApiError = { error: { code: 'http_error', message: err.message } };
    return c.json(body, err.status);
  }
  console.error(err);
  const body: ApiError = { error: { code: 'internal_error', message: 'Internal server error' } };
  return c.json(body, 500);
};

export const notFoundHandler: NotFoundHandler = (c) => {
  const body: ApiError = { error: { code: 'not_found', message: 'Not found' } };
  return c.json(body, 404);
};
