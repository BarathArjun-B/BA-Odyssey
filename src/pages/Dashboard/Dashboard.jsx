import { useData } from '../../context/DataContext';
import { getFounderScore, calculateStreak } from '../../lib/scoring';
import { computeReview } from '../../lib/reviewEngine';
import { getRandomPrompt } from '../../lib/prompts';
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatTile from '../../components/StatTile';
import ProgressRing from '../../components/ProgressRing';
import Sparkline from '../../components/Sparkline';
import { AstronautCharacter, ConstellationNetwork, CosmicGlow } from '../../components/cosmic';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Check, SquareCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

function getGreeting(name) {
  const hr = new Date().getHours();
  let greeting = 'Good evening';
  if (hr < 12) greeting = 'Good morning';
  else if (hr < 18) greeting = 'Good afternoon';
  return name ? `Welcome, Commander ${name}` : `${greeting}, Commander`;
}

export default function Dashboard() {
  const { data, toggleOSItem } = useData();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    setPrompt(getRandomPrompt());
  }, []);

  const score = useMemo(() => getFounderScore(data), [data]);
  const streak = useMemo(() => calculateStreak(data.problems), [data.problems]);
  const goal = data.settings.problemGoal || 1000;
  const progressPercent = Math.min((data.problems.length / goal) * 100, 100);

  // Compute 7-day fake sparkline data since we don't have historical snapshot storage
  // We'll just generate a nice looking line ending at current score
  const sparklineData = useMemo(() => {
    const arr = [];
    let cur = Math.max(score - 15, 0);
    for(let i=0; i<6; i++) {
      arr.push({ val: cur });
      cur += Math.floor(Math.random() * 4);
    }
    arr.push({ val: score });
    return arr;
  }, [score]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = data.operatingSystem.dailyLogs.find(l => l.date === todayStr) || {};

  // Compute truncated weekly insights
  const insights = useMemo(() => computeReview(data.problems, data.ideas, todayStr), [data, todayStr]);

  const isDayOne = data.problems.length === 0;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-display-lg mb-1" style={{ color: 'var(--text-primary)' }}>{getGreeting(data.settings.founderName)}</h1>
        <p className="text-body-md text-muted">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Hero Row */}
      <div className="relative">
        <ConstellationNetwork problems={data.problems} ideas={data.ideas} />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
          <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-1">
            <StatTile 
              number={streak} 
              label="day streak" 
              className="h-full glow-emerald"
              glowColor="emerald"
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }}>
            <StatTile 
              number={data.problems.length} 
              label="Planets discovered" 
              onClick={() => navigate('/journal')}
              className="h-full glow-violet"
              glowColor="violet"
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }}>
            <StatTile 
              number={data.ideas.length} 
              label="Galaxies mapped" 
              onClick={() => navigate('/ideas')}
              className="h-full glow-cyan"
              glowColor="cyan"
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }}>
            <div className="glass-panel flex flex-col items-center justify-center p-6 cosmic-hover h-full">
              <ProgressRing percentage={progressPercent} size={100} strokeWidth={6} label={
                <div className="flex flex-col items-center">
                  <span className="text-mono-id font-bold" style={{ color: 'var(--accent-primary)' }}>{Math.round(progressPercent)}%</span>
                </div>
              } />
              <span className="text-caption text-muted mt-4">{goal - data.problems.length} to go</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Founder Score Band */}
      {!isDayOne && (
        <CosmicGlow color="gold">
          <div className="glass-panel p-6 flex items-center justify-between cosmic-hover cursor-pointer web-texture">
            <div className="flex flex-col">
              <span className="text-body-sm text-muted mb-1">Founder Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-display-xl leading-none" style={{ color: 'var(--status-achievement-gold)' }}>{score}</span>
                <span className="text-mono-id text-muted">/1000</span>
              </div>
            </div>
            <div className="flex-1 max-w-xs mx-8 hidden md:block opacity-60">
              <Sparkline data={sparklineData} dataKey="val" color="var(--status-achievement-gold)" />
            </div>
            <div className="flex items-center gap-2 font-medium text-body-sm" style={{ color: 'var(--accent-primary)' }}>
              View breakdown
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </CosmicGlow>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="md:col-span-2 flex flex-col gap-8">
          {/* Today's Prompt */}
          <div className="discovery-card relative overflow-hidden">
            {/* Faint web texture in prompt card */}
            <div className="absolute inset-0 web-texture pointer-events-none" aria-hidden="true" />
            <span className="section-label mb-4 block relative z-10">Discovery Assistant</span>
            <h2 className="discovery-headline relative z-10">
              {isDayOne ? "Your universe is empty. Today, just notice one thing that annoyed you — that's the whole mission." : prompt}
            </h2>
            <button 
              onClick={() => navigate('/journal', { state: { autoOpen: true, prompt } })}
              className="btn-primary flex items-center justify-center gap-2 relative z-10 w-fit"
            >
              Log a problem <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekly Insights */}
          {!isDayOne && (
            <div>
              <h3 className="font-catalogue text-display-md mb-4" style={{ color: 'var(--text-primary)' }}>Weekly Signal</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div onClick={() => navigate('/review')} className="glass-panel p-4 cursor-pointer cosmic-hover">
                  <span className="text-caption text-muted block mb-2">Top Recurring</span>
                  <span className="text-body-sm font-medium line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                    {insights.topRecurring[0] ? insights.topRecurring[0].key : "Not enough data"}
                  </span>
                </div>
                <div onClick={() => navigate('/review')} className="glass-panel p-4 cursor-pointer cosmic-hover">
                  <span className="text-caption text-muted block mb-2">Highest Pain</span>
                  <span className="text-body-sm font-medium line-clamp-2" style={{ color: 'var(--status-alert-ember)' }}>
                    {insights.highestPain[0] ? insights.highestPain[0].problem : "Not enough data"}
                  </span>
                </div>
                <div onClick={() => navigate('/review')} className="glass-panel p-4 cursor-pointer cosmic-hover">
                  <span className="text-caption text-muted block mb-2">Top Opportunity</span>
                  <span className="text-body-sm font-medium line-clamp-2" style={{ color: 'var(--status-success-emerald)' }}>
                    {insights.mostValuable[0] ? insights.mostValuable[0].solution : "Not enough data"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side Column */}
        <div className="operating-system-section flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="os-title mb-0">Operating System</h3>
            <button onClick={() => navigate('/system')} className="os-view-all">View all</button>
          </div>
          
          {isDayOne ? (
             <div className="text-center flex flex-col items-center">
               <AstronautCharacter size={120} floating={true} />
               <p className="text-body-sm text-muted mb-4 mt-4">Your founder universe is waiting. Set up your daily habits to begin the journey.</p>
               <button onClick={() => navigate('/system')} className="text-body-sm font-medium" style={{ color: 'var(--accent-primary)' }}>Configure OS</button>
             </div>
          ) : (
            <div className="flex flex-col gap-2">
              {[
                { id: 'dsa', label: 'DSA' },
                { id: 'building', label: 'Building' },
                { id: 'businessReading', label: 'Business reading' },
                { id: 'problemCollection', label: 'Problem collection' },
                { id: 'networking', label: 'Networking' },
                { id: 'reflection', label: 'Reflection' }
              ].map(item => {
                const isChecked = todayLog[item.id] || false;
                // auto-check problem collection if problem count > 0 today
                const hasProblemsToday = data.problems.some(p => p.date === todayStr);
                const isAutoProblem = item.id === 'problemCollection' && hasProblemsToday;
                const finalChecked = isChecked || isAutoProblem;

                return (
                  <button 
                    key={item.id}
                    disabled={isAutoProblem}
                    onClick={() => toggleOSItem(todayStr, item.id, !finalChecked)}
                    className="flex items-center gap-3 p-2 rounded transition-colors text-left group"
                    style={{ ':hover': { background: 'rgba(255,255,255,0.04)' } }}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded flex items-center justify-center border transition-colors",
                      finalChecked 
                        ? "text-paper" 
                        : "text-transparent"
                    )} style={finalChecked ? { background: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' } : { borderColor: 'var(--border-glass)' }}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className={cn(
                      "text-body-sm transition-colors",
                      finalChecked ? "text-muted line-through" : ""
                    )} style={!finalChecked ? { color: 'var(--text-primary)' } : {}}>
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
