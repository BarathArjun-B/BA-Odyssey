import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { config } from '../config/env';

const signToken = (id: string, secret: string, expiresIn: string) => {
  return jwt.sign({ id }, secret, { expiresIn: expiresIn as any });
};

const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = signToken(user._id.toString(), config.jwt.secret, config.jwt.expiresIn);
  const refreshToken = signToken(user._id.toString(), config.jwt.refreshSecret, config.jwt.refreshExpiresIn);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict' as const,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(statusCode).json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, username, email, password } = req.body;

  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    throw new AppError('Email or username already exists', 400, 'VALIDATION_ERROR');
  }

  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    password,
  });

  sendTokenResponse(user, 201, res);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
  }

  sendTokenResponse(user, 200, res);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new AppError('No refresh token provided', 401, 'UNAUTHORIZED');
  }

  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('User not found', 401, 'UNAUTHORIZED');
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    throw new AppError('Invalid refresh token', 401, 'UNAUTHORIZED');
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  res.status(200).json({
    success: true,
    data: { user },
  });
});
