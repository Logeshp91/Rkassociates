import { validationResult } from 'express-validator';

export function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((error) => `${error.path}: ${error.msg}`)
      .join(', ');

    return res.error(message || 'Validation failed', 400);
  }

  return next();
}
