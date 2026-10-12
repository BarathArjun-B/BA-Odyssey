import { useState } from 'react';
import { getAcademyData, saveAcademyData } from '../../../lib/academyStorage';
import { Rocket, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';

const LESSONS = [
  {
    id: 'problemFirstThinking',
    title: 'Problem-First Thinking',
    subtitle: 'Falling in love with the problem, not your initial solution',
    content: '90% of startups fail because they build something nobody wants. True founders treat solutions as disposable hypotheses and anchor deeply to the pain, frequency, and willingness-to-pay of the target persona.',
    takeaways: [
      'Validate acute pain before writing code',
      'High frequency (daily/weekly) builds compounding habit loops',
      'Look for hacked workarounds in Excel, WhatsApp, or manual ops'
    ]
  },
  {
    id: 'icpDiscovery',
    title: 'Ideal Customer Profile (ICP)',
    subtitle: 'Narrowing down to the desperate customer segment',
    content: 'If your customer is "everyone", you have no customers. Define the exact persona who loses money, sleep, or reputation without your solution.',
    takeaways: [
      'Segment by specific trigger events (e.g. newly hired VP, expanding overseas)',
      'Interview 20 people who experience the problem weekly',
      'Ask about their past behavior, never their hypothetical future intent'
    ]
  },
  {
    id: 'unitEconomics',
    title: 'Foundational Unit Economics',
    subtitle: 'CAC, LTV, Contribution Margin, and Payback Period',
    content: 'A business must generate more gross margin per customer than it costs to acquire and retain them. Sustainable momentum requires an LTV:CAC ratio > 3x and payback within 12 months.',
    takeaways: [
      'CAC includes all sales and marketing costs divided by new customers',
      'Churn is the silent killer of compounding revenue',
      'Price on value created rather than cost-plus margin'
    ]
  },
  {
    id: 'distributionAdvantage',
    title: 'Distribution as a Moat',
    subtitle: 'Building distribution channels before product launch',
    content: 'First-time founders focus on product; second-time founders focus on distribution. Even the best solution fails without an organic, programmatic, or virally driven channel.',
    takeaways: [
      'Engineer word-of-mouth loops directly into product utility',
      'Own a niche audience or community early',
      'Focus on one high-converting acquisition channel first'
    ]
  }
];

export default function StartupFundamentals() {
  const [modules, setModules] = useState(() => getAcademyData('modules', {}));
  const [activeLessonId, setActiveLessonId] = useState('problemFirstThinking');

  const sfData = modules.startupFundamentals || { completed: [] };
  const completedList = sfData.completed || [];

  const activeLesson = LESSONS.find(l => l.id === activeLessonId) || LESSONS[0];
  const isCompleted = completedList.includes(activeLesson.id);

  const toggleComplete = (id) => {
    const nextCompleted = isCompleted
      ? completedList.filter(x => x !== id)
      : [...completedList, id];

    const nextModules = {
      ...modules,
      startupFundamentals: {
        ...sfData,
        completed: nextCompleted,
        progress: Math.round((nextCompleted.length / LESSONS.length) * 100)
      }
    };

    setModules(nextModules);
    saveAcademyData('modules', nextModules);

    // Update Founder IQ
    const iq = getAcademyData('founderIQ', {});
    const newScore = Math.min(10, (iq.execution || 0) + (isCompleted ? -0.5 : 0.5));
    saveAcademyData('founderIQ', {
      ...iq,
      execution: Math.max(0, newScore),
      overallScore: Math.min(10, ((iq.overallScore || 0) + (isCompleted ? -0.2 : 0.2)))
    });
  };

  const progress = Math.round((completedList.length / LESSONS.length) * 100);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-mono tracking-widest uppercase mb-1">
            <Rocket className="w-4 h-4" /> Curriculum Core
          </div>
          <h1 className="text-display-lg" style={{ color: 'var(--text-primary)' }}>Startup Fundamentals</h1>
          <p className="text-body-sm text-muted">Core mental models for zero-to-one venture creation.</p>
        </div>

        <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-[var(--border-glass)]">
          <div className="flex flex-col">
            <span className="text-caption text-muted font-label uppercase">Progress</span>
            <span className="text-body-md font-mono font-bold text-violet-400">{progress}%</span>
          </div>
          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-violet-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lesson List */}
        <div className="flex flex-col gap-2">
          {LESSONS.map((lesson) => {
            const done = completedList.includes(lesson.id);
            const active = lesson.id === activeLessonId;
            return (
              <button
                key={lesson.id}
                onClick={() => setActiveLessonId(lesson.id)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  active 
                    ? 'bg-violet-500/15 border-violet-500/40 text-primary shadow-lg shadow-violet-500/10' 
                    : 'bg-white/[0.02] border-[var(--border-glass)] text-muted hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-body-sm font-medium">{lesson.title}</span>
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-40 shrink-0" />
                  )}
                </div>
                <p className="text-caption line-clamp-1 opacity-70">{lesson.subtitle}</p>
              </button>
            );
          })}
        </div>

        {/* Lesson Detail Reader */}
        <div className="md:col-span-2 glass-panel p-6 md:p-8 flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-caption font-mono uppercase text-violet-400 tracking-wider">Lesson Focus</span>
              <h2 className="text-display-md mt-1" style={{ color: 'var(--text-primary)' }}>{activeLesson.title}</h2>
              <p className="text-body-sm text-muted mt-1">{activeLesson.subtitle}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-[var(--border-glass)] text-body-md leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {activeLesson.content}
            </div>

            <div>
              <h3 className="text-body-sm font-label uppercase tracking-widest text-muted mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-400" /> Actionable Takeaways
              </h3>
              <ul className="flex flex-col gap-2.5">
                {activeLesson.takeaways.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-body-sm text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-[var(--border-glass)] flex items-center justify-between">
            <span className="text-caption text-muted">
              {isCompleted ? 'Completed and logged to Founder IQ' : 'Mark as completed to update your Founder IQ'}
            </span>
            <button
              onClick={() => toggleComplete(activeLesson.id)}
              className={`px-5 py-2.5 rounded-lg text-body-sm font-medium flex items-center gap-2 transition-all ${
                isCompleted 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'btn-primary'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isCompleted ? 'Completed' : 'Mark Complete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
