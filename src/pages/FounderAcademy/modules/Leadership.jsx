import { useState } from 'react';
import { getAcademyData, saveAcademyData } from '../../../lib/academyStorage';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

const TOPICS = [
  {
    id: 'founderSales',
    title: 'Founder-Led Sales',
    summary: 'Why founders must close the first 20 deals themselves before hiring any sales reps.',
    insight: 'Only founders have the authority to modify product roadmaps on sales calls, discern real feature objections from polite brush-offs, and discover why customers actually pay.',
    practices: [
      'Record every call and categorize why deals stall',
      'Never offer discounts in exchange for promises of referrals',
      'If you cannot sell your own vision, no salesperson will do it for you'
    ]
  },
  {
    id: 'highAgency',
    title: 'High-Agency Team Building',
    summary: 'Screening for proactive problem solvers who bend reality to hit goals.',
    insight: 'High agency is the ability to bend reality to your will. When a high-agency person hits a brick wall, they do not file a ticket and wait — they find a ladder, dig a tunnel, or build a battering ram.',
    practices: [
      'Ask candidates about times they broke standard rules to deliver an outcome',
      'Give paid 2-day work trials before extending full-time offers',
      'Hire for trajectory and learning speed over static tenure'
    ]
  },
  {
    id: 'radicalCandor',
    title: 'Radical Candor & Speed of Truth',
    summary: 'Direct feedback delivered with clear personal care creates high-velocity startups.',
    insight: 'Politeness kills startups. When team members hold back constructive criticism out of fear of conflict, sub-par code and flawed assumptions fester until catastrophic launch failures occur.',
    practices: [
      'Praise publicly, critique privately, and do both immediately',
      'Separate the person’s identity from their work output',
      'Invite brutal feedback on your own leadership weekly'
    ]
  }
];

export default function Leadership() {
  const [modules, setModules] = useState(() => getAcademyData('modules', {}));
  const [activeTopicId, setActiveTopicId] = useState('founderSales');

  const lData = modules.leadership || { completed: [] };
  const completedList = lData.completed || [];

  const activeTopic = TOPICS.find(t => t.id === activeTopicId) || TOPICS[0];
  const isCompleted = completedList.includes(activeTopic.id);

  const toggleComplete = (id) => {
    const nextCompleted = isCompleted
      ? completedList.filter(x => x !== id)
      : [...completedList, id];

    const nextModules = {
      ...modules,
      leadership: {
        ...lData,
        completed: nextCompleted
      }
    };

    setModules(nextModules);
    saveAcademyData('modules', nextModules);

    const iq = getAcademyData('founderIQ', {});
    saveAcademyData('founderIQ', {
      ...iq,
      leadership: Math.min(10, (iq.leadership || 0) + (isCompleted ? -0.5 : 0.5)),
      overallScore: Math.min(10, (iq.overallScore || 0) + (isCompleted ? -0.2 : 0.2))
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 text-violet-400 text-xs font-mono tracking-widest uppercase mb-1">
          <ShieldCheck className="w-4 h-4" /> Venture Leadership
        </div>
        <h1 className="text-display-lg" style={{ color: 'var(--text-primary)' }}>Founder Leadership</h1>
        <p className="text-body-sm text-muted">Building high-agency teams, closing early sales, and driving relentless execution.</p>
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
                <p className="text-caption line-clamp-1 opacity-70">{topic.summary}</p>
              </button>
            );
          })}
        </div>

        <div className="md:col-span-2 glass-panel p-6 md:p-8 flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-caption font-mono uppercase text-violet-400 tracking-wider">Leadership Playbook</span>
              <h2 className="text-display-md mt-1" style={{ color: 'var(--text-primary)' }}>{activeTopic.title}</h2>
              <p className="text-body-sm text-muted mt-1">{activeTopic.summary}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-[var(--border-glass)] text-body-md leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {activeTopic.insight}
            </div>

            <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
              <h3 className="text-caption font-mono uppercase text-violet-400 tracking-wider mb-2">Operational Guidelines</h3>
              <ul className="flex flex-col gap-2">
                {activeTopic.practices.map((practice, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-body-sm text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-[var(--border-glass)] flex items-center justify-between">
            <span className="text-caption text-muted">
              {isCompleted ? 'Logged into Founder IQ' : 'Mark as mastered to update Leadership score'}
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
