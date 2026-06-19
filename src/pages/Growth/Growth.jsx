import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Plus } from 'lucide-react';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';

const TABS = [
  { id: 'books', label: 'Books Read' },
  { id: 'concepts', label: 'Concepts Learned' },
  { id: 'networking', label: 'Networking Goals' },
  { id: 'skillsExperiments', label: 'Skills & Experiments' }
];

export default function Growth() {
  const { data, addGrowthItem } = useData();
  const [activeTab, setActiveTab] = useState('books');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const handleOpenAdd = () => {
    setFormData({});
    setIsAddModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const item = { id: `${activeTab}_${Date.now()}`, ...formData };
    addGrowthItem(activeTab, item);
    setIsAddModalOpen(false);
  };

  const renderAddForm = () => {
    switch (activeTab) {
      case 'books': return (
        <>
          <input name="title" required placeholder="Title" onChange={handleChange} className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus mb-4" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }} />
          <input name="author" required placeholder="Author" onChange={handleChange} className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus mb-4" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }} />
          <textarea name="takeaway" required placeholder="One-line takeaway" onChange={handleChange} className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus min-h-[80px] mb-4" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }} />
          <input name="dateFinished" type="date" required onChange={handleChange} className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus mb-4" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }} />
        </>
      );
      case 'concepts': return (
        <>
          <input name="concept" required placeholder="Concept Name" onChange={handleChange} className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus mb-4" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }} />
          <input name="source" required placeholder="Source (book/course/podcast)" onChange={handleChange} className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus mb-4" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }} />
          <textarea name="explanation" required placeholder="One-line explanation in your own words" onChange={handleChange} className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus min-h-[80px] mb-4" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }} />
        </>
      );
      case 'networking': return (
        <>
          <input name="goal" required placeholder="Goal text" onChange={handleChange} className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus mb-4" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }} />
          <input name="targetDate" type="date" required onChange={handleChange} className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus mb-4" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }} />
          <select name="status" onChange={handleChange} className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus mb-4" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}>
            <option value="Not started">Not started</option>
            <option value="In progress">In progress</option>
            <option value="Done">Done</option>
          </select>
        </>
      );
      case 'skillsExperiments': return (
        <>
          <select name="type" required onChange={handleChange} className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus mb-4" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}>
            <option value="Skill">Skill</option>
            <option value="Experiment">Experiment</option>
          </select>
          <input name="title" required placeholder="Title" onChange={handleChange} className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus mb-4" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }} />
          <textarea name="description" required placeholder="Description" onChange={handleChange} className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus min-h-[80px] mb-4" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }} />
          <select name="status" onChange={handleChange} className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus mb-4" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}>
            <option value="Not started">Not started</option>
            <option value="In progress">In progress</option>
            <option value="Done">Done</option>
          </select>
        </>
      );
      default: return null;
    }
  };

  const renderContent = () => {
    const items = data.growth[activeTab];
    if (items.length === 0) {
      let msg = '';
      if (activeTab === 'books') msg = 'No books logged yet — add the last business book you actually finished.';
      else if (activeTab === 'concepts') msg = 'No concepts logged yet.';
      else if (activeTab === 'networking') msg = 'No networking goals yet.';
      else msg = 'No skills or experiments logged yet.';

      return (
        <EmptyState 
          title="Nothing here yet"
          description={msg}
          action={<button onClick={handleOpenAdd} className="btn-primary">Add first entry</button>}
        />
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="glass-panel p-6 cosmic-hover">
            {activeTab === 'books' && (
              <>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-body-lg font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                  <span className="text-caption text-muted">{item.dateFinished}</span>
                </div>
                <p className="text-body-sm text-muted mb-2">by {item.author}</p>
                <p className="text-body-md italic border-l-2 pl-3" style={{ color: 'var(--text-primary)', borderColor: 'var(--accent-primary)' }}>"{item.takeaway}"</p>
              </>
            )}
            {activeTab === 'concepts' && (
              <>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-body-lg font-medium" style={{ color: 'var(--text-primary)' }}>{item.concept}</h4>
                  <span className="text-caption text-muted">{item.source}</span>
                </div>
                <p className="text-body-md" style={{ color: 'var(--text-primary)' }}>{item.explanation}</p>
              </>
            )}
            {activeTab === 'networking' && (
              <>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-body-lg font-medium" style={{ color: 'var(--text-primary)' }}>{item.goal}</h4>
                  <span className="text-caption px-2 py-1 rounded font-label text-muted" style={{ background: 'var(--border-glass)' }}>{item.status || 'Not started'}</span>
                </div>
                <p className="text-body-sm text-muted">Target: {item.targetDate}</p>
              </>
            )}
            {activeTab === 'skillsExperiments' && (
              <>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-caption px-2 py-1 rounded font-label uppercase" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)' }}>{item.type || 'Skill'}</span>
                    <h4 className="text-body-lg font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                  </div>
                  <span className="text-caption px-2 py-1 rounded font-label text-muted" style={{ background: 'var(--border-glass)' }}>{item.status || 'Not started'}</span>
                </div>
                <p className="text-body-md" style={{ color: 'var(--text-primary)' }}>{item.description}</p>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-24 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-display-lg mb-1" style={{ color: 'var(--text-primary)' }}>Founder Growth</h1>
          <p className="text-body-sm text-muted">
            {data.growth.books.length} Books • {data.growth.concepts.length} Concepts • {data.growth.networking.length} Goals • {data.growth.skillsExperiments.length} Skills
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add entry
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto no-scrollbar" style={{ borderBottom: '1px solid var(--border-glass)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-body-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id ? 'text-ink' : 'border-transparent text-muted hover:text-ink'
            }`}
            style={activeTab === tab.id ? { borderColor: 'var(--accent-primary)', color: 'var(--text-primary)' } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {renderContent()}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={`Add ${TABS.find(t => t.id === activeTab).label}`}>
        <form onSubmit={handleSubmit}>
          {renderAddForm()}
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-muted hover:text-ink font-medium">Cancel</button>
            <button type="submit" className="btn-primary px-6">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
