export function sendSuccess(res, message = 'Operation completed successfully', data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
}

export function sendError(res, message = 'Internal server error', statusCode = 500) {
  return res.status(statusCode).json({
    status: 'error',
    message
  });
}

export function apiResponse(_req, res, next) {
  res.success = (message, data = {}, statusCode = 200) => sendSuccess(res, message, data, statusCode);
  res.error = (message, statusCode = 500) => sendError(res, message, statusCode);
  return next();
}
