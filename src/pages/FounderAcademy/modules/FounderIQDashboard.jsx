import { useState } from 'react';
import { getAcademyData, saveAcademyData } from '../../../lib/academyStorage';
import { RefreshCw, CheckCircle2, Brain, Sparkles } from 'lucide-react';

const COMPETENCY_CONFIG = [
  { key: 'observation', label: 'Problem Observation', desc: 'Detecting acute, frequent real-world friction', color: 'from-blue-500 to-cyan-500' },
  { key: 'customerUnderstanding', label: 'Customer Empathy', desc: 'Deep Mom-Test discovery & unvarnished feedback', color: 'from-cyan-500 to-teal-500' },
  { key: 'productThinking', label: 'Product Architecture', desc: 'JTBD, MVP scoping, and sub-100ms craft', color: 'from-violet-500 to-purple-500' },
  { key: 'validation', label: 'Pre-Code Validation', desc: 'Proving demand and willingness to pay first', color: 'from-emerald-500 to-green-500' },
  { key: 'execution', label: 'Execution Velocity', desc: 'Speed of shipping, prototyping, and iterating', color: 'from-amber-500 to-orange-500' },
  { key: 'consistency', label: 'Cadence & Resilience', desc: 'Daily habits, mission streaks, and endurance', color: 'from-rose-500 to-pink-500' },
  { key: 'decisionMaking', label: 'Decision Rigor', desc: 'Simulated dilemmas and pivot-vs-persevere clarity', color: 'from-indigo-500 to-violet-500' },
  { key: 'leadership', label: 'Founder-Led Sales', desc: 'Inspiring early partners, co-creators, and talent', color: 'from-fuchsia-500 to-pink-500' },
  { key: 'learning', label: 'Scholarly Velocity', desc: 'Absorbing mental models from books and history', color: 'from-sky-500 to-blue-500' },
];

export default function FounderIQDashboard() {
  const [iq, setIq] = useState(() => getAcademyData('founderIQ', {}));
  const [recalibrated, setRecalibrated] = useState(false);

  const overallScore = Number(iq.overallScore || 0);

  // Compute Founder Tier
  let tier = 'Apprentice Explorer';
  let tierColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
  if (overallScore >= 8.5) {
    tier = 'Master Founder';
    tierColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  } else if (overallScore >= 6.0) {
    tier = 'High-Agency Strategist';
    tierColor = 'text-violet-400 border-violet-500/30 bg-violet-500/10';
  } else if (overallScore >= 3.0) {
    tier = 'Practitioner Builder';
    tierColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  }

  const handleRecalibrate = () => {
    // Audit completed modules in academyStorage & data in ba_data_v1
    const modules = getAcademyData('modules', {});
    const missions = modules.dailyMissions?.history || [];
    const books = modules.bookLibrary?.statuses || {};
    const readBooksCount = Object.values(books).filter(s => s === 'read').length;
    const startupsAnalyzed = modules.startupDatabase?.analyzed?.length || 0;
    const foundersStudied = modules.founderProfiles?.studied?.length || 0;
    const mentorConvs = modules.mentorConversations?.length || 0;

    // Check problems & ideas in ba_data_v1
    let problemsCount = 0;
    let ideasCount = 0;
    try {
      const baData = JSON.parse(localStorage.getItem('ba_data_v1') || '{}');
      problemsCount = baData.problems?.length || 0;
      ideasCount = baData.ideas?.length || 0;
    } catch {
      // Ignore if localStorage unavailable
    }

    const newObservation = Math.min(10, 2.0 + (problemsCount * 0.8) + (startupsAnalyzed * 0.4));
    const newCustomerUnderstanding = Math.min(10, 2.0 + (readBooksCount * 0.7) + (foundersStudied * 0.4));
    const newProductThinking = Math.min(10, 2.5 + (ideasCount * 0.6) + (readBooksCount * 0.5));
    const newValidation = Math.min(10, 2.0 + (problemsCount * 0.5) + (ideasCount * 0.7));
    const newExecution = Math.min(10, 2.0 + (missions.length * 0.8));
    const newConsistency = Math.min(10, 1.5 + (missions.length * 1.0));
    const newDecisionMaking = Math.min(10, 2.0 + (mentorConvs * 0.4));
    const newLeadership = Math.min(10, 2.0 + (foundersStudied * 0.8));
    const newLearning = Math.min(10, 2.0 + (readBooksCount * 1.0) + (startupsAnalyzed * 0.5));

    const competencies = [
      newObservation, newCustomerUnderstanding, newProductThinking,
      newValidation, newExecution, newConsistency,
      newDecisionMaking, newLeadership, newLearning
    ];
    const newOverall = Number((competencies.reduce((a, b) => a + b, 0) / competencies.length).toFixed(1));

    const updatedIq = {
      observation: Number(newObservation.toFixed(1)),
      customerUnderstanding: Number(newCustomerUnderstanding.toFixed(1)),
      productThinking: Number(newProductThinking.toFixed(1)),
      validation: Number(newValidation.toFixed(1)),
      execution: Number(newExecution.toFixed(1)),
      consistency: Number(newConsistency.toFixed(1)),
      decisionMaking: Number(newDecisionMaking.toFixed(1)),
      leadership: Number(newLeadership.toFixed(1)),
      learning: Number(newLearning.toFixed(1)),
      overallScore: newOverall,
      lastUpdated: new Date().toISOString()
    };

    setIq(updatedIq);
    saveAcademyData('founderIQ', updatedIq);
    setRecalibrated(true);
    setTimeout(() => setRecalibrated(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-mono tracking-widest uppercase mb-1">
            <Brain className="w-4 h-4" /> Intelligence Diagnostics
          </div>
          <h1 className="text-display-lg" style={{ color: 'var(--text-primary)' }}>Founder IQ Scorecard</h1>
          <p className="text-body-sm text-muted">Quantified evaluation across the 9 core venture competencies.</p>
        </div>

        <button
          onClick={handleRecalibrate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-[var(--border-glass)] text-body-sm text-muted hover:text-white hover:border-violet-500/40 transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${recalibrated ? 'animate-spin text-emerald-400' : ''}`} />
          <span>{recalibrated ? 'IQ Recalibrated!' : 'Recalibrate IQ'}</span>
        </button>
      </div>

      {/* Main Score Hero Card */}
      <div className="glass-panel p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600/20 to-purple-800/30 border border-violet-500/40 flex flex-col items-center justify-center text-center">
            <span className="text-display-lg font-mono font-bold text-violet-300">
              {overallScore.toFixed(1)}
            </span>
            <span className="text-caption font-mono uppercase text-muted -mt-1">/ 10.0</span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded text-caption font-mono font-medium border ${tierColor}`}>
                {tier}
              </span>
            </div>
            <h2 className="text-display-md" style={{ color: 'var(--text-primary)' }}>Composite Founder Quotient</h2>
            <p className="text-body-sm text-muted max-w-md mt-0.5">
              Continuously calibrated against problem discovery, idea generation, case study analysis, and curriculum mastery.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-48 text-right">
          <span className="text-caption font-mono uppercase text-muted">Assessment Status</span>
          <span className="text-body-sm text-emerald-400 font-mono flex items-center justify-end gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Live Tracking Active
          </span>
          <span className="text-caption text-muted/60">
            Updated {iq.lastUpdated ? new Date(iq.lastUpdated).toLocaleDateString() : 'Today'}
          </span>
        </div>
      </div>

      {/* 9 Competency Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COMPETENCY_CONFIG.map((comp) => {
          const score = Number(iq[comp.key] || 0);
          const percent = Math.min(100, Math.round((score / 10) * 100));

          return (
            <div
              key={comp.key}
              className="p-5 rounded-2xl bg-white/[0.02] border border-[var(--border-glass)] flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-body-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {comp.label}
                  </span>
                  <span className="text-body-sm font-mono font-bold text-violet-400">
                    {score.toFixed(1)} / 10
                  </span>
                </div>
                <p className="text-caption text-muted line-clamp-1">{comp.desc}</p>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${comp.color} transition-all duration-500 rounded-full`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* How Founder IQ is Earned */}
      <div className="p-6 rounded-2xl bg-white/[0.01] border border-[var(--border-glass)] space-y-3">
        <h3 className="text-caption font-mono uppercase text-violet-400 tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> How to Level Up Your Founder IQ
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-[var(--border-glass)]">
            <h4 className="text-body-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>1. Real Discovery</h4>
            <p className="text-caption text-muted">Log authentic real-world problems in your Problem Journal to unlock Observation points.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-[var(--border-glass)]">
            <h4 className="text-body-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>2. Tactical Study</h4>
            <p className="text-caption text-muted">Analyze case studies and mark startup books as Read to level up Customer Empathy & Strategy.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-[var(--border-glass)]">
            <h4 className="text-body-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>3. Daily Cadence</h4>
            <p className="text-caption text-muted">Complete daily founder missions to build streak consistency and execution velocity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
