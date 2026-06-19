import { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { computeDemandScore } from '../../lib/scoring';
import { cn } from '../../lib/utils';
import EmptyState from '../../components/EmptyState';
import { useNavigate } from 'react-router-dom';
import { StarSystemCell } from '../../components/cosmic';

export default function Matrix() {
  const { data } = useData();
  const navigate = useNavigate();
  
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'ideas'
  const [selectedTag, setSelectedTag] = useState('');

  const allTags = useMemo(() => {
    const tags = new Set();
    data.problems.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [data.problems]);

  const plottedItems = useMemo(() => {
    let items = [];

    if (filterMode === 'all') {
      data.problems.forEach(p => {
        if (selectedTag && !p.tags?.includes(selectedTag)) return;
        const demand = computeDemandScore(p.willingnessToPay, p.peopleAffected, p.marketSizeEstimate);
        items.push({
          id: p.id,
          title: p.problem.split(' ').slice(0, 3).join(' ') + '...', // short title
          fullTitle: p.problem,
          pain: p.painLevel, // 1 to 10
          demand: demand, // 0 to 10
          type: 'problem'
        });
      });
    } else {
      data.ideas.forEach(i => {
        // an idea inherits tags from source problems
        const sourceProbs = data.problems.filter(p => i.sourceProblemIds.includes(p.id));
        let hasTag = !selectedTag;
        let painSum = 0;
        let demandSum = 0;
        
        sourceProbs.forEach(p => {
          if (p.tags?.includes(selectedTag)) hasTag = true;
          painSum += p.painLevel;
          demandSum += computeDemandScore(p.willingnessToPay, p.peopleAffected, p.marketSizeEstimate);
        });

        if (!hasTag && sourceProbs.length > 0) return;

        const avgPain = sourceProbs.length ? painSum / sourceProbs.length : 5;
        const avgDemand = sourceProbs.length ? demandSum / sourceProbs.length : 5;

        items.push({
          id: i.id,
          title: i.solution.split(' ').slice(0, 3).join(' ') + '...',
          fullTitle: i.solution,
          pain: avgPain,
          demand: avgDemand,
          type: 'idea'
        });
      });
    }
    return items;
  }, [data, filterMode, selectedTag]);

  // Quadrants
  // Q1: High Pain (>5.5), High Demand (>5) -> Best
  // Q2: High Pain (>5.5), Low Demand (<=5) -> Niche
  // Q3: Low Pain (<=5.5), High Demand (>5) -> Watch
  // Q4: Low Pain (<=5.5), Low Demand (<=5) -> Skip

  const quadrants = {
    q1: plottedItems.filter(i => i.pain > 5.5 && i.demand > 5),
    q2: plottedItems.filter(i => i.pain > 5.5 && i.demand <= 5),
    q3: plottedItems.filter(i => i.pain <= 5.5 && i.demand > 5),
    q4: plottedItems.filter(i => i.pain <= 5.5 && i.demand <= 5),
  };

  if (data.ideas.length === 0 && data.problems.length === 0) {
    return (
      <EmptyState
        title="The matrix is empty"
        description="The matrix fills in once you've collected problems or generated ideas."
        action={
          <button 
            onClick={() => navigate('/journal')}
            className="btn-primary px-6"
          >
            Go to Journal
          </button>
        }
      />
    );
  }

  // Plotting function for desktop scatter
  // pain (X) ranges 1 to 10. Map to 0-100%
  // demand (Y) ranges 0 to 10. Map to 100-0% (inverted)
  const getPosition = (pain, demand) => {
    const x = ((pain - 1) / 9) * 100;
    const y = 100 - ((demand / 10) * 100);
    return { left: `${Math.max(5, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(95, y))}%` };
  };

  const renderMiniChip = (item) => (
    <StarSystemCell 
      key={item.id} 
      item={item} 
      style={getPosition(item.pain, item.demand)} 
    />
  );

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto h-[calc(100vh-100px)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-display-lg mb-1" style={{ color: 'var(--text-primary)' }}>Opportunity Matrix</h1>
          <p className="text-body-sm text-muted">Visualize the signal.</p>
        </div>
        
        <div className="flex items-center gap-4 backdrop-blur-sm border p-2 rounded-xl" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)' }}>
          <select 
            value={filterMode}
            onChange={e => setFilterMode(e.target.value)}
            className="border rounded-lg px-3 py-2 text-body-sm outline-none cosmic-focus"
            style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
          >
            <option value="all">All problems & ideas</option>
            <option value="ideas">Ideas only</option>
          </select>

          <select 
            value={selectedTag}
            onChange={e => setSelectedTag(e.target.value)}
            className="border rounded-lg px-3 py-2 text-body-sm outline-none max-w-[150px] cosmic-focus"
            style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
          >
            <option value="">All Tags</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Desktop True Scatter Plot */}
      <div className="hidden md:flex flex-1 flex-col relative rounded-[16px] border shadow-sm overflow-hidden min-h-[500px]" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)' }}>
        {/* Axes Backgrounds */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-50 pointer-events-none">
          <div style={{ borderRight: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.02)' }}></div>
          <div style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(52, 211, 153, 0.03)' }}></div>
          <div style={{ borderRight: '1px solid var(--border-glass)', background: 'rgba(167, 174, 214, 0.03)' }}></div>
          <div style={{ background: 'rgba(248, 113, 113, 0.03)' }}></div>
        </div>

        {/* Labels */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-caption font-label uppercase tracking-widest text-muted pointer-events-none">High Demand</div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-caption font-label uppercase tracking-widest text-muted pointer-events-none">Low Demand</div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-caption font-label uppercase tracking-widest text-muted pointer-events-none whitespace-nowrap">Low Pain</div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 origin-center text-caption font-label uppercase tracking-widest text-muted pointer-events-none whitespace-nowrap">High Pain</div>

        {/* Quadrant Titles */}
        <div className="absolute top-8 right-8 text-body-sm font-bold text-demand-high opacity-50 pointer-events-none">Q1: Best</div>
        <div className="absolute top-8 left-8 text-body-sm font-bold text-muted opacity-50 pointer-events-none">Q3: Watch</div>
        <div className="absolute bottom-8 right-8 text-body-sm font-bold text-pain-high opacity-50 pointer-events-none">Q2: Niche</div>
        <div className="absolute bottom-8 left-8 text-body-sm font-bold text-muted opacity-50 pointer-events-none">Q4: Skip</div>

        {/* Data points */}
        <div className="absolute inset-8">
          {plottedItems.map(renderMiniChip)}
        </div>
      </div>

      {/* Mobile Stacked View */}
      <div className="md:hidden flex flex-col gap-4 flex-1 overflow-y-auto pb-24">
        <div className="glass-panel p-4 border-l-4 border-l-demand-high cosmic-hover">
          <h3 className="font-catalogue text-display-md mb-2" style={{ color: 'var(--text-primary)' }}>Q1: Best <span className="text-body-sm text-muted ml-2 font-instrument">High Pain, High Demand</span></h3>
          <div className="flex flex-wrap gap-2">
            {quadrants.q1.length === 0 && <span className="text-body-sm text-muted">None</span>}
            {quadrants.q1.map(i => <div key={i.id} className="border px-2 py-1 rounded text-xs" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}>{i.title}</div>)}
          </div>
        </div>

        <div className="glass-panel p-4 border-l-4 border-l-pain-high cosmic-hover">
          <h3 className="font-catalogue text-display-md mb-2" style={{ color: 'var(--text-primary)' }}>Q2: Niche <span className="text-body-sm text-muted ml-2 font-instrument">High Pain, Low Demand</span></h3>
          <div className="flex flex-wrap gap-2">
            {quadrants.q2.length === 0 && <span className="text-body-sm text-muted">None</span>}
            {quadrants.q2.map(i => <div key={i.id} className="border px-2 py-1 rounded text-xs" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}>{i.title}</div>)}
          </div>
        </div>

        <div className="glass-panel p-4 border-l-4 border-l-warning cosmic-hover">
          <h3 className="font-catalogue text-display-md mb-2" style={{ color: 'var(--text-primary)' }}>Q3: Watch <span className="text-body-sm text-muted ml-2 font-instrument">Low Pain, High Demand</span></h3>
          <div className="flex flex-wrap gap-2">
            {quadrants.q3.length === 0 && <span className="text-body-sm text-muted">None</span>}
            {quadrants.q3.map(i => <div key={i.id} className="border px-2 py-1 rounded text-xs" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}>{i.title}</div>)}
          </div>
        </div>

        <div className="glass-panel p-4 border-l-4 border-l-ink-muted cosmic-hover">
          <h3 className="font-catalogue text-display-md mb-2" style={{ color: 'var(--text-primary)' }}>Q4: Skip <span className="text-body-sm text-muted ml-2 font-instrument">Low Pain, Low Demand</span></h3>
          <div className="flex flex-wrap gap-2">
            {quadrants.q4.length === 0 && <span className="text-body-sm text-muted">None</span>}
            {quadrants.q4.map(i => <div key={i.id} className="border px-2 py-1 rounded text-xs" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}>{i.title}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
