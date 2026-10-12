import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Normalizes an array of tags:
 * Trims whitespace, collapses internal whitespace, converts to lowercase,
 * removes empty strings, and deduplicates.
 */
export function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  const normalizedSet = new Set<string>();

  for (const item of tags) {
    if (typeof item === 'string') {
      const cleaned = item.trim().replace(/\s+/g, ' ').toLowerCase();
      if (cleaned.length > 0 && cleaned.length <= 50) {
        normalizedSet.add(cleaned);
      }
    }
  }

  return Array.from(normalizedSet).slice(0, 20);
}

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      maxlength: [50000, 'Content cannot exceed 50,000 characters'],
    },
    tags: {
      type: [String],
      default: [],
      validate: [
        {
          validator: (val: string[]) => Array.isArray(val) && val.length <= 20,
          message: 'Cannot exceed 20 tags per note',
        },
        {
          validator: (val: string[]) => val.every((t) => typeof t === 'string' && t.length <= 50),
          message: 'Each tag cannot exceed 50 characters',
        },
      ],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Note must belong to a user'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to normalize and deduplicate tags
noteSchema.pre('save', function (next) {
  if (this.isModified('tags') && Array.isArray(this.tags)) {
    this.tags = normalizeTags(this.tags);
  }
  next();
});

// Compound indexes for optimal query patterns
noteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ userId: 1, tags: 1 });
noteSchema.index({ title: 'text', content: 'text' });

export const Note = mongoose.model<INote>('Note', noteSchema);
