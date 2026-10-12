import { useState } from 'react';
import { getAcademyData, saveAcademyData } from '../../../lib/academyStorage';
import { UserCircle, Quote, Sparkles, CheckCircle2, BookOpen, Search, Compass } from 'lucide-react';

const FOUNDERS = [
  {
    id: 'patrickCollison',
    name: 'Patrick Collison',
    company: 'Stripe',
    archetype: 'System Architect',
    roleTitle: 'Co-founder & CEO',
    tagline: 'High agency, speed as a moat, and relentless scholarly curiosity.',
    philosophy: 'The cost of moving fast is rarely making mistakes; the cost of moving slow is guaranteed irrelevance. Remove intermediate steps between idea and execution.',
    principles: [
      'The Collison Installation: Close feedback loops immediately by manually setting up users.',
      'Treat software engineering with deep historical and economic context.',
      'Maintain extreme transparency and written clarity inside the company.'
    ],
    anecdote: 'In the early days of Stripe, whenever someone said "I might use this", Patrick did not say "I will send you a link." He opened their laptop and installed Stripe right then and there.',
    quote: 'Most people don\'t operate anywhere near their limits. Simply deciding to move 2x faster usually succeeds.'
  },
  {
    id: 'brianChesky',
    name: 'Brian Chesky',
    company: 'Airbnb',
    archetype: 'Product Obsessive',
    roleTitle: 'Co-founder & CEO',
    tagline: 'Designing the 11-star experience and doing things that do not scale.',
    philosophy: 'Build an experience so extraordinary for 100 people that they would write an essay about it to their friends. Once you know what 11 stars feels like, you can scale back to a 7-star product economically.',
    principles: [
      'The 11-Star Experience: Imagine what would be mind-blowing before considering logistics.',
      'Founder-led product reviews: Stay intimately close to the pixel and customer story.',
      'Treat design not as decoration, but as customer empathy in action.'
    ],
    anecdote: 'During the 2008 financial crisis with $30,000 in credit card debt, Brian and Joe sold "Obama O\'s" and "Cap\'n McCain" cereal boxes to raise $30k and keep Airbnb alive.',
    quote: 'If you want to build a truly great company, you have to be willing to be misunderstood for long periods of time.'
  },
  {
    id: 'melaniePerkins',
    name: 'Melanie Perkins',
    company: 'Canva',
    archetype: 'Relentless Operator',
    roleTitle: 'Co-founder & CEO',
    tagline: 'Rejection immunity, audacious missions, and democratizing visual design.',
    philosophy: 'Rejection is not a signal to quit; it is a signal to refine your pitch and clarify your vision until it becomes undeniable.',
    principles: [
      'Start with a hyper-niche wedge: Canva started as Fusion Books (yearbooks for Australian schools).',
      'The 100+ No’s: Turned over 100 venture capital rejections into tactical pitch improvements.',
      'Two-step plan: 1. Build one of the world\'s most valuable companies. 2. Do the most good we can.'
    ],
    anecdote: 'Melanie learned kite-surfing in order to secure a meeting with venture capitalist Bill Tai, turning a weekend sporting hobby into their lead seed round investment.',
    quote: 'If you get rejected, it just means you haven\'t explained it well enough yet, or they\'re not the right fit for your journey.'
  },
  {
    id: 'dylanField',
    name: 'Dylan Field',
    company: 'Figma',
    archetype: 'Visionary Builder',
    roleTitle: 'Co-founder & CEO',
    tagline: 'Pioneering browser-first collaboration and patient compound engineering.',
    philosophy: 'Identify an emerging technology layer (WebGL in browsers) and endure years of R&D before launching because the end-state paradigm is fundamentally superior.',
    principles: [
      'Multiplayer-first: Software is better when creation happens together in real time.',
      'Patience during deep tech cycles: Figma spent 4 years building in private before general public release.',
      'Community as the core distribution engine.'
    ],
    anecdote: 'When Peter Thiel offered Dylan $100k to drop out of Brown University, Dylan took it not to rush a quick app, but to master computer graphics in the browser.',
    quote: 'Design is migrating from isolated craft to cross-disciplinary conversation.'
  },
  {
    id: 'paulGraham',
    name: 'Paul Graham',
    company: 'Y Combinator',
    archetype: 'Philosopher & Mentor',
    roleTitle: 'Co-founder',
    tagline: 'Relentless resourcefulness, talking to users, and living in the future.',
    philosophy: 'Make something people want. Live in the future, then build what is missing. Formulate hypotheses by observing organic behaviors that feel strange today.',
    principles: [
      'Do things that don\'t scale: Acquire your initial users through pure manual effort.',
      'Look for young, earnest founders with high agency over polished MBA resumes.',
      'A startup is a company designed to grow fast. Focus purely on user growth and revenue.'
    ],
    anecdote: 'Created Viaweb (the first web-based store builder), sold it to Yahoo, and used the profits and insights to fund the first batch of Y Combinator in 2005.',
    quote: 'Relentless resourcefulness is the single best predictor of startup success.'
  }
];

export default function FounderProfiles() {
  const [modules, setModules] = useState(() => getAcademyData('modules', {}));
  const [search, setSearch] = useState('');
  const [selectedFounder, setSelectedFounder] = useState(FOUNDERS[0]);

  const fpData = modules.founderProfiles || { studied: [] };
  const studiedList = fpData.studied || [];

  const filteredFounders = FOUNDERS.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.company.toLowerCase().includes(search.toLowerCase()) ||
    f.archetype.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStudied = (id) => {
    const isStudied = studiedList.includes(id);
    const nextStudied = isStudied
      ? studiedList.filter(x => x !== id)
      : [...studiedList, id];

    const nextModules = {
      ...modules,
      founderProfiles: {
        ...fpData,
        studied: nextStudied
      }
    };

    setModules(nextModules);
    saveAcademyData('modules', nextModules);

    // Update Founder IQ
    const iq = getAcademyData('founderIQ', {});
    const change = isStudied ? -0.4 : 0.4;
    saveAcademyData('founderIQ', {
      ...iq,
      leadership: Math.max(0, Math.min(10, (iq.leadership || 0) + change)),
      learning: Math.max(0, Math.min(10, (iq.learning || 0) + change)),
      overallScore: Math.max(0, Math.min(10, (iq.overallScore || 0) + (isStudied ? -0.1 : 0.1)))
    });
  };

  const isCurrentStudied = studiedList.includes(selectedFounder.id);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-mono tracking-widest uppercase mb-1">
            <UserCircle className="w-4 h-4" /> Leadership Archetypes
          </div>
          <h1 className="text-display-lg" style={{ color: 'var(--text-primary)' }}>Iconic Founder Profiles</h1>
          <p className="text-body-sm text-muted">Mindsets, operating playbooks, and counter-intuitive lessons from legendary builders.</p>
        </div>

        <div className="px-3.5 py-1.5 rounded-lg bg-white/[0.02] border border-[var(--border-glass)] text-caption font-mono text-muted">
          Mastered: <span className="text-violet-400 font-bold">{studiedList.length}</span> / {FOUNDERS.length}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by founder, company, or archetype..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white/[0.02] border border-[var(--border-glass)] rounded-xl text-body-sm placeholder:text-muted/50 focus:outline-none focus:border-violet-500/50"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Founder Cards List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {filteredFounders.map((founder) => {
            const isStudied = studiedList.includes(founder.id);
            const isSelected = selectedFounder.id === founder.id;
            return (
              <div
                key={founder.id}
                onClick={() => setSelectedFounder(founder)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-violet-500/10 border-violet-500/40 shadow-lg shadow-violet-500/5'
                    : 'bg-white/[0.02] border-[var(--border-glass)] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h3 className="text-body-md font-semibold" style={{ color: 'var(--text-primary)' }}>{founder.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-caption font-mono text-violet-400 font-medium">{founder.company}</span>
                      <span className="text-caption text-muted">•</span>
                      <span className="text-caption text-muted">{founder.archetype}</span>
                    </div>
                  </div>
                  {isStudied && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-caption text-muted line-clamp-2 leading-relaxed">
                  {founder.tagline}
                </p>
              </div>
            );
          })}
        </div>

        {/* Selected Founder Detail Dossier */}
        <div className="lg:col-span-7 glass-panel p-6 md:p-8 flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-caption font-mono bg-violet-500/15 text-violet-300 border border-violet-500/30">
                  {selectedFounder.archetype}
                </span>
                <span className="text-caption text-muted font-mono">{selectedFounder.roleTitle}</span>
              </div>
              <h2 className="text-display-md" style={{ color: 'var(--text-primary)' }}>{selectedFounder.name}</h2>
              <p className="text-body-sm text-violet-300 font-mono mt-0.5">{selectedFounder.company}</p>
            </div>

            {/* Quote Block */}
            <div className="p-4 rounded-xl bg-violet-500/[0.06] border border-violet-500/20 relative">
              <Quote className="w-5 h-5 text-violet-400/40 mb-2" />
              <p className="text-body-sm italic text-violet-200 leading-relaxed">
                "{selectedFounder.quote}"
              </p>
            </div>

            {/* Core Philosophy */}
            <div>
              <h4 className="text-caption font-mono uppercase text-muted tracking-wider mb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-violet-400" /> Core Operating Philosophy
              </h4>
              <p className="text-body-sm text-muted leading-relaxed bg-white/[0.01] p-3.5 rounded-xl border border-[var(--border-glass)]">
                {selectedFounder.philosophy}
              </p>
            </div>

            {/* Tactical Principles */}
            <div>
              <h4 className="text-caption font-mono uppercase text-muted tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Operational Principles
              </h4>
              <ul className="flex flex-col gap-2">
                {selectedFounder.principles.map((pr, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-body-sm text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                    <span>{pr}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Formative Anecdote */}
            <div>
              <h4 className="text-caption font-mono uppercase text-muted tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Formative Crucible Anecdote
              </h4>
              <p className="text-body-sm text-muted/90 leading-relaxed bg-white/[0.01] p-3.5 rounded-xl border border-[var(--border-glass)]">
                {selectedFounder.anecdote}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 mt-6 border-t border-[var(--border-glass)] flex items-center justify-between">
            <span className="text-caption text-muted">
              {isCurrentStudied ? 'Profile mastered and logged to Founder IQ' : 'Study profile to level up Founder Leadership'}
            </span>
            <button
              onClick={() => toggleStudied(selectedFounder.id)}
              className={`px-5 py-2 rounded-lg text-body-sm font-medium flex items-center gap-2 transition-all ${
                isCurrentStudied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'btn-primary'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isCurrentStudied ? 'Mastered' : 'Mark as Studied'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
