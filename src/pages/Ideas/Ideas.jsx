import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import Modal from '../../components/Modal';
import IdeaGenerationForm from './IdeaGenerationForm';
import SpecimenCard from '../../components/SpecimenCard';
import EmptyState from '../../components/EmptyState';
import { GalaxyCard } from '../../components/cosmic';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function Ideas() {
  const { data } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const [sourceIds] = useState(() => {
    if (location.state?.autoOpen && location.state?.sourceProblemIds) {
      return location.state.sourceProblemIds;
    }
    return [];
  });
  
  const [isGenModalOpen, setIsGenModalOpen] = useState(() => {
    return !!(location.state?.autoOpen && location.state?.sourceProblemIds);
  });

  const [viewedIdea, setViewedIdea] = useState(null);

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
        title="Generate Idea"
      >
        <IdeaGenerationForm 
          sourceProblemIds={sourceIds}
          onCancel={() => setIsGenModalOpen(false)}
          onSubmit={handleIdeaGenerated}
        />
      </Modal>

      <Modal
        isOpen={!!viewedIdea}
        onClose={() => setViewedIdea(null)}
        title="Opportunity Details"
      >
        {viewedIdea && (
          <div className="flex flex-col gap-8 pb-4">
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

            <div>
              <span className="text-body-sm font-medium text-muted">Solution</span>
              <p className="text-body-lg mt-1" style={{ color: 'var(--text-primary)' }}>{viewedIdea.solution}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-body-sm font-medium text-muted">Customer</span>
                <p className="text-body-md mt-1" style={{ color: 'var(--text-primary)' }}>{viewedIdea.customer}</p>
              </div>
              <div>
                <span className="text-body-sm font-medium text-muted">Revenue Model</span>
                <p className="text-body-md mt-1" style={{ color: 'var(--text-primary)' }}>{viewedIdea.revenueModel}</p>
              </div>
            </div>

            <div className="p-6 rounded-[10px] mt-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
              <span className="font-label text-muted text-[10px] uppercase tracking-widest block mb-4">Source Problems</span>
              <ul className="flex flex-col gap-3">
                {viewedIdea.sourceProblemIds.map(pid => {
                  const p = data.problems.find(x => x.id === pid);
                  return p ? (
                    <li key={pid} className="text-body-sm" style={{ color: 'var(--text-primary)' }}>{p.problem}</li>
                  ) : null;
                })}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
