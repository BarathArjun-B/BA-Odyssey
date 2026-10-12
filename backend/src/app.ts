import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import authRoutes from './api/v1/routes/auth.routes';
import notesRoutes from './api/v1/routes/notes.routes';
import { notFoundHandler, globalErrorHandler } from './middleware/error.middleware';
import { setupSwagger } from './docs/swagger';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsers
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Logger
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/notes', notesRoutes);

// Swagger
setupSwagger(app);

// Healthcheck
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
