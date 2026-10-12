import { useState } from 'react';
import { getAcademyData, saveAcademyData } from '../../../lib/academyStorage';
import { CheckCircle2, Brain, Sparkles } from 'lucide-react';

const MODELS = [
  {
    id: 'firstPrinciples',
    title: 'First-Principles Thinking',
    author: 'Aristotle & Elon Musk',
    concept: 'Boil things down to the most fundamental truths that cannot be deduced any further, then reason up from there rather than reasoning by analogy.',
    application: 'Instead of copying SaaS pricing from competitors, calculate the raw value delivered in hours saved, error reduction, or revenue generated.'
  },
  {
    id: 'customerObsession',
    title: 'Customer Obsession',
    author: 'Jeff Bezos & Y Combinator',
    concept: 'Start with the customer and work backwards. Competitors are a distraction; customer complaints are a goldmine of unaddressed latent demand.',
    application: 'Listen closely to what users complain about repeatedly. Build the exact bridge that removes their acute daily friction.'
  },
  {
    id: 'inversionThinking',
    title: 'Inversion (Avoid Failure)',
    author: 'Charlie Munger & Carl Jacobi',
    concept: 'Invert, always invert. Instead of asking "How do we make this startup successful?", ask "What would guarantee this startup dies in 6 months?" and ruthlessly eliminate those factors.',
    application: 'List top 5 failure modes: running out of cash, building the wrong feature, slow feedback loops, founder dispute, zero distribution.'
  },
  {
    id: 'asymmetricBets',
    title: 'Asymmetric Upside',
    author: 'Nassim Taleb',
    concept: 'Look for opportunities where the downside is strictly capped and finite (e.g. 1 week of prototyping effort) while the upside is convex and unlimited.',
    application: 'Small, rapid software experiments allow 10 swings of the bat for the cost of 1 traditional waterfall build.'
  }
];

export default function FounderThinking() {
  const [modules, setModules] = useState(() => getAcademyData('modules', {}));
  const [activeModelId, setActiveModelId] = useState('firstPrinciples');

  const ftData = modules.founderThinking || { completed: [] };
  const completedList = ftData.completed || [];

  const activeModel = MODELS.find(m => m.id === activeModelId) || MODELS[0];
  const isCompleted = completedList.includes(activeModel.id);

  const toggleComplete = (id) => {
    const nextCompleted = isCompleted
      ? completedList.filter(x => x !== id)
      : [...completedList, id];

    const nextModules = {
      ...modules,
      founderThinking: {
        ...ftData,
        completed: nextCompleted
      }
    };

    setModules(nextModules);
    saveAcademyData('modules', nextModules);

    const iq = getAcademyData('founderIQ', {});
    saveAcademyData('founderIQ', {
      ...iq,
      observation: Math.min(10, (iq.observation || 0) + (isCompleted ? -0.4 : 0.4)),
      overallScore: Math.min(10, (iq.overallScore || 0) + (isCompleted ? -0.2 : 0.2))
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 text-violet-400 text-xs font-mono tracking-widest uppercase mb-1">
          <Brain className="w-4 h-4" /> Cognitive Models
        </div>
        <h1 className="text-display-lg" style={{ color: 'var(--text-primary)' }}>Founder Thinking</h1>
        <p className="text-body-sm text-muted">Mental models for navigating extreme uncertainty.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2">
          {MODELS.map((model) => {
            const done = completedList.includes(model.id);
            const active = model.id === activeModelId;
            return (
              <button
                key={model.id}
                onClick={() => setActiveModelId(model.id)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  active 
                    ? 'bg-violet-500/15 border-violet-500/40 text-primary shadow-lg shadow-violet-500/10' 
                    : 'bg-white/[0.02] border-[var(--border-glass)] text-muted hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-body-sm font-medium">{model.title}</span>
                  {done && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>
                <p className="text-caption opacity-70">{model.author}</p>
              </button>
            );
          })}
        </div>

        <div className="md:col-span-2 glass-panel p-6 md:p-8 flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-caption font-mono uppercase text-violet-400 tracking-wider">Framework</span>
              <h2 className="text-display-md mt-1" style={{ color: 'var(--text-primary)' }}>{activeModel.title}</h2>
              <span className="text-caption text-muted">Originated by {activeModel.author}</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-[var(--border-glass)] text-body-md leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {activeModel.concept}
            </div>

            <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
              <div className="flex items-center gap-2 text-violet-400 text-xs font-mono uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Practical Founder Application
              </div>
              <p className="text-body-sm text-muted leading-relaxed">
                {activeModel.application}
              </p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-[var(--border-glass)] flex items-center justify-between">
            <span className="text-caption text-muted">
              {isCompleted ? 'Mastered and logged' : 'Click to record mastery'}
            </span>
            <button
              onClick={() => toggleComplete(activeModel.id)}
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
