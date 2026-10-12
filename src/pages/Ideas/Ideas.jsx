import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import Modal from '../../components/Modal';
import IdeaGenerationForm from './IdeaGenerationForm';
import SpecimenCard from '../../components/SpecimenCard';
import EmptyState from '../../components/EmptyState';
import { GalaxyCard } from '../../components/cosmic';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Ideas() {
  const { data, updateIdea, deleteIdea } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const [genSourceIds, setGenSourceIds] = useState(() => {
    if (location.state?.autoOpen && location.state?.sourceProblemIds) {
      return location.state.sourceProblemIds;
    }
    return [];
  });
  
  const [isGenModalOpen, setIsGenModalOpen] = useState(() => {
    return !!(location.state?.autoOpen && location.state?.sourceProblemIds);
  });

  const [viewedIdea, setViewedIdea] = useState(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (location.state?.autoOpen) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Sort ideas by startup potential score descending
  const sortedIdeas = useMemo(() => {
    return [...data.ideas].sort((a, b) => b.startupPotentialScore - a.startupPotentialScore);
  }, [data.ideas]);

  const handleIdeaGenerated = (newIdea) => {
    setIsGenModalOpen(false);
    setViewedIdea(newIdea);
  };

  if (data.ideas.length === 0 && !isGenModalOpen) {
    return (
      <EmptyState
        title="No galaxies mapped yet"
        description="No startup opportunities found yet. Pick a problem from your Journal and turn it into one."
        action={
          <button 
            onClick={() => navigate('/journal')}
            className="btn-primary flex items-center gap-2"
          >
            Go to Journal
          </button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-24 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-display-lg mb-1" style={{ color: 'var(--text-primary)' }}>Opportunity Catalogue</h1>
          <p className="text-body-sm text-muted">
            {data.ideas.length} {data.ideas.length === 1 ? 'galaxy' : 'galaxies'} mapped
          </p>
        </div>
        <button 
          onClick={() => {
            setGenSourceIds([]);
            setIsGenModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" /> Generate Idea
        </button>
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {sortedIdeas.map((idea, idx) => {
            const numericId = data.ideas.length - data.ideas.findIndex(x => x.id === idea.id);
            return (
              <GalaxyCard key={idea.id} idea={idea} index={idx}>
                <SpecimenCard 
                  id={idea.id}
                  numericId={numericId}
                  title={idea.solution}
                  status={idea.status}
                  score={idea.startupPotentialScore}
                  isIdea={true}
                  onClick={() => setViewedIdea(idea)}
                >
                  <div className="flex flex-col gap-2 mt-4 text-body-sm text-muted">
                    <div>Customer: <span style={{ color: 'var(--text-primary)' }}>{idea.customer}</span></div>
                    <div>Model: <span style={{ color: 'var(--text-primary)' }}>{idea.revenueModel}</span></div>
                  </div>
                </SpecimenCard>
              </GalaxyCard>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <Modal 
        isOpen={isGenModalOpen} 
        onClose={() => setIsGenModalOpen(false)}
        title="Generate Startup Idea"
      >
        <IdeaGenerationForm 
          sourceProblemIds={genSourceIds}
          onCancel={() => setIsGenModalOpen(false)}
          onSubmit={handleIdeaGenerated}
        />
      </Modal>

      <Modal
        isOpen={!!viewedIdea}
        onClose={() => {
          setViewedIdea(null);
          setIsConfirmingDelete(false);
        }}
        title="Opportunity Details"
      >
        {viewedIdea && (
          <div className="flex flex-col gap-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label text-muted text-body-sm uppercase tracking-widest block mb-2">Startup Potential</span>
                <span className="text-display-xl" style={{ color: 'var(--status-opportunity-violet)' }}>{viewedIdea.startupPotentialScore}</span>
              </div>
              <div className="text-right">
                <span className="font-label text-muted text-body-sm uppercase tracking-widest block mb-2">Difficulty</span>
                <span className={cn(
                  "text-body-lg font-bold"
                )} style={{ color: viewedIdea.difficulty === 'Low' ? 'var(--status-success-emerald)' : viewedIdea.difficulty === 'High' ? 'var(--status-alert-ember)' : 'var(--status-achievement-gold)' }}>
                  {viewedIdea.difficulty}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-[var(--border-glass)]">
              <span className="text-body-sm font-medium text-muted">Validation Stage:</span>
              <select
                value={viewedIdea.status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  updateIdea(viewedIdea.id, { status: newStatus });
                  setViewedIdea(prev => ({ ...prev, status: newStatus }));
                }}
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-body-sm text-primary focus:outline-none focus:border-violet-500"
              >
                <option value="HIGH POTENTIAL">HIGH POTENTIAL</option>
                <option value="VALIDATED">VALIDATED</option>
                <option value="NEEDS DATA">NEEDS DATA</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div>
              <span className="text-body-sm font-medium text-muted">Solution</span>
              <p className="text-body-lg mt-1" style={{ color: 'var(--text-primary)' }}>{viewedIdea.solution}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-body-sm font-medium text-muted">Customer Target</span>
                <p className="text-body-md mt-1" style={{ color: 'var(--text-primary)' }}>{viewedIdea.customer}</p>
              </div>
              <div>
                <span className="text-body-sm font-medium text-muted">Monetization Model</span>
                <p className="text-body-md mt-1" style={{ color: 'var(--text-primary)' }}>{viewedIdea.revenueModel}</p>
              </div>
            </div>

            {/* Scoring Methodology Breakdown */}
            <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/5">
              <div className="flex items-center gap-2 mb-2 text-violet-400">
                <HelpCircle className="w-4 h-4" />
                <span className="text-caption font-label uppercase tracking-widest font-bold">Scoring Breakdown</span>
              </div>
              <p className="text-body-sm text-muted mb-3 leading-relaxed">
                Evaluated via rule-based weighted opportunity algorithm:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[12px] font-mono">
                <div className="p-2 rounded bg-black/30 border border-white/5">
                  <div className="text-muted text-[10px] uppercase">Pain Weight</div>
                  <div className="text-emerald-400 font-bold mt-1">30%</div>
                </div>
                <div className="p-2 rounded bg-black/30 border border-white/5">
                  <div className="text-muted text-[10px] uppercase">Demand/WTP</div>
                  <div className="text-cyan-400 font-bold mt-1">40%</div>
                </div>
                <div className="p-2 rounded bg-black/30 border border-white/5">
                  <div className="text-muted text-[10px] uppercase">Builder Fit</div>
                  <div className="text-amber-400 font-bold mt-1">20%</div>
                </div>
                <div className="p-2 rounded bg-black/30 border border-white/5">
                  <div className="text-muted text-[10px] uppercase">Frequency</div>
                  <div className="text-purple-400 font-bold mt-1">10%</div>
                </div>
              </div>
            </div>

            {/* Source Problems */}
            {viewedIdea.sourceProblemIds?.length > 0 && (
              <div className="p-4 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                <span className="font-label text-muted text-[10px] uppercase tracking-widest block mb-2">Linked Problems</span>
                <ul className="flex flex-col gap-2">
                  {viewedIdea.sourceProblemIds.map(pid => {
                    const p = data.problems.find(x => x.id === pid);
                    return p ? (
                      <li key={pid} className="text-body-sm flex items-center justify-between" style={{ color: 'var(--text-primary)' }}>
                        <span className="truncate">{p.problem}</span>
                        <span className="text-muted text-xs font-mono">Pain {p.painLevel}/10</span>
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            )}

            {/* Actions & Delete Confirmation */}
            <div className="pt-4 border-t border-[var(--border-glass)] flex items-center justify-between">
              {isConfirmingDelete ? (
                <div className="flex items-center gap-3 w-full justify-between">
                  <span className="text-body-sm text-red-400">Delete this opportunity?</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(false)}
                      className="px-3 py-1.5 rounded-lg text-body-sm text-muted hover:text-primary transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteIdea(viewedIdea.id);
                        setViewedIdea(null);
                        setIsConfirmingDelete(false);
                      }}
                      className="px-4 py-1.5 rounded-lg text-body-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="flex items-center gap-2 text-body-sm text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete Opportunity
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
