import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { User, IUser } from '../models/User';
import { config } from '../config/env';

interface JwtPayload {
  id: string;
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route', 401, 'UNAUTHORIZED'));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists', 401, 'UNAUTHORIZED'));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route', 401, 'UNAUTHORIZED'));
  }
});

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('User role not authorized to access this route', 403, 'FORBIDDEN'));
    }
    next();
  };
};
