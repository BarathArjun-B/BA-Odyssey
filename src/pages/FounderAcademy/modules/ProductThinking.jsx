import { useState } from 'react';
import { getAcademyData, saveAcademyData } from '../../../lib/academyStorage';
import { CheckCircle2, Layers } from 'lucide-react';

const TOPICS = [
  {
    id: 'jtbd',
    title: 'Jobs to Be Done (JTBD)',
    tagline: 'Customers do not buy products; they hire them to make progress.',
    details: 'When McDonald’s researched why commuters bought morning milkshakes, they found commuters needed something thick and lasting to make a boring 45-minute drive less monotonous with one hand. The competitor was not Burger King; it was a banana or a bagel.',
    rules: [
      'Focus on the situational trigger (When X happens...)',
      'Identify the emotional progress sought (I want to feel Y...)',
      'Measure the outcome, not feature usage (So I can achieve Z...)'
    ]
  },
  {
    id: 'mlp',
    title: 'Minimum Lovable Product (MLP)',
    tagline: 'Why the era of ugly, broken MVPs is dead in modern SaaS.',
    details: 'In 2012, software was scarce so users tolerated clunky MVPs. Today, software is abundant. An MLP is narrow in scope (does only 1 thing), but executes that single workflow with delightful speed, reliability, and beauty.',
    rules: [
      'Solve one complete micro-workflow from end to end',
      'Optimize for initial "Aha!" moment in less than 60 seconds',
      'Remove 80% of secondary settings until the core loop is proven'
    ]
  },
  {
    id: 'ahaMoment',
    title: 'The "Aha!" Metric & Activation',
    tagline: 'Pinpoint the single action that predicts 90-day retention.',
    details: 'Facebook discovered users who reached 7 friends in 10 days stayed forever. Slack discovered teams sending 2,000 messages never churned. What is your product’s leading indicator of true value receipt?',
    rules: [
      'Measure time-to-first-value (TTFV)',
      'Remove onboarding friction that precedes the value moment',
      'Instrument telemetry specifically around core aha behaviors'
    ]
  }
];

export default function ProductThinking() {
  const [modules, setModules] = useState(() => getAcademyData('modules', {}));
  const [activeTopicId, setActiveTopicId] = useState('jtbd');

  const ptData = modules.productThinking || { completed: [] };
  const completedList = ptData.completed || [];

  const activeTopic = TOPICS.find(t => t.id === activeTopicId) || TOPICS[0];
  const isCompleted = completedList.includes(activeTopic.id);

  const toggleComplete = (id) => {
    const nextCompleted = isCompleted
      ? completedList.filter(x => x !== id)
      : [...completedList, id];

    const nextModules = {
      ...modules,
      productThinking: {
        ...ptData,
        completed: nextCompleted
      }
    };

    setModules(nextModules);
    saveAcademyData('modules', nextModules);

    const iq = getAcademyData('founderIQ', {});
    saveAcademyData('founderIQ', {
      ...iq,
      productThinking: Math.min(10, (iq.productThinking || 0) + (isCompleted ? -0.5 : 0.5)),
      overallScore: Math.min(10, (iq.overallScore || 0) + (isCompleted ? -0.2 : 0.2))
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 text-violet-400 text-xs font-mono tracking-widest uppercase mb-1">
          <Layers className="w-4 h-4" /> Product Craft
        </div>
        <h1 className="text-display-lg" style={{ color: 'var(--text-primary)' }}>Product Thinking</h1>
        <p className="text-body-sm text-muted">Architecting products that retain users and generate natural momentum.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2">
          {TOPICS.map((topic) => {
            const done = completedList.includes(topic.id);
            const active = topic.id === activeTopicId;
            return (
              <button
                key={topic.id}
                onClick={() => setActiveTopicId(topic.id)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  active 
                    ? 'bg-violet-500/15 border-violet-500/40 text-primary shadow-lg shadow-violet-500/10' 
                    : 'bg-white/[0.02] border-[var(--border-glass)] text-muted hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-body-sm font-medium">{topic.title}</span>
                  {done && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>
                <p className="text-caption line-clamp-1 opacity-70">{topic.tagline}</p>
              </button>
            );
          })}
        </div>

        <div className="md:col-span-2 glass-panel p-6 md:p-8 flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-caption font-mono uppercase text-violet-400 tracking-wider">Concept Deep-Dive</span>
              <h2 className="text-display-md mt-1" style={{ color: 'var(--text-primary)' }}>{activeTopic.title}</h2>
              <p className="text-body-sm text-muted mt-1">{activeTopic.tagline}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-[var(--border-glass)] text-body-md leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {activeTopic.details}
            </div>

            <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
              <h3 className="text-caption font-mono uppercase text-violet-400 tracking-wider mb-2">Core Principles</h3>
              <ul className="flex flex-col gap-2">
                {activeTopic.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-body-sm text-muted">
                    <span className="text-violet-400 font-mono text-xs">{idx + 1}.</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-[var(--border-glass)] flex items-center justify-between">
            <span className="text-caption text-muted">
              {isCompleted ? 'Logged into Founder IQ' : 'Master this principle to increase IQ'}
            </span>
            <button
              onClick={() => toggleComplete(activeTopic.id)}
              className={`px-5 py-2.5 rounded-lg text-body-sm font-medium flex items-center gap-2 transition-all ${
                isCompleted 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'btn-primary'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isCompleted ? 'Mastered' : 'Mark as Mastered'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
