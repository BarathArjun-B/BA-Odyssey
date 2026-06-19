import { useState } from 'react';
import TagPill from './TagPill';

export default function TagInput({ tags, setTags, placeholder = "Add tag..." }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <TagPill key={tag} tag={tag} onRemove={removeTag} />
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={placeholder}
        className="w-full border rounded-[10px] px-3 py-2 text-body-md cosmic-focus transition-colors"
        style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
      />
      <p className="text-caption text-muted">Press enter or comma to add</p>
    </div>
  );
}
