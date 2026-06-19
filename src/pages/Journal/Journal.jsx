import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import Modal from '../../components/Modal';
import NewEntryForm from './NewEntryForm';
import SpecimenCard from '../../components/SpecimenCard';
import EmptyState from '../../components/EmptyState';
import { PlanetCard } from '../../components/cosmic';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutGrid, List, Plus, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Journal() {
  const { data } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Handle auto-open from Discover page
  useEffect(() => {
    if (location.state?.autoOpen) {
      setIsModalOpen(true);
      // Clean up state so refresh doesn't reopen
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set();
    data.problems.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [data.problems]);

  const filteredProblems = useMemo(() => {
    return data.problems.filter(p => {
      const matchSearch = p.problem.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.whoFaces.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTag = selectedTag ? p.tags?.includes(selectedTag) : true;
      return matchSearch && matchTag;
    });
  }, [data.problems, searchTerm, selectedTag]);

  const toggleSelection = (id) => {
    const newSel = new Set(selectedIds);
    if (newSel.has(id)) newSel.delete(id);
    else newSel.add(id);
    setSelectedIds(newSel);
  };

  const handleGenerateIdea = () => {
    navigate('/ideas', { state: { sourceProblemIds: Array.from(selectedIds), autoOpen: true } });
  };

  if (data.problems.length === 0 && !isModalOpen) {
    return (
      <EmptyState
        title="No planets discovered yet"
        description="Your first discovery is one annoying moment away."
        action={
          <div className="flex gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Entry
            </button>
            <button 
              onClick={() => navigate('/discover')}
              className="btn-secondary"
            >
              Discover
            </button>
          </div>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-24 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-lg mb-1" style={{ color: 'var(--text-primary)' }}>Problem Journal</h1>
          <p className="text-body-sm text-muted">
            {data.problems.length} {data.problems.length === 1 ? 'planet' : 'planets'} discovered
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary hidden md:flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-panel p-2">
        <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg pl-9 pr-3 py-2 text-body-sm cosmic-focus outline-none"
            />
          </div>
          <select 
            value={selectedTag}
            onChange={e => setSelectedTag(e.target.value)}
            className="rounded-lg px-3 py-2 text-body-sm cosmic-focus outline-none max-w-[150px]"
          >
            <option value="">All Tags</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="hidden sm:flex items-center rounded-lg p-1 shrink-0" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)' }}>
          <button 
            onClick={() => setViewMode('grid')}
            className={cn("p-1.5 rounded-md transition-colors", viewMode === 'grid' ? "text-primary" : "text-muted hover:text-primary")}
            style={viewMode === 'grid' ? { background: 'rgba(139,92,246,0.2)' } : {}}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={cn("p-1.5 rounded-md transition-colors", viewMode === 'table' ? "text-primary" : "text-muted hover:text-primary")}
            style={viewMode === 'table' ? { background: 'rgba(139,92,246,0.2)' } : {}}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' || window.innerWidth < 1024 ? (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProblems.map((p, idx) => {
              const numericId = data.problems.length - data.problems.findIndex(x => x.id === p.id);
              const isSelected = selectedIds.has(p.id);

              return (
                <PlanetCard key={p.id} problem={p} index={idx} className="group">
                  <div 
                    onClick={() => toggleSelection(p.id)}
                    className={cn(
                      "absolute top-4 right-4 z-20 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors",
                      isSelected ? "text-paper" : "text-transparent opacity-0 group-hover:opacity-100"
                    )}
                    style={isSelected 
                      ? { borderColor: 'var(--accent-primary)', background: 'var(--accent-primary)' } 
                      : { borderColor: 'var(--border-glass)', background: 'rgba(14,19,48,0.8)' }
                    }
                  >
                    <Plus className={cn("w-4 h-4", isSelected ? "rotate-45" : "")} />
                  </div>
                  <SpecimenCard 
                    id={p.id}
                    numericId={numericId}
                    title={p.problem}
                    tags={p.tags}
                    painLevel={p.painLevel}
                    className={isSelected ? "ring-2 ring-electric-purple" : ""}
                  >
                    <div className="flex flex-col gap-2 mt-4 text-body-sm text-muted">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `rgba(248, 113, 113, ${p.painLevel/10})` }} />
                        Pain: {p.painLevel}/10
                      </div>
                      <div>Who: <span style={{ color: 'var(--text-primary)' }}>{p.whoFaces}</span></div>
                    </div>
                  </SpecimenCard>
                </PlanetCard>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="overflow-x-auto glass-panel rounded-[10px]">
          <table className="w-full text-left text-body-sm">
            <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)' }}>
              <tr>
                <th className="p-4 w-12"></th>
                <th className="p-4 font-label uppercase text-[10px] tracking-widest text-muted">ID</th>
                <th className="p-4 font-label uppercase text-[10px] tracking-widest text-muted">Date</th>
                <th className="p-4 font-label uppercase text-[10px] tracking-widest w-1/3 text-muted">Problem</th>
                <th className="p-4 font-label uppercase text-[10px] tracking-widest text-muted">Pain</th>
                <th className="p-4 font-label uppercase text-[10px] tracking-widest text-muted">WTP</th>
                <th className="p-4 font-label uppercase text-[10px] tracking-widest text-muted">Tags</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.map((p, idx) => {
                const numericId = data.problems.length - data.problems.findIndex(x => x.id === p.id);
                const isSelected = selectedIds.has(p.id);
                return (
                  <tr key={p.id} className={cn("transition-colors cursor-pointer")} style={{ borderBottom: '1px solid var(--border-glass)', ...(isSelected ? { background: 'rgba(139,92,246,0.08)' } : {}) }} onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }} onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '' }}>
                    <td className="p-4" onClick={() => toggleSelection(p.id)}>
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                      )} style={isSelected ? { background: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' } : { borderColor: 'var(--border-glass)' }}>
                        {isSelected && <div className="w-2 h-2 rounded-sm" style={{ background: 'var(--text-primary)' }} />}
                      </div>
                    </td>
                    <td className="p-4 text-mono-id text-muted">No. {String(numericId).padStart(4, '0')}</td>
                    <td className="p-4 text-mono-id">{p.date}</td>
                    <td className="p-4 truncate max-w-xs" style={{ color: 'var(--text-primary)' }}>{p.problem}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `rgba(248, 113, 113, ${p.painLevel/10})` }} />
                        {p.painLevel}
                      </div>
                    </td>
                    <td className="p-4">{p.willingnessToPay}</td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {p.tags?.slice(0,2).map(t => <span key={t} className="px-1.5 py-0.5 rounded text-[10px] font-label uppercase" style={{ background: 'rgba(139,92,246,0.12)', color: 'var(--accent-secondary)' }}>{t}</span>)}
                        {p.tags?.length > 2 && <span className="text-[10px] text-muted">+{p.tags.length - 2}</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-8">
          <div className="rounded-full px-6 py-3 flex items-center gap-4 shadow-lg" style={{ background: 'rgba(14, 19, 48, 0.95)', border: '1px solid var(--border-glass)', backdropFilter: 'blur(16px)' }}>
            <span className="font-medium text-body-sm" style={{ color: 'var(--text-primary)' }}>{selectedIds.size} selected</span>
            <div className="w-px h-4" style={{ background: 'var(--border-glass)' }} />
            <button 
              onClick={handleGenerateIdea}
              className="btn-primary flex items-center gap-2"
            >
              Generate Idea <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* New Entry Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Log a Problem"
      >
        <NewEntryForm 
          initialPrompt={location.state?.prompt || ''} 
          onSubmit={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}
