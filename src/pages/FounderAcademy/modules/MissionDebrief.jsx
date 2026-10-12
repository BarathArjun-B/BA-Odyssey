import { useState } from 'react';
import { getAcademyData, saveAcademyData } from '../../../lib/academyStorage';
import { ClipboardList, Plus, Trash2, CheckCircle2, Star, Sparkles } from 'lucide-react';

const DECISION_BADGES = {
  'DOUBLE DOWN': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'ITERATE': 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  'PIVOT': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'KILL': 'bg-rose-500/15 text-rose-300 border-rose-500/30'
};

export default function MissionDebrief() {
  const [debriefs, setDebriefs] = useState(() => getAcademyData('missionDebriefs', []));
  const [showForm, setShowForm] = useState(false);
  const [filterDecision, setFilterDecision] = useState('ALL');

  // Form State
  const [title, setTitle] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [actualOutcome, setActualOutcome] = useState('');
  const [surprise, setSurprise] = useState('');
  const [decision, setDecision] = useState('ITERATE');
  const [confidence, setConfidence] = useState(4);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !hypothesis.trim()) return;

    const newDebrief = {
      id: 'deb_' + Date.now(),
      title: title.trim(),
      hypothesis: hypothesis.trim(),
      actualOutcome: actualOutcome.trim() || 'Observed customer responses and logged telemetry.',
      surprise: surprise.trim() || 'Validated baseline assumptions with minor caveats.',
      decision,
      confidence: Number(confidence),
      createdAt: new Date().toISOString()
    };

    const nextDebriefs = [newDebrief, ...debriefs];
    setDebriefs(nextDebriefs);
    saveAcademyData('missionDebriefs', nextDebriefs);

    // Reset Form
    setTitle('');
    setHypothesis('');
    setActualOutcome('');
    setSurprise('');
    setDecision('ITERATE');
    setConfidence(4);
    setShowForm(false);

    // Boost Founder IQ
    const iq = getAcademyData('founderIQ', {});
    saveAcademyData('founderIQ', {
      ...iq,
      validation: Math.min(10, (iq.validation || 0) + 0.4),
      decisionMaking: Math.min(10, (iq.decisionMaking || 0) + 0.5),
      overallScore: Math.min(10, (iq.overallScore || 0) + 0.2)
    });
  };

  const handleDelete = (id) => {
    const nextDebriefs = debriefs.filter(d => d.id !== id);
    setDebriefs(nextDebriefs);
    saveAcademyData('missionDebriefs', nextDebriefs);
  };

  const filteredDebriefs = debriefs.filter(d => {
    if (filterDecision === 'ALL') return true;
    return d.decision === filterDecision;
  });

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-mono tracking-widest uppercase mb-1">
            <ClipboardList className="w-4 h-4" /> Experiment Reflection Core
          </div>
          <h1 className="text-display-lg" style={{ color: 'var(--text-primary)' }}>Mission Debrief Engine</h1>
          <p className="text-body-sm text-muted">Deconstruct customer calls, prototype tests, and disconfirming validation signals.</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary px-4 py-2 rounded-xl flex items-center gap-2 text-body-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Cancel Debrief' : 'New Mission Debrief'}</span>
        </button>
      </div>

      {/* Debrief Form Modal / Panel */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8 rounded-2xl flex flex-col gap-5 border border-violet-500/30">
          <h2 className="text-display-md" style={{ color: 'var(--text-primary)' }}>Log Post-Experiment Debrief</h2>

          <div>
            <label className="text-caption font-mono uppercase text-muted tracking-wider block mb-1.5">
              Mission / Experiment Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Discovery call with Series A Engineering Director"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.02] border border-[var(--border-glass)] text-body-sm focus:outline-none focus:border-violet-500/50"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-caption font-mono uppercase text-muted tracking-wider block mb-1.5">
              Original Hypothesis * (What did we believe before starting?)
            </label>
            <textarea
              rows={2}
              placeholder="We believed they would pay $200/mo to automate X because Y was costing them 5 hours/week..."
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              required
              className="w-full p-3 rounded-xl bg-white/[0.02] border border-[var(--border-glass)] text-body-sm focus:outline-none focus:border-violet-500/50 resize-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-caption font-mono uppercase text-muted tracking-wider block mb-1.5">
                What Actually Happened?
              </label>
              <textarea
                rows={3}
                placeholder="The prospect confirmed the pain, but said internal security compliance blocks external tools..."
                value={actualOutcome}
                onChange={(e) => setActualOutcome(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/[0.02] border border-[var(--border-glass)] text-body-sm focus:outline-none focus:border-violet-500/50 resize-none"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="text-caption font-mono uppercase text-muted tracking-wider block mb-1.5">
                The Disconfirming Surprise (What shocked us?)
              </label>
              <textarea
                rows={3}
                placeholder="They don't care about speed; they care exclusively about audit compliance and SOC2..."
                value={surprise}
                onChange={(e) => setSurprise(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/[0.02] border border-[var(--border-glass)] text-body-sm focus:outline-none focus:border-violet-500/50 resize-none"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-caption font-mono uppercase text-muted tracking-wider block mb-1.5">
                Next Strategic Decision
              </label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.02] border border-[var(--border-glass)] text-body-sm focus:outline-none focus:border-violet-500/50"
                style={{ color: 'var(--text-primary)' }}
              >
                <option value="DOUBLE DOWN" className="bg-[#121218]">DOUBLE DOWN (Clear PMF signal)</option>
                <option value="ITERATE" className="bg-[#121218]">ITERATE (Valuable feedback, tweak wedge)</option>
                <option value="PIVOT" className="bg-[#121218]">PIVOT (Acute pain missing, explore adjacent ICP)</option>
                <option value="KILL" className="bg-[#121218]">KILL (Idea invalid, move to next opportunity)</option>
              </select>
            </div>

            <div>
              <label className="text-caption font-mono uppercase text-muted tracking-wider block mb-1.5">
                Evidence Confidence (1 - 5)
              </label>
              <div className="flex items-center gap-2 pt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setConfidence(star)}
                    className="p-1 text-muted hover:text-amber-400 transition-colors"
                  >
                    <Star
                      className={`w-5 h-5 ${star <= confidence ? 'text-amber-400 fill-amber-400' : 'text-muted/40'}`}
                    />
                  </button>
                ))}
                <span className="text-caption font-mono text-muted ml-2">{confidence} / 5 Stars</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-glass)]">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-body-sm text-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2.5 rounded-xl text-body-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Debrief</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-caption font-mono uppercase text-muted mr-1">Filter Decision:</span>
        {['ALL', 'DOUBLE DOWN', 'ITERATE', 'PIVOT', 'KILL'].map((d) => (
          <button
            key={d}
            onClick={() => setFilterDecision(d)}
            className={`px-3 py-1 rounded-lg text-caption font-mono transition-all ${
              filterDecision === d
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                : 'bg-white/[0.02] text-muted border border-[var(--border-glass)] hover:bg-white/[0.05]'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Debriefs Timeline / Cards */}
      <div className="space-y-4">
        {filteredDebriefs.length === 0 ? (
          <div className="p-12 text-center text-muted border border-dashed border-[var(--border-glass)] rounded-2xl flex flex-col items-center">
            <ClipboardList className="w-8 h-8 text-muted/40 mb-3" />
            <h3 className="text-body-md font-semibold" style={{ color: 'var(--text-primary)' }}>No Mission Debriefs Yet</h3>
            <p className="text-body-sm text-muted max-w-sm mt-1">
              After talking to prospective customers or testing a prototype, log your findings to build rigor into your decision process.
            </p>
          </div>
        ) : (
          filteredDebriefs.map((deb) => (
            <div key={deb.id} className="glass-panel p-6 rounded-2xl border border-[var(--border-glass)] space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className={`px-2.5 py-0.5 rounded text-caption font-mono uppercase font-bold border ${DECISION_BADGES[deb.decision] || ''}`}>
                      {deb.decision}
                    </span>
                    <span className="text-caption text-muted font-mono">
                      {new Date(deb.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-0.5 ml-2">
                      {[...Array(deb.confidence || 3)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-body-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {deb.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleDelete(deb.id)}
                  className="p-1.5 rounded-lg text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete debrief"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-[var(--border-glass)]">
                  <span className="text-caption font-mono uppercase text-muted tracking-wider block mb-1">
                    Pre-Test Hypothesis
                  </span>
                  <p className="text-body-sm text-muted leading-relaxed">
                    {deb.hypothesis}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-[var(--border-glass)]">
                  <span className="text-caption font-mono uppercase text-cyan-400 tracking-wider block mb-1">
                    Actual Ground Reality
                  </span>
                  <p className="text-body-sm text-muted leading-relaxed">
                    {deb.actualOutcome}
                  </p>
                </div>
              </div>

              {deb.surprise && (
                <div className="p-3.5 rounded-xl bg-violet-500/[0.05] border border-violet-500/20">
                  <span className="text-caption font-mono uppercase text-violet-300 tracking-wider block mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Critical Disconfirming Learning
                  </span>
                  <p className="text-body-sm text-violet-200 leading-relaxed">
                    {deb.surprise}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
