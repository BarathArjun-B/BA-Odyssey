import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import ScoreSlider from '../../components/ScoreSlider';
import TagInput from '../../components/TagInput';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Rarely", "One-off"];
const MARKET_SIZES = ["Niche", "Medium", "Large", "Massive"];

export default function NewEntryForm({ onSubmit, initialPrompt = '', initialData = null }) {
  const { addProblem, updateProblem } = useData();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [formData, setFormData] = useState({
    problem: initialPrompt,
    whoFaces: '',
    frequency: 'Daily',
    currentSolution: '',
    whyBad: '',
    painLevel: 5,
    peopleAffected: 5,
    willingnessToPay: 5,
    canIBuild: 5,
    marketSizeEstimate: 'Medium',
    marketSizeNote: '',
    myIdea: '',
    notes: '',
    tags: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
      setShowAdvanced(true);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSlider = (name, val) => {
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleTags = (tags) => {
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.problem || !formData.whoFaces) return;

    if (initialData?.id) {
      updateProblem(initialData.id, formData);
      onSubmit();
    } else {
      const newProblem = {
        id: `p_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        ...formData
      };
      addProblem(newProblem);
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-8">
      {/* 1. The Problem */}
      <section className="flex flex-col gap-4">
        <h3 className="text-body-sm font-label uppercase tracking-widest text-muted pb-2" style={{ borderBottom: '1px solid var(--border-glass)' }}>1. The Problem</h3>
        
        <div className="flex flex-col gap-1">
          <label className="text-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>What is the problem? *</label>
          <textarea 
            name="problem"
            required
            autoFocus
            value={formData.problem}
            onChange={handleChange}
            placeholder="E.g. Hostel laundry queue has no visibility..."
            className="w-full border rounded-[10px] p-3 text-body-md min-h-[80px] cosmic-focus"
            style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-body-sm font-medium text-ink">Who faces it? *</label>
            <input 
              name="whoFaces"
              required
              type="text"
              value={formData.whoFaces}
              onChange={handleChange}
              placeholder="E.g. Hostel students"
              className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus"
              style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-body-sm font-medium text-ink">Frequency *</label>
            <select 
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full border rounded-[10px] p-3 text-body-md appearance-none cosmic-focus"
              style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
            >
              {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </section>

      {!showAdvanced ? (
        <button 
          type="button" 
          onClick={() => setShowAdvanced(true)}
          className="flex items-center gap-2 font-medium text-body-sm hover:underline w-fit"
          style={{ color: 'var(--accent-primary)' }}
        >
          Add detail (optional) <ChevronDown className="w-4 h-4" />
        </button>
      ) : (
        <>
          {/* 2. The Current State */}
          <section className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-body-sm font-label uppercase tracking-widest text-muted border-b border-line pb-2">2. The Current State</h3>
            
            <div className="flex flex-col gap-1">
              <label className="text-body-sm font-medium text-ink">Current solution?</label>
              <input 
                name="currentSolution"
                type="text"
                value={formData.currentSolution}
                onChange={handleChange}
                placeholder="How do they solve it right now?"
                className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus"
                style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-body-sm font-medium text-ink">Why is the current solution bad?</label>
              <textarea 
                name="whyBad"
                value={formData.whyBad}
                onChange={handleChange}
                placeholder="E.g. Wastes 10-15 minutes per trip..."
                className="w-full border rounded-[10px] p-3 text-body-md min-h-[80px] cosmic-focus"
                style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />
            </div>
          </section>

          {/* 3. The Signal */}
          <section className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-300 delay-75">
            <h3 className="text-body-sm font-label uppercase tracking-widest text-muted border-b border-line pb-2 mb-2">3. The Signal</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <ScoreSlider 
                label="Pain level" 
                value={formData.painLevel} 
                onChange={(val) => handleSlider('painLevel', val)}
                leftLabel="Minor" rightLabel="Severe"
                colorClass="text-pain-high"
              />
              <ScoreSlider 
                label="People affected" 
                value={formData.peopleAffected} 
                onChange={(val) => handleSlider('peopleAffected', val)}
                leftLabel="Just me" rightLabel="Massive"
              />
              <ScoreSlider 
                label="Willingness to pay" 
                value={formData.willingnessToPay} 
                onChange={(val) => handleSlider('willingnessToPay', val)}
                leftLabel="Won't pay" rightLabel="High WTP"
                colorClass="text-demand-high"
              />
              <ScoreSlider 
                label="Can I build this?" 
                value={formData.canIBuild} 
                onChange={(val) => handleSlider('canIBuild', val)}
                leftLabel="No code" rightLabel="Expert"
              />
            </div>
          </section>

          {/* 4. Your Thinking */}
          <section className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300 delay-150">
            <h3 className="text-body-sm font-label uppercase tracking-widest text-muted border-b border-line pb-2">4. Your Thinking</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-body-sm font-medium text-ink">Market Size Estimate</label>
                <select 
                  name="marketSizeEstimate"
                  value={formData.marketSizeEstimate}
                  onChange={handleChange}
                  className="w-full border rounded-[10px] p-3 text-body-md appearance-none cosmic-focus"
                  style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                >
                  {MARKET_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-body-sm font-medium text-ink">Market Size Note</label>
                <input 
                  name="marketSizeNote"
                  type="text"
                  value={formData.marketSizeNote}
                  onChange={handleChange}
                  placeholder="E.g. ~40k students per network"
                  className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus"
                  style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-body-sm font-medium text-ink">My Idea (optional)</label>
              <textarea 
                name="myIdea"
                value={formData.myIdea}
                onChange={handleChange}
                placeholder="If you already have a solution in mind..."
                className="w-full border rounded-[10px] p-3 text-body-md min-h-[80px] cosmic-focus"
                style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-body-sm font-medium text-ink">Tags</label>
              <TagInput tags={formData.tags} setTags={handleTags} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-body-sm font-medium text-ink">Notes</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any other details..."
                className="w-full border rounded-[10px] p-3 text-body-md min-h-[60px] cosmic-focus"
                style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
              />
            </div>
          </section>
        </>
      )}

      {/* Sticky Bottom Actions */}
      <div className="sticky bottom-0 backdrop-blur-md pt-4 mt-4 flex items-center justify-end gap-4 pb-2" style={{ background: 'rgba(14, 19, 48, 0.9)', borderTop: '1px solid var(--border-glass)' }}>
        <button 
          type="button"
          onClick={onSubmit}
          className="px-6 py-3 font-medium text-body-sm text-muted hover:text-primary transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={!formData.problem || !formData.whoFaces}
          className="btn-primary px-8 disabled:opacity-50"
        >
          Save Entry
        </button>
      </div>
    </form>
  );
}
