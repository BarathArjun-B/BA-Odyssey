import { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { computeDemandScore, computeStartupPotentialScore, getStatusStamp, getDifficulty } from '../../lib/scoring';

const REVENUE_MODELS = [
  "Subscription", "Marketplace", "Transaction fee", 
  "One-time", "Ads", "Usage-based", "Other"
];

export default function IdeaGenerationForm({ sourceProblemIds, onSubmit, onCancel }) {
  const { data, addIdea } = useData();

  const sourceProblems = useMemo(() => {
    return data.problems.filter(p => sourceProblemIds.includes(p.id));
  }, [data.problems, sourceProblemIds]);

  const [formData, setFormData] = useState({
    customer: '',
    solution: '',
    revenueModel: 'Subscription',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!sourceProblems.length) return;

    // Averages across source problems
    let sumPain = 0, sumBuild = 0, sumDemandScore = 0;
    
    // Frequency heuristic: take the max frequency weight among sources
    const freqWeights = { "Daily": 100, "Weekly": 70, "Monthly": 40, "Rarely": 15, "One-off": 5 };
    let maxFreq = "One-off";
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
    const avgPain = sumPain / N;
    const avgBuild = sumBuild / N;
    const avgDemandScore = sumDemandScore / N;

    const startupScore = computeStartupPotentialScore(avgPain, avgDemandScore, avgBuild, maxFreq);
    const difficulty = getDifficulty(avgBuild);
    const status = getStatusStamp(startupScore);

    const newIdea = {
      id: `i_${Date.now()}`,
      createdAt: new Date().toISOString(),
      sourceProblemIds,
      customer: formData.customer,
      solution: formData.solution,
      revenueModel: formData.revenueModel,
      difficulty,
      startupPotentialScore: startupScore,
      status
    };

    addIdea(newIdea);
    onSubmit(newIdea);
  };

  if (!sourceProblems.length) {
    return <div className="p-4 text-muted">No source problems selected.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-8">
      <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
        <h4 className="text-body-sm font-label uppercase tracking-widest text-muted mb-2">Based on {sourceProblems.length} Problem{sourceProblems.length > 1 ? 's' : ''}</h4>
        <ul className="list-disc list-inside text-body-sm line-clamp-3" style={{ color: 'var(--text-primary)' }}>
          {sourceProblems.map(p => <li key={p.id} className="truncate">{p.problem}</li>)}
        </ul>
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
