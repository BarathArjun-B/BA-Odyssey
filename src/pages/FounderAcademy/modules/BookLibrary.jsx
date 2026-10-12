import { useState } from 'react';
import { getAcademyData, saveAcademyData } from '../../../lib/academyStorage';
import { BookOpen, Search, CheckCircle2, Star, Sparkles, Filter } from 'lucide-react';

const BOOKS = [
  {
    id: 'momTest',
    title: 'The Mom Test',
    author: 'Rob Fitzpatrick',
    category: 'Customer Discovery',
    rating: 4.9,
    pages: 134,
    thesis: 'People lie to be polite. You cannot ask people if your idea is good; you must ask about their actual past behavior and current workflow hacks.',
    takeaways: [
      'Talk about their life and past actions, not your hypothetical product idea.',
      'Ask about specific instances in the past, never hypothetical future intentions.',
      'Talk less and listen more; if you\'re pitching, you\'re failing the customer interview.'
    ],
    founderAction: 'Conduct your next 5 customer discovery conversations without mentioning your product name or features once.'
  },
  {
    id: 'zeroToOne',
    title: 'Zero to One',
    author: 'Peter Thiel & Blake Masters',
    category: 'Strategy & Moats',
    rating: 4.8,
    pages: 224,
    thesis: 'Every moment in business happens only once. Progress comes from building monopolies through technology, network effects, scale, or branding rather than competing in commoditized markets.',
    takeaways: [
      'Competition is for losers. Aim to dominate a tiny, well-defined niche first.',
      'Secrets: What valuable truth do very few people agree with you on?',
      'Sales and distribution matter just as much as engineering and product craft.'
    ],
    founderAction: 'Identify the smallest subset of customers you can achieve a 90% market share in before expanding horizontally.'
  },
  {
    id: 'obviouslyAwesome',
    title: 'Obviously Awesome',
    author: 'April Dunford',
    category: 'Positioning & Sales',
    rating: 4.9,
    pages: 206,
    thesis: 'Positioning defines how your product is the best in the world at delivering a unique value that a specific customer cares deeply about.',
    takeaways: [
      'Your real competition is what customers would do if you didn\'t exist (often Excel or hiring an intern).',
      'Unique attributes are only as valuable as the business value they unlock for the customer.',
      'Never let market categories define your product by default; choose the frame intentionally.'
    ],
    founderAction: 'Draft a 1-sentence positioning statement specifying your target customer, competitive alternative, and unique value.'
  },
  {
    id: 'highOutputManagement',
    title: 'High Output Management',
    author: 'Andy Grove',
    category: 'Operations',
    rating: 4.9,
    pages: 272,
    thesis: 'A manager\'s output is the output of the organizational units under their supervision or influence. Focus on activities with high managerial leverage.',
    takeaways: [
      'Managerial leverage: small inputs yielding massive downstream outputs (e.g., 1-on-1s, training).',
      'The breakfast factory model: optimize the limiting step (the bottleneck) in your workflow.',
      'Indicators: inspect leading indicators, not lagging financial reports.'
    ],
    founderAction: 'Identify the single limiting step that dictates the speed of your product delivery this week.'
  },
  {
    id: 'ampItUp',
    title: 'Amp It Up',
    author: 'Frank Slootman',
    category: 'Execution',
    rating: 4.7,
    pages: 208,
    thesis: 'Leading high growth requires ratcheting up pace, raising standards, and narrowing focus. Incrementalism is the silent killer of enterprise software.',
    takeaways: [
      'Increase urgency: shorten execution horizons from quarters to weeks and days.',
      'Raise standards: what was acceptable yesterday is substandard tomorrow.',
      'Align incentives directly with customer retention and consumption.'
    ],
    founderAction: 'Pick your top 3 initiatives for this month and eliminate initiatives #2 and #3 to focus 100% on #1.'
  },
  {
    id: 'theLeanStartup',
    title: 'The Lean Startup',
    author: 'Eric Ries',
    category: 'Product & MVP',
    rating: 4.6,
    pages: 336,
    thesis: 'Startups exist to learn how to build a sustainable business. Rapid experimentation and validated learning loops minimize wasted capital.',
    takeaways: [
      'Build - Measure - Learn: the fundamental feedback loop of venture validation.',
      'Minimum Viable Product (MVP): the fastest way to start learning with the least effort.',
      'Vanity metrics vs actionable metrics: measure user retention and engagement, not raw page visits.'
    ],
    founderAction: 'Design an MVP experiment that tests your riskiest assumption without writing backend code.'
  }
];

export default function BookLibrary() {
  const [modules, setModules] = useState(() => getAcademyData('modules', {}));
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBook, setSelectedBook] = useState(BOOKS[0]);

  const bookData = modules.bookLibrary || { statuses: {} };
  const statuses = bookData.statuses || {}; // { [bookId]: 'unread' | 'reading' | 'read' }

  const categories = ['All', 'Customer Discovery', 'Strategy & Moats', 'Positioning & Sales', 'Operations', 'Execution', 'Product & MVP'];

  const filteredBooks = BOOKS.filter(b => {
    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.thesis.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const setBookStatus = (bookId, status) => {
    const nextStatuses = {
      ...statuses,
      [bookId]: status
    };

    const nextModules = {
      ...modules,
      bookLibrary: {
        ...bookData,
        statuses: nextStatuses
      }
    };

    setModules(nextModules);
    saveAcademyData('modules', nextModules);

    // Update Founder IQ
    if (status === 'read') {
      const iq = getAcademyData('founderIQ', {});
      saveAcademyData('founderIQ', {
        ...iq,
        learning: Math.min(10, (iq.learning || 0) + 0.5),
        productThinking: Math.min(10, (iq.productThinking || 0) + 0.3),
        overallScore: Math.min(10, (iq.overallScore || 0) + 0.15)
      });
    }
  };

  const currentStatus = statuses[selectedBook.id] || 'unread';

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-mono tracking-widest uppercase mb-1">
            <BookOpen className="w-4 h-4" /> Essential Literature
          </div>
          <h1 className="text-display-lg" style={{ color: 'var(--text-primary)' }}>Founder Library</h1>
          <p className="text-body-sm text-muted">Concentrated playbooks, tactical mental frameworks, and execution principles.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg bg-white/[0.02] border border-[var(--border-glass)] text-caption font-mono text-muted">
            Read: <span className="text-emerald-400 font-bold">{Object.values(statuses).filter(s => s === 'read').length}</span> / {BOOKS.length}
          </div>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, author, or thesis..."
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Book List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {filteredBooks.map((book) => {
            const status = statuses[book.id] || 'unread';
            const isSelected = selectedBook.id === book.id;
            return (
              <div
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-violet-500/10 border-violet-500/40 shadow-lg shadow-violet-500/5'
                    : 'bg-white/[0.02] border-[var(--border-glass)] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h3 className="text-body-md font-semibold" style={{ color: 'var(--text-primary)' }}>{book.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-caption text-violet-400 font-mono">{book.author}</span>
                      <span className="text-caption text-muted">•</span>
                      <span className="text-caption text-muted">{book.category}</span>
                    </div>
                  </div>
                  {status === 'read' ? (
                    <span className="px-2 py-0.5 rounded text-caption font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Read
                    </span>
                  ) : status === 'reading' ? (
                    <span className="px-2 py-0.5 rounded text-caption font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Reading
                    </span>
                  ) : null}
                </div>
                <p className="text-caption text-muted line-clamp-2 leading-relaxed">
                  {book.thesis}
                </p>
              </div>
            );
          })}
        </div>

        {/* Selected Book Reader Panel */}
        <div className="lg:col-span-7 glass-panel p-6 md:p-8 flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="px-2 py-0.5 rounded text-caption font-mono bg-violet-500/15 text-violet-300 border border-violet-500/30">
                  {selectedBook.category}
                </span>
                <h2 className="text-display-md mt-2" style={{ color: 'var(--text-primary)' }}>{selectedBook.title}</h2>
                <p className="text-body-sm text-muted mt-0.5">by {selectedBook.author} • {selectedBook.pages} pages</p>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-[var(--border-glass)]">
                {['unread', 'reading', 'read'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setBookStatus(selectedBook.id, st)}
                    className={`px-2.5 py-1 rounded-lg text-caption capitalize transition-all ${
                      currentStatus === st
                        ? st === 'read'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                          : st === 'reading'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                          : 'bg-violet-500/20 text-violet-300 border border-violet-500/40 font-medium'
                        : 'text-muted hover:text-white'
                    }`}
                  >
                    {st === 'unread' ? 'Want to Read' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Core Thesis */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-[var(--border-glass)]">
              <h4 className="text-caption font-mono uppercase text-violet-400 tracking-wider mb-1.5">
                Core Thesis
              </h4>
              <p className="text-body-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {selectedBook.thesis}
              </p>
            </div>

            {/* Key Takeaways */}
            <div>
              <h4 className="text-caption font-mono uppercase text-muted tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Key Principles
              </h4>
              <ul className="flex flex-col gap-2.5">
                {selectedBook.takeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-body-sm text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Founder Action Prompt */}
            <div className="p-4 rounded-xl bg-violet-500/[0.06] border border-violet-500/20">
              <h4 className="text-caption font-mono uppercase text-violet-300 tracking-wider mb-1 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-violet-400" /> Direct Action for Your Venture
              </h4>
              <p className="text-body-sm text-violet-200 leading-relaxed">
                {selectedBook.founderAction}
              </p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-[var(--border-glass)] flex items-center justify-between">
            <span className="text-caption text-muted">
              {currentStatus === 'read' ? 'Completed & recorded in Founder IQ' : 'Mark as "Read" to earn Founder IQ learning points'}
            </span>
            <button
              onClick={() => setBookStatus(selectedBook.id, currentStatus === 'read' ? 'unread' : 'read')}
              className={`px-5 py-2 rounded-lg text-body-sm font-medium flex items-center gap-2 transition-all ${
                currentStatus === 'read'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'btn-primary'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {currentStatus === 'read' ? 'Completed' : 'Mark as Read'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
