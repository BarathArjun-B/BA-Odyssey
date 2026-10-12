import { useState } from 'react';
import { getAcademyData, saveAcademyData } from '../../../lib/academyStorage';
import { Target, CheckCircle2, Zap, Clock, Flame } from 'lucide-react';

const MISSIONS = [
  {
    id: 'm1_5sec_audit',
    dayName: 'Monday',
    title: 'The 5-Second Value Proposition Audit',
    difficulty: 'Easy',
    timeEst: '15 min',
    iqBoost: '+0.5 Validation',
    objective: 'Test whether a stranger can understand the exact problem you solve within 5 seconds without asking clarifying questions.',
    actionSteps: [
      'Write down your 1-sentence value proposition.',
      'Show it to a peer, friend, or coworker who is not in your industry.',
      'Ask: "What do you think this company does, and who is it for?"',
      'Record their raw response without correcting them.'
    ]
  },
  {
    id: 'm2_cold_discovery',
    dayName: 'Tuesday',
    title: 'Mom-Test Discovery Outreach',
    difficulty: 'Medium',
    timeEst: '30 min',
    iqBoost: '+0.6 Customer Understanding',
    objective: 'Initiate a dialogue with 1 target persona without pitching your solution.',
    actionSteps: [
      'Identify 1 ideal user on LinkedIn, Twitter/X, or GitHub.',
      'Send a message asking about their current workflow: "Hey [Name], I noticed you handle X. How do you currently handle Y friction?"',
      'Do not mention your company name, website, or product.'
    ]
  },
  {
    id: 'm3_competitor_complaints',
    dayName: 'Wednesday',
    title: 'Mine 1-Star Competitor Reviews',
    difficulty: 'Easy',
    timeEst: '20 min',
    iqBoost: '+0.4 Observation',
    objective: 'Extract raw customer pain from the worst reviews of incumbent solutions.',
    actionSteps: [
      'Visit G2, Capterra, or Trustpilot for the leading incumbent in your niche.',
      'Filter reviews by 1-star and 2-star ratings.',
      'Identify the top 3 recurring frustrations (e.g., hidden pricing, slow exports, rigid permissions).'
    ]
  },
  {
    id: 'm4_concierge_offer',
    dayName: 'Thursday',
    title: 'The Manual Concierge Offer',
    difficulty: 'Hard',
    timeEst: '45 min',
    iqBoost: '+0.8 Execution',
    objective: 'Offer to solve a customer\'s problem manually using spreadsheets or manual labor before writing code.',
    actionSteps: [
      'Reach out to someone who suffers from your target problem.',
      'Say: "I can manually organize/process your [Data/Task] for you this week so you don\'t have to deal with it."',
      'Observe what inputs they give you and where the real friction lies.'
    ]
  },
  {
    id: 'm5_unit_economics',
    dayName: 'Friday',
    title: 'Zero-Assumptions Unit Economics',
    difficulty: 'Medium',
    timeEst: '25 min',
    iqBoost: '+0.5 Consistency',
    objective: 'Calculate the raw financial reality of your target opportunity.',
    actionSteps: [
      'Estimate your customer Lifetime Value (LTV): (Price per month / Estimated Monthly Churn %).',
      'Calculate max allowable Customer Acquisition Cost (CAC): LTV / 3.',
      'Determine how many sales you need per month to cover $10k/month in baseline operational runway.'
    ]
  }
];

export default function DailyMissions() {
  const [modules, setModules] = useState(() => getAcademyData('modules', {}));
  const [selectedMissionIndex, setSelectedMissionIndex] = useState(0);
  const [reflectionText, setReflectionText] = useState('');

  const missionState = modules.dailyMissions || { completedThisWeek: 0, history: [] };
  const history = missionState.history || [];

  const activeMission = MISSIONS[selectedMissionIndex];
  const isMissionCompleted = history.some(h => h.id === activeMission.id);

  const handleCompleteMission = () => {
    if (isMissionCompleted) return;

    const newHistoryEntry = {
      id: activeMission.id,
      title: activeMission.title,
      completedAt: new Date().toISOString(),
      reflection: reflectionText.trim() || 'Mission successfully completed.'
    };

    const nextHistory = [...history, newHistoryEntry];
    const nextModules = {
      ...modules,
      dailyMissions: {
        ...missionState,
        completedThisWeek: (missionState.completedThisWeek || 0) + 1,
        history: nextHistory
      }
    };

    setModules(nextModules);
    saveAcademyData('modules', nextModules);
    setReflectionText('');

    // Update Founder IQ
    const iq = getAcademyData('founderIQ', {});
    saveAcademyData('founderIQ', {
      ...iq,
      consistency: Math.min(10, (iq.consistency || 0) + 0.5),
      execution: Math.min(10, (iq.execution || 0) + 0.4),
      overallScore: Math.min(10, (iq.overallScore || 0) + 0.2)
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-mono tracking-widest uppercase mb-1">
            <Target className="w-4 h-4" /> Cadence Engine
          </div>
          <h1 className="text-display-lg" style={{ color: 'var(--text-primary)' }}>Daily Founder Missions</h1>
          <p className="text-body-sm text-muted">High-agency micro-challenges to force daily customer and validation momentum.</p>
        </div>

        <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-[var(--border-glass)]">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-caption text-muted font-label uppercase">Weekly Streak</span>
              <p className="text-body-md font-mono font-bold text-amber-300">{missionState.completedThisWeek || 0} / 5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Week Day Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {MISSIONS.map((m, idx) => {
          const done = history.some(h => h.id === m.id);
          const isSelected = selectedMissionIndex === idx;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMissionIndex(idx)}
              className={`p-3 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-violet-500/15 border-violet-500/40 text-primary shadow-lg shadow-violet-500/5'
                  : 'bg-white/[0.02] border-[var(--border-glass)] text-muted hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-caption font-mono uppercase text-violet-400 font-bold">{m.dayName}</span>
                {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <p className="text-caption line-clamp-1 font-medium">{m.title}</p>
            </button>
          );
        })}
      </div>

      {/* Main Mission Card */}
      <div className="glass-panel p-6 md:p-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-glass)] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-caption font-mono bg-violet-500/15 text-violet-300 border border-violet-500/30">
                {activeMission.dayName} Protocol
              </span>
              <span className="text-caption text-muted flex items-center gap-1">
                <Clock className="w-3 h-3" /> {activeMission.timeEst}
              </span>
              <span className="text-caption text-emerald-400 font-mono">
                {activeMission.iqBoost}
              </span>
            </div>
            <h2 className="text-display-md" style={{ color: 'var(--text-primary)' }}>{activeMission.title}</h2>
          </div>

          {isMissionCompleted && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-body-sm font-medium self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4" /> Mission Accomplished
            </div>
          )}
        </div>

        {/* Objective */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-[var(--border-glass)]">
          <span className="text-caption font-mono uppercase text-muted tracking-wider block mb-1">Mission Objective</span>
          <p className="text-body-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {activeMission.objective}
          </p>
        </div>

        {/* Action Steps */}
        <div>
          <h3 className="text-caption font-mono uppercase text-violet-400 tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Protocol Execution Steps
          </h3>
          <div className="space-y-2.5">
            {activeMission.actionSteps.map((step, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/[0.01] border border-[var(--border-glass)] flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-caption font-mono flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-body-sm text-muted leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reflection & Submission */}
        {!isMissionCompleted ? (
          <div className="pt-4 border-t border-[var(--border-glass)] space-y-4">
            <div>
              <label className="text-caption font-mono uppercase text-muted tracking-wider block mb-2">
                Mission Findings / Reflection Notes
              </label>
              <textarea
                rows={3}
                placeholder="Log what you discovered, customer quote, or results here..."
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-white/[0.02] border border-[var(--border-glass)] text-body-sm placeholder:text-muted/50 focus:outline-none focus:border-violet-500/50 resize-none"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-caption text-muted">
                Complete mission to increase consistency streak and Founder IQ
              </span>
              <button
                onClick={handleCompleteMission}
                className="btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2 text-body-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Mission Complete</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-[var(--border-glass)]">
            <h4 className="text-caption font-mono uppercase text-muted tracking-wider mb-2">Recorded Mission Log</h4>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-[var(--border-glass)] text-body-sm text-muted">
              {history.find(h => h.id === activeMission.id)?.reflection || 'Completed successfully.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
