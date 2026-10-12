import { useState } from 'react';
import { getAcademyData, saveAcademyData } from '../../../lib/academyStorage';
import { Database, Search, Bookmark, CheckCircle2, Building2, TrendingUp, Sparkles, Filter } from 'lucide-react';

const CASE_STUDIES = [
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Developer Tools',
    stage: 'Decacorn ($65B+)',
    foundingYear: 2010,
    founders: 'Patrick & John Collison',
    summary: 'Turned weeks of merchant banking bureaucracy into 7 lines of JavaScript code.',
    problem: 'Setting up online payments in 2010 required weeks of merchant bank paperwork, KYC faxing, and complex legacy gateway APIs with horrible documentation.',
    wedge: 'The 7-line code snippet. Developers could integrate credit card payments in 15 minutes without talking to a salesperson.',
    distribution: 'The "Collison Installation" — whenever a friend or developer expressed interest, Patrick would take their laptop and integrate Stripe on the spot.',
    founderInsight: 'Remove friction from the builder. If developers love your tool, they will evangelize it upwards into enterprises.',
    metrics: '$1T+ payment volume processed annually'
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    category: 'Marketplace',
    stage: 'Public ($80B+)',
    foundingYear: 2008,
    founders: 'Brian Chesky, Joe Gebbia, Nathan Blecharczyk',
    summary: 'Rented air mattresses on apartment floors during a design conference when hotels were sold out.',
    problem: 'Hotels were prohibitively expensive during major metropolitan conferences, while residents had unused living space with zero monetization options.',
    wedge: 'High-intent conference attendees in SF needing a cheap place to crash with WiFi and breakfast.',
    distribution: 'Do things that do not scale — Brian and Joe personally flew to NYC to knock on doors, photograph hosts\' apartments, and draft listings.',
    founderInsight: 'It is far better to have 100 customers who love you intensely than 1,000,000 who merely like you.',
    metrics: '4M+ hosts worldwide'
  },
  {
    id: 'figma',
    name: 'Figma',
    category: 'Productivity',
    stage: 'Enterprise Leader ($20B)',
    foundingYear: 2012,
    founders: 'Dylan Field & Evan Wallace',
    summary: 'Brought professional design software to WebGL in the browser, making design multiplayer.',
    problem: 'Designers worked in siloed desktop apps (Sketch, Photoshop), emailing files named `final_v2_really_final.sketch`, completely isolated from developers and PMs.',
    wedge: 'Web-first collaboration. Opening a link in Chrome gave anyone immediate, realtime multiplayer canvas access.',
    distribution: 'Freemium bottom-up adoption. Designers invited their product managers and engineers via URL, creating organic intra-company viral loops.',
    founderInsight: 'The power of software shifts fundamentally when the underlying delivery paradigm changes (desktop files to live browser URLs).',
    metrics: 'Used by >80% of top tech design teams'
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Productivity',
    stage: 'Decacorn ($10B)',
    foundingYear: 2013,
    founders: 'Ivan Zhao & Simon Last',
    summary: 'Rebuilt from the brink of bankruptcy in Kyoto into the universal Lego-kit workspace.',
    problem: 'Knowledge workers suffered from severe tool sprawl — separate apps for docs, wikis, tasks, and relational databases that failed to communicate.',
    wedge: 'A flexible block-based editor that let users build customized systems without code.',
    distribution: 'Global enthusiast communities. Empowered power users to sell templates and host meetups, turning users into evangelists.',
    founderInsight: 'Give users building blocks rather than rigid software, and they will build tools for problems you never anticipated.',
    metrics: '35M+ active users'
  },
  {
    id: 'linear',
    name: 'Linear',
    category: 'B2B SaaS',
    stage: 'High Growth ($1B+)',
    foundingYear: 2019,
    founders: 'Karri Saarinen & Tuomas Artman',
    summary: 'Reinvented issue tracking by obsessing over sub-100ms keyboard-first responsiveness.',
    problem: 'Legacy issue trackers (Jira) had become bloated, sluggish enterprise databases despised by software engineers and designers.',
    wedge: 'Extreme speed, keyboard navigation, and an opinionated, minimalist product development workflow.',
    distribution: 'Design-led word of mouth across high-reputation engineering teams in Silicon Valley.',
    founderInsight: 'Speed and aesthetic refinement are themselves major competitive moats in software.',
    metrics: 'Adopted by OpenAI, Ramp, Cash App, Vercel'
  },
  {
    id: 'retool',
    name: 'Retool',
    category: 'Developer Tools',
    stage: 'Enterprise Leader ($3.2B)',
    foundingYear: 2017,
    founders: 'David Hsu',
    summary: 'Built drag-and-drop React components connected to any database for custom internal tools.',
    problem: 'Every software engineering team wasted 30-50% of developer bandwidth hand-rolling fragile internal admin panels and customer ops dashboards.',
    wedge: 'Pre-built UI components (tables, buttons, forms) connected directly to SQL queries and REST APIs.',
    distribution: 'Cold outreach to engineering managers offering to solve their specific back-office backlog in one afternoon.',
    founderInsight: 'Never build internal tools from scratch when standard enterprise operations can be composed in hours.',
    metrics: 'Powers internal operations for Amazon, DoorDash, Pinterest'
  }
];

export default function StartupDatabase() {
  const [modules, setModules] = useState(() => getAcademyData('modules', {}));
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCase, setSelectedCase] = useState(CASE_STUDIES[0]);

  const dbData = modules.startupDatabase || { analyzed: [], bookmarked: [] };
  const analyzedList = dbData.analyzed || [];
  const bookmarkedList = dbData.bookmarked || [];

  const categories = ['All', 'Developer Tools', 'B2B SaaS', 'Productivity', 'Marketplace'];

  const filteredStudies = CASE_STUDIES.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase()) ||
      item.problem.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleAnalyze = (id) => {
    const isAnalyzed = analyzedList.includes(id);
    const nextAnalyzed = isAnalyzed
      ? analyzedList.filter(x => x !== id)
      : [...analyzedList, id];

    const nextModules = {
      ...modules,
      startupDatabase: {
        ...dbData,
        analyzed: nextAnalyzed
      }
    };

    setModules(nextModules);
    saveAcademyData('modules', nextModules);

    // Update Founder IQ
    const iq = getAcademyData('founderIQ', {});
    const change = isAnalyzed ? -0.3 : 0.3;
    saveAcademyData('founderIQ', {
      ...iq,
      customerUnderstanding: Math.max(0, Math.min(10, (iq.customerUnderstanding || 0) + change)),
      overallScore: Math.max(0, Math.min(10, (iq.overallScore || 0) + (isAnalyzed ? -0.1 : 0.1)))
    });
  };

  const toggleBookmark = (id) => {
    const isBookmarked = bookmarkedList.includes(id);
    const nextBookmarked = isBookmarked
      ? bookmarkedList.filter(x => x !== id)
      : [...bookmarkedList, id];

    const nextModules = {
      ...modules,
      startupDatabase: {
        ...dbData,
        bookmarked: nextBookmarked
      }
    };

    setModules(nextModules);
    saveAcademyData('modules', nextModules);
  };

  const isCurrentAnalyzed = analyzedList.includes(selectedCase.id);
  const isCurrentBookmarked = bookmarkedList.includes(selectedCase.id);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-mono tracking-widest uppercase mb-1">
            <Database className="w-4 h-4" /> Intelligence Archive
          </div>
          <h1 className="text-display-lg" style={{ color: 'var(--text-primary)' }}>Startup Case Studies</h1>
          <p className="text-body-sm text-muted">Deconstructed 0-to-1 wedges, distribution loops, and inflection moments.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-[var(--border-glass)] text-caption font-mono text-muted">
            Analyzed: <span className="text-violet-400 font-bold">{analyzedList.length}</span> / {CASE_STUDIES.length}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company, problem, or wedge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/[0.02] border border-[var(--border-glass)] rounded-xl text-body-sm placeholder:text-muted/50 focus:outline-none focus:border-violet-500/50"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-muted shrink-0 mr-1 hidden sm:block" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-caption whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                  : 'bg-white/[0.02] text-muted border border-[var(--border-glass)] hover:bg-white/[0.05]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Case Studies List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {filteredStudies.map((item) => {
            const isAnalyzed = analyzedList.includes(item.id);
            const isSelected = selectedCase.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedCase(item)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-violet-500/10 border-violet-500/40 shadow-lg shadow-violet-500/5'
                    : 'bg-white/[0.02] border-[var(--border-glass)] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-body-md font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-caption font-mono text-violet-400">{item.category}</span>
                      <span className="text-caption text-muted">•</span>
                      <span className="text-caption text-muted">{item.stage}</span>
                    </div>
                  </div>
                  {isAnalyzed && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-caption text-muted line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              </div>
            );
          })}
          {filteredStudies.length === 0 && (
            <div className="p-8 text-center text-muted border border-dashed border-[var(--border-glass)] rounded-xl">
              No startup case studies found matching your filter.
            </div>
          )}
        </div>

        {/* Selected Study Deep Dive */}
        <div className="lg:col-span-7 glass-panel p-6 md:p-8 flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-caption font-mono bg-violet-500/15 text-violet-300 border border-violet-500/30">
                    {selectedCase.category}
                  </span>
                  <span className="text-caption text-muted font-mono">Founded {selectedCase.foundingYear}</span>
                </div>
                <h2 className="text-display-md" style={{ color: 'var(--text-primary)' }}>{selectedCase.name}</h2>
                <p className="text-body-sm text-muted mt-1">Founders: {selectedCase.founders}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmark(selectedCase.id)}
                  className={`p-2 rounded-lg border transition-all ${
                    isCurrentBookmarked
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-white/[0.02] border-[var(--border-glass)] text-muted hover:text-white'
                  }`}
                  title={isCurrentBookmarked ? 'Bookmarked' : 'Bookmark case study'}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-[var(--border-glass)]">
              <div>
                <span className="text-caption text-muted font-label uppercase">Current Scale</span>
                <p className="text-body-sm font-semibold text-emerald-400 mt-0.5">{selectedCase.stage}</p>
              </div>
              <div>
                <span className="text-caption text-muted font-label uppercase">Traction Footprint</span>
                <p className="text-body-sm font-semibold text-violet-300 mt-0.5">{selectedCase.metrics}</p>
              </div>
            </div>

            {/* Deep Breakdown */}
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="text-caption font-mono uppercase text-rose-400 tracking-wider mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> 1. The Real Unaddressed Problem
                </h4>
                <p className="text-body-sm leading-relaxed text-muted bg-white/[0.01] p-3 rounded-lg border border-[var(--border-glass)]">
                  {selectedCase.problem}
                </p>
              </div>

              <div>
                <h4 className="text-caption font-mono uppercase text-amber-400 tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 2. The Initial Wedge & MVP
                </h4>
                <p className="text-body-sm leading-relaxed text-muted bg-white/[0.01] p-3 rounded-lg border border-[var(--border-glass)]">
                  {selectedCase.wedge}
                </p>
              </div>

              <div>
                <h4 className="text-caption font-mono uppercase text-cyan-400 tracking-wider mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> 3. Distribution & Growth Engine
                </h4>
                <p className="text-body-sm leading-relaxed text-muted bg-white/[0.01] p-3 rounded-lg border border-[var(--border-glass)]">
                  {selectedCase.distribution}
                </p>
              </div>

              <div>
                <h4 className="text-caption font-mono uppercase text-violet-400 tracking-wider mb-1">
                  4. Core Founder Insight
                </h4>
                <div className="p-3.5 rounded-lg bg-violet-500/[0.06] border border-violet-500/20 text-body-sm text-violet-200 italic">
                  "{selectedCase.founderInsight}"
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 mt-6 border-t border-[var(--border-glass)] flex items-center justify-between">
            <span className="text-caption text-muted">
              {isCurrentAnalyzed ? 'Case study analyzed and recorded' : 'Log to Founder IQ as an analyzed case study'}
            </span>
            <button
              onClick={() => toggleAnalyze(selectedCase.id)}
              className={`px-5 py-2 rounded-lg text-body-sm font-medium flex items-center gap-2 transition-all ${
                isCurrentAnalyzed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'btn-primary'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isCurrentAnalyzed ? 'Analyzed' : 'Mark as Analyzed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
