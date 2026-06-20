import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { computeReview, getWeekRange } from '../../lib/reviewEngine';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import EmptyState from '../../components/EmptyState';
import { CosmicGlow } from '../../components/cosmic';

export default function Review() {
  const { data, saveWeeklyReview } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());

  const targetDateStr = currentDate.toISOString().split('T')[0];
  const { start, end } = getWeekRange(targetDateStr);
  const weekOfStr = start.toISOString().split('T')[0];

  const reviewData = computeReview(data.problems, data.ideas, targetDateStr);
  const savedReview = data.weeklyReviews.find(r => r.weekOf === weekOfStr);

  const [reflection, setReflection] = useState(() => savedReview ? savedReview.reflection : '');
  const [isSaved, setIsSaved] = useState(false);
  const [prevWeekOfStr, setPrevWeekOfStr] = useState(weekOfStr);

  if (weekOfStr !== prevWeekOfStr) {
    setPrevWeekOfStr(weekOfStr);
    setReflection(savedReview ? savedReview.reflection : '');
    setIsSaved(false);
  }

  const handlePrevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const handleSave = () => {
    saveWeeklyReview({
      weekOf: weekOfStr,
      reflection,
      completedAt: new Date().toISOString()
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const isCurrentWeek = end >= new Date();

  const hasDataThisWeek = reviewData.topRecurring.length > 0 || reviewData.highestPain.length > 0;

  if (data.problems.length === 0) {
    return (
      <EmptyState
        title="No star data yet"
        description="Your constellation map appears once you begin logging."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-lg mb-1" style={{ color: 'var(--text-primary)' }}>Weekly Review</h1>
          <p className="text-body-sm text-muted">
            Week of {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevWeek} className="p-2 rounded hover:bg-white/5 transition-colors text-muted hover:text-ink"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={handleNextWeek} disabled={isCurrentWeek} className="p-2 rounded hover:bg-white/5 transition-colors text-muted hover:text-ink disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {!hasDataThisWeek && (
        <div className="glass-panel p-6 border-l-4 border-l-warning">
          <h3 className="font-catalogue text-display-md mb-2" style={{ color: 'var(--text-primary)' }}>No problems logged this week</h3>
          <p className="text-body-sm text-muted">Go log some problems to generate your weekly signal.</p>
        </div>
      )}

      <CosmicGlow color="purple">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Top Recurring */}
        <div className="glass-panel p-6 flex flex-col gap-4 cosmic-hover">
          <h3 className="font-catalogue text-display-md border-b pb-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-glass)' }}>Top Recurring</h3>
          {reviewData.topRecurring.length === 0 ? <p className="text-muted text-body-sm">No data.</p> : (
            <ul className="flex flex-col gap-4">
              {reviewData.topRecurring.map((g) => (
                <li key={g.key} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-body-sm" style={{ color: 'var(--text-primary)' }}>{g.key}</span>
                    <span className="text-mono-id" style={{ color: 'var(--accent-primary)' }}>{g.problems.length} items</span>
                  </div>
                  <div className="text-caption text-muted truncate">{g.problems[0].problem}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Highest Pain */}
        <div className="glass-panel p-6 flex flex-col gap-4 cosmic-hover">
          <h3 className="font-catalogue text-display-md border-b pb-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-glass)' }}>Highest Pain</h3>
          {reviewData.highestPain.length === 0 ? <p className="text-muted text-body-sm">No data.</p> : (
            <ul className="flex flex-col gap-4">
              {reviewData.highestPain.map(p => (
                <li key={p.id} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-caption text-muted font-label">No. {p.id.split('_')[1].slice(-4)}</span>
                    <div className="flex items-center gap-2 text-pain-high font-bold text-mono-id">
                      {p.painLevel}/10
                    </div>
                  </div>
                  <div className="font-medium text-body-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>{p.problem}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Most Valuable */}
        <div className="glass-panel p-6 flex flex-col gap-4 cosmic-hover">
          <h3 className="font-catalogue text-display-md border-b pb-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-glass)' }}>Top Opportunities</h3>
          {reviewData.mostValuable.length === 0 ? <p className="text-muted text-body-sm">No ideas generated this week.</p> : (
            <ul className="flex flex-col gap-4">
              {reviewData.mostValuable.map(i => (
                <li key={i.id} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-demand-high font-bold text-mono-id">{i.startupPotentialScore} pts</span>
                  </div>
                  <div className="font-medium text-body-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>{i.solution}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Trends */}
        <div className="glass-panel p-6 flex flex-col gap-4 cosmic-hover">
          <h3 className="font-catalogue text-display-md border-b pb-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-glass)' }}>Trends & Patterns</h3>
          {reviewData.trends.length === 0 ? <p className="text-muted text-body-sm">No strong trends detected.</p> : (
            <ul className="flex flex-col gap-3 list-disc list-inside text-body-sm" style={{ color: 'var(--text-primary)' }}>
              {reviewData.trends.map((t, idx) => (
                <li key={idx} className="leading-relaxed">{t}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Constellation line overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ opacity: 0.15 }}>
          <line x1="0" y1="0" x2="50%" y2="50%" stroke="var(--accent-secondary)" strokeWidth="1" />
          <line x1="100%" y1="0" x2="50%" y2="50%" stroke="var(--accent-secondary)" strokeWidth="1" />
          <line x1="0" y1="100%" x2="50%" y2="50%" stroke="var(--accent-secondary)" strokeWidth="1" />
          <line x1="100%" y1="100%" x2="50%" y2="50%" stroke="var(--accent-secondary)" strokeWidth="1" />
          <line x1="0" y1="0" x2="100%" y2="100%" stroke="var(--accent-secondary)" strokeWidth="0.5" />
          <line x1="100%" y1="0" x2="0" y2="100%" stroke="var(--accent-secondary)" strokeWidth="0.5" />
        </svg>
        </div>
      </CosmicGlow>

      {/* Reflection */}
      <div className="glass-panel p-6 mt-4">
        <h3 className="font-catalogue text-display-md mb-4" style={{ color: 'var(--text-primary)' }}>Reflection</h3>
        <textarea 
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="What did you learn this week? What patterns are you seeing?"
          className="w-full border rounded-[10px] p-4 text-body-md min-h-[120px] mb-4 cosmic-focus"
          style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
        />
        <div className="flex justify-end items-center gap-4">
          {savedReview && <span className="text-caption text-muted">Last saved: {new Date(savedReview.completedAt).toLocaleString()}</span>}
          <button 
            onClick={handleSave}
            className="btn-primary flex items-center gap-2 px-6"
          >
            {isSaved ? <><Check className="w-4 h-4"/> Saved</> : 'Save Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
