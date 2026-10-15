import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Plus, Pin, Edit2, Trash2, X, Tag, 
  Loader2, AlertCircle, CheckCircle2 
} from 'lucide-react';
import notesService from '../../services/notesService';
import Modal from '../../components/Modal';
import TagInput from '../../components/TagInput';
import TagPill from '../../components/TagPill';
import EmptyState from '../../components/EmptyState';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export default function Notes() {
  const { checkAuth } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [pinnedOnly, setPinnedOnly] = useState(false);

  // Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null); // null = new note, object = editing existing note
  const [deletingNote, setDeletingNote] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Form Field State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
    isPinned: false,
  });

  // Fetch Notes from MongoDB API
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (searchTerm.trim()) params.q = searchTerm.trim();
      if (selectedTag) params.tag = selectedTag;
      if (pinnedOnly) params.pinned = 'true';

      const response = await notesService.getNotes(params);
      const list = response?.data?.notes || (Array.isArray(response?.data) ? response.data : []);
      setNotes(list);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch notes';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedTag, pinnedOnly]);

  const handleRetry = useCallback(async () => {
    try {
      if (checkAuth) {
        await checkAuth();
      }
    } catch {
      // Proceed to fetchNotes regardless
    }
    fetchNotes();
  }, [checkAuth, fetchNotes]);

  // Initial load and filter query effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes();
    }, 250); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchNotes]);

  // Auto-dismiss feedback toast
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Extract all unique tags across all notes currently in state
  const allTags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach((note) => {
      note.tags?.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  // Open Create Note Modal
  const handleOpenCreate = () => {
    setEditingNote(null);
    setFormData({
      title: '',
      content: '',
      tags: selectedTag ? [selectedTag] : [],
      isPinned: false,
    });
    setFormError(null);
    setIsEditorOpen(true);
  };

  // Open Edit Note Modal
  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title || '',
      content: note.content || '',
      tags: Array.isArray(note.tags) ? [...note.tags] : [],
      isPinned: Boolean(note.isPinned),
    });
    setFormError(null);
    setIsEditorOpen(true);
  };

  // Toggle Pin on a Note immediately
  const handleTogglePin = async (note) => {
    try {
      const updated = await notesService.updateNote(note._id, {
        isPinned: !note.isPinned,
      });
      const updatedNote = updated?.data?.note || updated?.data;
      if (updatedNote) {
        setNotes((prev) =>
          prev.map((n) => (n._id === note._id ? updatedNote : n))
        );
        setFeedback({
          type: 'success',
          message: updatedNote.isPinned ? 'Note pinned to top' : 'Note unpinned',
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update pin status',
      });
    }
  };

  // Submit Note (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!formData.content.trim()) {
      setFormError('Content is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      if (editingNote) {
        // Update
        const response = await notesService.updateNote(editingNote._id, formData);
        const updatedNote = response?.data?.note || response?.data;
        if (updatedNote) {
          setNotes((prev) =>
            prev.map((n) => (n._id === editingNote._id ? updatedNote : n))
          );
          setFeedback({ type: 'success', message: 'Note updated successfully' });
        }
      } else {
        // Create
        const response = await notesService.createNote(formData);
        const newNote = response?.data?.note || response?.data;
        if (newNote) {
          setNotes((prev) => [newNote, ...prev]);
          setFeedback({ type: 'success', message: 'Note created successfully' });
        }
      }

      setIsEditorOpen(false);
      // Re-fetch to guarantee sort ordering and count
      fetchNotes();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save note');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingNote) return;
    try {
      setIsSubmitting(true);
      await notesService.deleteNote(deletingNote._id);
      setNotes((prev) => prev.filter((n) => n._id !== deletingNote._id));
      setFeedback({ type: 'success', message: 'Note deleted successfully' });
      setDeletingNote(null);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete note',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format timestamp helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Split into pinned and unpinned lists
  const pinnedNotes = useMemo(() => notes.filter((n) => n.isPinned), [notes]);
  const otherNotes = useMemo(() => notes.filter((n) => !n.isPinned), [notes]);

  const hasFiltersActive = Boolean(searchTerm.trim() || selectedTag || pinnedOnly);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-24 md:pb-8">
      {/* Toast Feedback */}
      {feedback && (
        <div 
          className={cn(
            "fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl transition-all duration-300 text-body-sm font-medium border",
            feedback.type === 'success' 
              ? "bg-emerald-950/90 text-emerald-200 border-emerald-800/80" 
              : "bg-red-950/90 text-red-200 border-red-800/80"
          )}
          style={{ backdropFilter: 'blur(12px)' }}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
          <button 
            onClick={() => setFeedback(null)} 
            className="ml-2 hover:opacity-75 transition-opacity"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-display-lg" style={{ color: 'var(--text-primary)' }}>Notes</h1>
            <span 
              className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium"
              style={{ 
                background: 'rgba(139, 92, 246, 0.15)', 
                color: 'var(--accent-secondary)',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}
            >
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </span>
          </div>
          <p className="text-body-sm text-muted mt-1">
            Capture founder reflections, meeting minutes, and tactical observations.
          </p>
        </div>

        <button 
          onClick={handleOpenCreate}
          className="btn-primary flex items-center gap-2 shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Toolbar & Filter Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="premium-search-container max-w-md w-full relative">
            <Search 
              className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" 
              style={{ color: 'rgba(255, 255, 255, 0.4)' }} 
            />
            <input 
              type="text"
              placeholder="Search notes by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="premium-search-input pl-11 pr-10 w-full"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-primary transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => setPinnedOnly((prev) => !prev)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border",
                pinnedOnly
                  ? "border-[var(--accent-primary)] text-white shadow-sm"
                  : "border-white/10 text-muted hover:text-white"
              )}
              style={{
                background: pinnedOnly ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.03)',
              }}
            >
              <Pin className={cn("w-3.5 h-3.5", pinnedOnly && "fill-current text-[var(--accent-secondary)]")} />
              <span>Pinned Only</span>
            </button>

            {hasFiltersActive && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTag('');
                  setPinnedOnly(false);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-muted hover:text-white transition-colors border border-white/5"
                style={{ background: 'rgba(255, 255, 255, 0.02)' }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Tag Pills Filter Row */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 custom-scrollbar">
            <span className="text-[11px] font-mono text-muted uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
              <Tag className="w-3 h-3" />
              Tags:
            </span>
            <button
              onClick={() => setSelectedTag('')}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs transition-colors shrink-0 border",
                !selectedTag
                  ? "border-[var(--accent-primary)] text-white"
                  : "border-transparent text-muted hover:text-white"
              )}
              style={{
                background: !selectedTag ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              }}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs transition-colors shrink-0 border",
                  selectedTag === tag
                    ? "border-[var(--accent-primary)] text-white"
                    : "border-transparent text-muted hover:text-white"
                )}
                style={{
                  background: selectedTag === tag ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div 
          className="p-4 rounded-xl flex items-center justify-between gap-3 text-red-200 border border-red-800/80"
          style={{ background: 'rgba(127, 29, 29, 0.3)' }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={handleRetry}
            className="px-3 py-1 rounded bg-red-900/50 hover:bg-red-800 text-xs font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-secondary)]" />
          <p className="font-catalogue text-sm tracking-wide">Retrieving notes from orbit...</p>
        </div>
      ) : notes.length === 0 ? (
        /* Empty States */
        hasFiltersActive ? (
          <EmptyState
            title="No matching notes"
            description="No notes matched your search query or active tag filters."
            action={
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTag('');
                  setPinnedOnly(false);
                }}
                className="btn-secondary"
              >
                Clear all filters
              </button>
            }
          />
        ) : (
          <EmptyState
            title="No notes captured yet"
            description="Start recording tactical thoughts, meeting highlights, and reflections."
            action={
              <button onClick={handleOpenCreate} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Create your first note</span>
              </button>
            }
          />
        )
      ) : (
        /* Notes Content Grid */
        <div className="flex flex-col gap-8">
          {/* PINNED SECTION */}
          {pinnedNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <Pin className="w-4 h-4 text-[var(--accent-secondary)] fill-current" />
                <h2 className="text-caption font-mono uppercase tracking-wider text-muted">
                  Pinned Notes ({pinnedNotes.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={handleOpenEdit}
                    onDelete={setDeletingNote}
                    onTogglePin={handleTogglePin}
                    onTagClick={(tag) => setSelectedTag(tag)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* OTHER / ALL NOTES SECTION */}
          {otherNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <div className="flex items-center gap-2 mb-3 px-1">
                  <h2 className="text-caption font-mono uppercase tracking-wider text-muted">
                    Other Notes ({otherNotes.length})
                  </h2>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={handleOpenEdit}
                    onDelete={setDeletingNote}
                    onTogglePin={handleTogglePin}
                    onTagClick={(tag) => setSelectedTag(tag)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT NOTE MODAL */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => !isSubmitting && setIsEditorOpen(false)}
        title={editingNote ? 'Edit Note' : 'New Note'}
      >
        <form onSubmit={handleSubmitForm} className="flex flex-col gap-4 pt-2">
          {formError && (
            <div className="p-3 rounded-lg text-xs bg-red-950/80 border border-red-800 text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-caption font-mono uppercase tracking-wider text-muted">
                Title <span className="text-red-400">*</span>
              </label>
              <span className="text-[10px] font-mono text-muted">
                {formData.title.length}/200
              </span>
            </div>
            <input
              type="text"
              required
              maxLength={200}
              placeholder="e.g. Q3 Customer Discovery Insights"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border rounded-[10px] px-3.5 py-2.5 text-body-md cosmic-focus transition-colors"
              style={{
                background: 'var(--surface-card)',
                borderColor: 'var(--border-glass)',
                color: 'var(--text-primary)',
              }}
              autoFocus
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-caption font-mono uppercase tracking-wider text-muted">
                Content <span className="text-red-400">*</span>
              </label>
              <span className="text-[10px] font-mono text-muted">
                {formData.content.length.toLocaleString()}/50,000
              </span>
            </div>
            <textarea
              required
              maxLength={50000}
              rows={8}
              placeholder="Write your note here... (Markdown & plain text supported)"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full border rounded-[10px] px-3.5 py-2.5 text-body-sm cosmic-focus transition-colors custom-scrollbar"
              style={{
                background: 'var(--surface-card)',
                borderColor: 'var(--border-glass)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-caption font-mono uppercase tracking-wider text-muted mb-1.5">
              Tags (Up to 20)
            </label>
            <TagInput
              tags={formData.tags}
              setTags={(tags) => setFormData({ ...formData, tags })}
              placeholder="Add tag (e.g. market, strategy)..."
            />
          </div>

          {/* Pin to Top Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-900 cursor-pointer"
              />
              <span className="text-body-sm text-[var(--text-primary)] flex items-center gap-1.5">
                <Pin className={cn("w-3.5 h-3.5", formData.isPinned && "text-[var(--accent-secondary)] fill-current")} />
                Pin this note to the top
              </span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsEditorOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingNote ? 'Save Changes' : 'Create Note'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(deletingNote)}
        onClose={() => !isSubmitting && setDeletingNote(null)}
        title="Delete Note"
        fullScreenOnMobile={false}
      >
        <div className="flex flex-col gap-4 pt-2">
          <p className="text-body-sm text-muted">
            Are you sure you want to permanently delete{' '}
            <strong className="text-white">"{deletingNote?.title}"</strong>? This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setDeletingNote(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors flex items-center gap-2 shadow-sm"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Delete Note</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Individual Note Card Component
function NoteCard({ note, onEdit, onDelete, onTogglePin, onTagClick, formatDate }) {
  return (
    <div 
      className={cn(
        "glass-panel p-5 flex flex-col justify-between transition-all duration-200 group relative border",
        note.isPinned 
          ? "border-[rgba(139,92,246,0.35)] shadow-[0_4px_24px_rgba(139,92,246,0.08)]" 
          : "border-[var(--border-glass)] hover:border-[rgba(139,92,246,0.4)]"
      )}
      style={{
        background: note.isPinned 
          ? 'linear-gradient(180deg, rgba(139, 92, 246, 0.06) 0%, rgba(10, 10, 16, 0.8) 100%)' 
          : 'var(--surface-glass)',
      }}
    >
      {/* Top Bar: Title & Pin Button */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 
            className="font-catalogue text-display-xs font-semibold break-words flex-1 leading-snug"
            style={{ color: 'var(--text-primary)' }}
          >
            {note.title}
          </h3>
          <button
            type="button"
            onClick={() => onTogglePin(note)}
            className={cn(
              "p-1.5 rounded-lg transition-colors shrink-0",
              note.isPinned
                ? "text-[var(--accent-secondary)] hover:text-purple-300 bg-purple-500/10"
                : "text-muted hover:text-white bg-white/5 opacity-60 group-hover:opacity-100"
            )}
            title={note.isPinned ? "Unpin note" : "Pin note to top"}
            aria-label={note.isPinned ? "Unpin note" : "Pin note to top"}
          >
            <Pin className={cn("w-3.5 h-3.5", note.isPinned && "fill-current")} />
          </button>
        </div>

        {/* Note Content (max lines clamped with preview) */}
        <p 
          className="text-body-sm whitespace-pre-wrap break-words line-clamp-6 text-muted mb-4 font-normal leading-relaxed"
          style={{ color: 'rgba(255, 255, 255, 0.72)' }}
        >
          {note.content}
        </p>
      </div>

      {/* Card Footer: Tags & Actions */}
      <div className="pt-3 border-t border-white/5 flex flex-col gap-3">
        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            {note.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagClick?.(tag)}
                className="cursor-pointer hover:scale-105 transition-transform"
                title={`Filter by #${tag}`}
              >
                <TagPill tag={tag} />
              </button>
            ))}
          </div>
        )}

        {/* Date and Action Buttons */}
        <div className="flex items-center justify-between text-xs text-muted">
          <span className="font-mono text-[11px] opacity-75">
            {formatDate(note.updatedAt || note.createdAt)}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(note)}
              className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors"
              title="Edit note"
              aria-label="Edit note"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(note)}
              className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete note"
              aria-label="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
