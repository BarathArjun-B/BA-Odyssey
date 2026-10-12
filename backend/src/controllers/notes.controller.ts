import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Note, normalizeTags } from '../models/Note';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

/**
 * Escapes regex special characters to prevent regex injection and ReDoS
 */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const getNotes = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { q, tag } = req.query;

  const filter: Record<string, any> = { userId };

  // Search by title or content
  if (typeof q === 'string' && q.trim().length > 0) {
    const safeRegex = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ title: safeRegex }, { content: safeRegex }];
  }

  // Filter by tag
  if (typeof tag === 'string' && tag.trim().length > 0) {
    filter.tags = tag.trim().toLowerCase();
  }

  // Pinned notes first, then most recently updated
  const notes = await Note.find(filter).sort({ isPinned: -1, updatedAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      notes,
    },
  });
});

export const getNoteById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid note ID format', 400, 'INVALID_ID');
  }

  const note = await Note.findOne({ _id: id, userId: req.user!._id });

  if (!note) {
    throw new AppError('Note not found', 404, 'NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    data: {
      note,
    },
  });
});

export const createNote = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, tags, isPinned } = req.body;

  // Mass assignment protection: userId is strictly bound from verified auth context
  const note = await Note.create({
    title,
    content,
    tags: tags ? normalizeTags(tags) : [],
    isPinned: typeof isPinned === 'boolean' ? isPinned : false,
    userId: req.user!._id,
  });

  res.status(201).json({
    success: true,
    data: {
      note,
    },
  });
});

export const updateNote = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid note ID format', 400, 'INVALID_ID');
  }

  const note = await Note.findOne({ _id: id, userId: req.user!._id });

  if (!note) {
    throw new AppError('Note not found', 404, 'NOT_FOUND');
  }

  const { title, content, tags, isPinned } = req.body;

  if (typeof title === 'string') {
    note.title = title;
  }
  if (typeof content === 'string') {
    note.content = content;
  }
  if (tags !== undefined) {
    note.tags = normalizeTags(tags);
  }
  if (typeof isPinned === 'boolean') {
    note.isPinned = isPinned;
  }

  await note.save();

  res.status(200).json({
    success: true,
    data: {
      note,
    },
  });
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid note ID format', 400, 'INVALID_ID');
  }

  const note = await Note.findOneAndDelete({ _id: id, userId: req.user!._id });

  if (!note) {
    throw new AppError('Note not found', 404, 'NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});
