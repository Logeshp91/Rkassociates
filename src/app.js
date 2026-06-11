import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { apiResponse, sendError, sendSuccess } from './utils/apiResponse.js';

const app = express();

const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(apiResponse);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) => sendError(res, 'Too many requests, please try again later', 429)
  })
);

app.get('/health', (_req, res) => {
  return sendSuccess(res, 'API is healthy');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use((_req, res) => {
  return sendError(res, 'Route not found', 404);
});

app.use((error, _req, res, _next) => {
  console.error(error);

  if (error.type === 'entity.parse.failed') {
    return sendError(res, 'Invalid JSON payload', 400);
  }

  if (error.name === 'CastError') {
    return sendError(res, 'Invalid resource id', 400);
  }

  if (error.code === 11000) {
    return sendError(res, 'Duplicate value', 409);
  }

  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors)
      .map((validationError) => validationError.message)
      .join(', ');
    return sendError(res, message || 'Validation failed', 400);
  }

  return sendError(res, 'Internal server error', 500);
});

export default app;
