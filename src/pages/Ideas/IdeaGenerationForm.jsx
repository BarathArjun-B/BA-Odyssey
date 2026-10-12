import { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { computeDemandScore, computeStartupPotentialScore, getStatusStamp, getDifficulty } from '../../lib/scoring';

const REVENUE_MODELS = [
  "Subscription", "Marketplace", "Transaction fee", 
  "One-time", "Ads", "Usage-based", "Other"
];

export default function IdeaGenerationForm({ sourceProblemIds = [], onSubmit, onCancel }) {
  const { data, addIdea } = useData();

  const [selectedIds, setSelectedIds] = useState(() => sourceProblemIds);

  const sourceProblems = useMemo(() => {
    return data.problems.filter(p => selectedIds.includes(p.id));
  }, [data.problems, selectedIds]);

  const [formData, setFormData] = useState({
    customer: '',
    solution: '',
    revenueModel: 'Subscription',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleProblemSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.customer.trim() || !formData.solution.trim()) return;

    let avgPain = 7;
    let avgBuild = 6;
    let avgDemandScore = 6;
    let maxFreq = "Weekly";

    if (sourceProblems.length > 0) {
      let sumPain = 0, sumBuild = 0, sumDemandScore = 0;
      const freqWeights = { "Daily": 100, "Weekly": 70, "Monthly": 40, "Rarely": 15, "One-off": 5 };
      let maxFreqWeight = 5;

      sourceProblems.forEach(p => {
        sumPain += p.painLevel;
        sumBuild += p.canIBuild;
        
        const demand = computeDemandScore(p.willingnessToPay, p.peopleAffected, p.marketSizeEstimate);
        sumDemandScore += demand;

        const fw = freqWeights[p.frequency] || 5;
        if (fw > maxFreqWeight) {
          maxFreqWeight = fw;
          maxFreq = p.frequency;
        }
      });

      const N = sourceProblems.length;
      avgPain = sumPain / N;
      avgBuild = sumBuild / N;
      avgDemandScore = sumDemandScore / N;
    }

    const startupScore = computeStartupPotentialScore(avgPain, avgDemandScore, avgBuild, maxFreq);
    const difficulty = getDifficulty(avgBuild);
    const status = getStatusStamp(startupScore);

    const newIdea = {
      id: `i_${Date.now()}`,
      createdAt: new Date().toISOString(),
      sourceProblemIds: selectedIds,
      customer: formData.customer.trim(),
      solution: formData.solution.trim(),
      revenueModel: formData.revenueModel,
      difficulty,
      startupPotentialScore: startupScore,
      status
    };

    addIdea(newIdea);
    onSubmit(newIdea);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-8">
      {/* Problem Selection Section */}
      <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-body-sm font-label uppercase tracking-widest text-muted">
            {sourceProblems.length > 0 ? `Linked Problems (${sourceProblems.length})` : 'Link Source Problems (Optional)'}
          </h4>
        </div>
        {data.problems.length > 0 ? (
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
            {data.problems.map(p => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <div 
                  key={p.id}
                  onClick={() => toggleProblemSelection(p.id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer text-body-sm transition-colors ${
                    isSelected ? 'bg-violet-500/20 border border-violet-500/40 text-primary' : 'bg-black/20 hover:bg-white/5 text-muted'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    readOnly 
                    checked={isSelected}
                    className="rounded border-[var(--border-glass)] text-violet-500 pointer-events-none" 
                  />
                  <span className="truncate flex-1">{p.problem}</span>
                  <span className="text-[11px] font-mono opacity-60">Pain: {p.painLevel}/10</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-body-sm text-muted">No problems logged yet. You can still create an idea directly.</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>Who pays for this? (Customer) *</label>
        <input 
          name="customer"
          required
          type="text"
          value={formData.customer}
          onChange={handleChange}
          placeholder="E.g. Hostel management companies"
          className="w-full rounded-[10px] p-3 text-body-md cosmic-focus" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>Solution *</label>
        <textarea 
          name="solution"
          required
          value={formData.solution}
          onChange={handleChange}
          placeholder="E.g. Plug-in machine sensors reporting live status..."
          className="w-full rounded-[10px] p-3 text-body-md cosmic-focus min-h-[100px]" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>Revenue Model</label>
        <select 
          name="revenueModel"
          value={formData.revenueModel}
          onChange={handleChange}
          className="w-full rounded-[10px] p-3 text-body-md cosmic-focus appearance-none" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
        >
          {REVENUE_MODELS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="sticky bottom-0 backdrop-blur-md pt-4 mt-4 flex items-center justify-end gap-4 pb-2" style={{ background: 'rgba(14, 19, 48, 0.9)', borderTop: '1px solid var(--border-glass)' }}>
        <button 
          type="button"
          onClick={onCancel}
          className="px-6 py-3 font-medium text-body-sm text-muted hover:text-primary transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="btn-primary px-8"
        >
          Generate Idea
        </button>
      </div>
    </form>
  );
}
