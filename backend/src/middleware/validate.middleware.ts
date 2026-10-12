import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map(err => ({
      field: err.type === 'field' ? err.path : '',
      message: err.msg,
    }));
    return next(new AppError('Invalid fields provided', 400, 'VALIDATION_ERROR', details));
  }
  next();
};
