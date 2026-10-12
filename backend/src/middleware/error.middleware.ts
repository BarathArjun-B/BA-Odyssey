import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Not Found - ${req.originalUrl}`, 404, 'NOT_FOUND'));
};

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Internal Server Error';
  let details = err.details || [];

  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    details = Object.values(err.errors).map((val: any) => val.message);
  } else if (err.code === 11000) {
    statusCode = 400;
    code = 'DUPLICATE_KEY_ERROR';
    message = 'Duplicate field value entered';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: details.length ? details : undefined,
    },
  });
};
