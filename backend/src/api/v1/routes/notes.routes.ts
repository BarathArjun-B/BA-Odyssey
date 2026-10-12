import { Router } from 'express';
import { body } from 'express-validator';
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../../../controllers/notes.controller';
import { protect } from '../../../middleware/auth.middleware';
import { validateRequest } from '../../../middleware/validate.middleware';

const router = Router();

// All notes endpoints require verified user authentication
router.use(protect);

router.get('/', getNotes);

router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Note title is required')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('content')
      .notEmpty()
      .withMessage('Note content is required')
      .isLength({ max: 50000 })
      .withMessage('Content cannot exceed 50,000 characters'),
    body('tags')
      .optional()
      .isArray({ max: 20 })
      .withMessage('Tags must be an array with at most 20 items'),
    body('tags.*')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Each tag cannot exceed 50 characters'),
    body('isPinned')
      .optional()
      .isBoolean()
      .withMessage('isPinned must be a boolean value'),
    validateRequest,
  ],
  createNote
);

router.get('/:id', getNoteById);

router.put(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Note title cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('content')
      .optional()
      .notEmpty()
      .withMessage('Note content cannot be empty')
      .isLength({ max: 50000 })
      .withMessage('Content cannot exceed 50,000 characters'),
    body('tags')
      .optional()
      .isArray({ max: 20 })
      .withMessage('Tags must be an array with at most 20 items'),
    body('tags.*')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Each tag cannot exceed 50 characters'),
    body('isPinned')
      .optional()
      .isBoolean()
      .withMessage('isPinned must be a boolean value'),
    validateRequest,
  ],
  updateNote
);

router.delete('/:id', deleteNote);

export default router;
