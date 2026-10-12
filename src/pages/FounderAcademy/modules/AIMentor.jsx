import { useState, useRef, useEffect } from 'react';
import { getAcademyData, saveAcademyData } from '../../../lib/academyStorage';
import { Send, Sparkles, Trash2, Bot, User, Lightbulb, Compass, Copy, Check } from 'lucide-react';

const PRESET_TOPICS = [
  {
    label: 'Validating Willingness to Pay',
    query: 'How do I validate customer willingness to pay before writing any backend code?'
  },
  {
    label: 'B2B Developer Tool Pricing',
    query: 'What is the optimal pricing and packaging model for early-stage B2B developer tooling?'
  },
  {
    label: 'First 10 Design Partners',
    query: 'What is the step-by-step playbook to recruit and onboard our first 10 design partners?'
  },
  {
    label: 'Pivot vs Iterate Framework',
    query: 'What concrete signals tell a founder it is time to pivot versus continue iterating?'
  },
  {
    label: 'True PMF Indicators',
    query: 'What are the leading operational signals that indicate true product-market fit?'
  }
];

const ADVICE_DATABASE = {
  pay: {
    title: 'Validating Willingness to Pay (Pre-Code)',
    diagnostic: 'Willingness to pay cannot be validated by asking "Would you pay for this?" People are polite and speculative. You must create an exchange of scarce currency: cash deposits, letters of intent (LOI), or access to company data/calendar.',
    tactics: [
      'The Concierge / Wizard of Oz Test: Offer to solve their acute problem manually via Google Sheets, Zapier, or manual labor for $100-$500/month before automating it.',
      'Signed Pilot LOI: Ask the prospect to sign a 1-page non-binding pilot agreement: "If we deliver X capability within 4 weeks, you agree to an annual contract of $Y."',
      'Pre-Order Stripe Invoicing: Ask for a 50% refundable deposit to secure their spot in the early access beta queue.'
    ],
    failureModes: 'Confusing enthusiastic verbal compliments with commercial intent. Never accept praise without asking for a credit card or contract signature.'
  },
  pricing: {
    title: 'Pricing Strategy for B2B & Developer Tools',
    diagnostic: 'Cost-plus pricing is amateur; value-based pricing is professional. For developer tools, friction in the onboarding flow kills top-of-funnel momentum, but free tiers without clear enterprise walls will starve the business.',
    tactics: [
      'Frictionless Individual Tier: Free for single developers or local dev environments to generate passionate grassroots advocacy.',
      'Team Gate: Charge per seat or per active workspace the moment collaboration, audit logs, or shared credentials are required.',
      'Consumption/Scale Gate: Align pricing directly with their growth metric (API calls, compute minutes, monthly active users, or records processed).',
      'Start Higher: Most early founders undercharge by 3x. Double your price on every second customer call until 20% of prospects push back on price alone.'
    ],
    failureModes: 'Giving away team-level enterprise features (SSO, role-based access, audit trails) for free.'
  },
  partners: {
    title: 'Acquiring Your First 10 Design Partners',
    diagnostic: 'Your first 10 customers are not buyers; they are co-creators. They will endure bugs, downtime, and rough edges if you are solving a hair-on-fire problem for them.',
    tactics: [
      'Warm Network & Second-Degree Intros: Ask trusted peers, "Who is the absolute best engineering lead you know who currently complains about X?"',
      'Shared Slack/Discord Channel: Create a dedicated VIP channel with each design partner. Respond to every bug or inquiry within 15 minutes.',
      'Weekly Iteration Cadence: Ship visible updates every 48-72 hours directly addressing their exact feedback.',
      'Explicit Expectation Setting: Give them 6 months of free or deeply discounted access in exchange for a mandatory 30-minute weekly feedback call.'
    ],
    failureModes: 'Mass blast cold email spamming without personalization. Treat the first 10 like bespoke enterprise consulting relationships.'
  },
  pivot: {
    title: 'The Pivot vs Iterate Decision Matrix',
    diagnostic: 'A pivot is not giving up; it is retaining your core vision while changing the hypothesis about which problem, customer, or distribution channel will realize it.',
    tactics: [
      'Iterate if: Retention is solid for a small core group (>30%), but onboarding friction is high, or users ask for specific deeper capabilities within the core loop.',
      'Pivot if: You have interviewed 30+ qualified target customers, built 3 iterations, and still encounter total apathy, zero organic retention, and reluctance to use the tool weekly.',
      'Inspect Latent Usage: Check your database for weird user behavior. Did users repurpose your tool for something you did not design? (Like Slack emerging from Glitch game chat).'
    ],
    failureModes: 'Pivoting every 2 weeks before giving any single hypothesis enough momentum to reach conclusive statistical or qualitative significance.'
  },
  pmf: {
    title: 'Leading Indicators of Product-Market Fit',
    diagnostic: 'PMF is not a binary switch; it is a pulling force. Pre-PMF, you have to push the rock up the hill. Post-PMF, the market is ripping the product out of your hands.',
    tactics: [
      'The Sean Ellis Benchmark: Survey users with "How would you feel if you could no longer use BA Odyssey?" If >40% say "Very disappointed", you have PMF.',
      'Spontaneous Word of Mouth: New signups arrive citing personal recommendations from current users without any paid ads or outreach.',
      'The Screaming Test: If the server goes down for 30 minutes, does your inbox get flooded with urgent customer messages asking when it will be back online?'
    ],
    failureModes: 'Confusing top-of-funnel signup spikes (driven by a ProductHunt launch or viral tweet) with long-term 90-day cohort retention.'
  }
};

function generateAdvice(query) {
  const qLower = query.toLowerCase();
  let advice = ADVICE_DATABASE.pay;

  if (qLower.includes('pric') || qLower.includes('tier') || qLower.includes('saas')) {
    advice = ADVICE_DATABASE.pricing;
  } else if (qLower.includes('partner') || qLower.includes('customer') || qLower.includes('recruit') || qLower.includes('first 10')) {
    advice = ADVICE_DATABASE.partners;
  } else if (qLower.includes('pivot') || qLower.includes('iterate') || qLower.includes('give up')) {
    advice = ADVICE_DATABASE.pivot;
  } else if (qLower.includes('pmf') || qLower.includes('market fit') || qLower.includes('retention') || qLower.includes('traction')) {
    advice = ADVICE_DATABASE.pmf;
  }

  return {
    id: 'adv_' + Date.now(),
    timestamp: new Date().toISOString(),
    question: query,
    answer: advice
  };
}

export default function AIMentor() {
  const [modules, setModules] = useState(() => getAcademyData('modules', {}));
  const [inputQuery, setInputQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const chatBottomRef = useRef(null);

  const conversations = modules.mentorConversations || [];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations.length]);

  const handleSend = (textToSend) => {
    const text = (textToSend || inputQuery).trim();
    if (!text) return;

    const newEntry = generateAdvice(text);
    const nextConvs = [...conversations, newEntry];

    const nextModules = {
      ...modules,
      mentorConversations: nextConvs
    };

    setModules(nextModules);
    saveAcademyData('modules', nextModules);
    setInputQuery('');

    // Boost Founder IQ
    const iq = getAcademyData('founderIQ', {});
    saveAcademyData('founderIQ', {
      ...iq,
      decisionMaking: Math.min(10, (iq.decisionMaking || 0) + 0.3),
      learning: Math.min(10, (iq.learning || 0) + 0.2),
      overallScore: Math.min(10, (iq.overallScore || 0) + 0.1)
    });
  };

  const clearHistory = () => {
    const nextModules = {
      ...modules,
      mentorConversations: []
    };
    setModules(nextModules);
    saveAcademyData('modules', nextModules);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto flex flex-col gap-6 h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-mono tracking-widest uppercase mb-1">
            <Bot className="w-4 h-4" /> Odyssey Synthetic Advisor
          </div>
          <h1 className="text-display-lg" style={{ color: 'var(--text-primary)' }}>Aura AI Founder Mentor</h1>
          <p className="text-body-sm text-muted">Tactical startup strategy, pricing diagnostics, and zero-to-one validation counsel.</p>
        </div>

        {conversations.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-[var(--border-glass)] text-caption text-muted hover:text-rose-400 hover:border-rose-500/30 transition-all self-start md:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        )}
      </div>

      {/* Preset Topic Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0 hidden sm:block" />
        <span className="text-caption text-muted font-mono uppercase shrink-0 hidden sm:block">Tactics:</span>
        {PRESET_TOPICS.map((topic, i) => (
          <button
            key={i}
            onClick={() => handleSend(topic.query)}
            className="px-3 py-1.5 rounded-lg text-caption whitespace-nowrap bg-white/[0.02] border border-[var(--border-glass)] text-muted hover:text-white hover:bg-white/[0.05] hover:border-violet-500/30 transition-all"
          >
            {topic.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {conversations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-[var(--border-glass)] rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-body-md font-semibold" style={{ color: 'var(--text-primary)' }}>Ask Aura Anything About Your Startup</h3>
            <p className="text-body-sm text-muted max-w-md mt-1">
              Test your pricing model, craft customer interview questions, or evaluate if it is time to pivot. Click a tactic above or type below.
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div key={conv.id} className="space-y-4">
              {/* User Question */}
              <div className="flex items-start gap-3 justify-end">
                <div className="max-w-xl p-4 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {conv.question}
                </div>
                <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              </div>

              {/* Mentor Answer */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>

                <div className="flex-1 max-w-2xl glass-panel p-6 rounded-2xl border border-[var(--border-glass)] space-y-5">
                  <div className="flex items-center justify-between border-b border-[var(--border-glass)] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-caption font-mono uppercase text-cyan-400 font-bold tracking-wider">Aura Synthetic Advisory</span>
                      <span className="text-caption text-muted">• {conv.answer.title}</span>
                    </div>

                    <button
                      onClick={() => handleCopy(conv.id, `${conv.answer.title}\n\n${conv.answer.diagnostic}\n\n${conv.answer.tactics.join('\n')}`)}
                      className="text-muted hover:text-white p-1 rounded transition-colors"
                      title="Copy advice"
                    >
                      {copiedId === conv.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div>
                    <h4 className="text-caption font-mono uppercase text-muted tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> First-Principles Diagnostic
                    </h4>
                    <p className="text-body-sm text-muted leading-relaxed">
                      {conv.answer.diagnostic}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-caption font-mono uppercase text-muted tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Actionable Execution Playbook
                    </h4>
                    <div className="space-y-2">
                      {conv.answer.tactics.map((tactic, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-[var(--border-glass)] text-body-sm text-muted flex items-start gap-2.5">
                          <span className="text-caption font-mono text-violet-400 font-bold shrink-0 mt-0.5">{idx + 1}.</span>
                          <span>{tactic}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-500/[0.05] border border-rose-500/20">
                    <span className="text-caption font-mono uppercase text-rose-400 font-bold tracking-wider block mb-1">Critical Failure Mode to Avoid</span>
                    <p className="text-body-sm text-rose-200/90 leading-relaxed">
                      {conv.answer.failureModes}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-3 p-2 bg-white/[0.02] border border-[var(--border-glass)] rounded-2xl shrink-0"
      >
        <input
          type="text"
          placeholder="Ask about pricing, ICP discovery, moats, sales objections..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="flex-1 bg-transparent px-4 py-2 text-body-sm placeholder:text-muted/50 focus:outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
        <button
          type="submit"
          disabled={!inputQuery.trim()}
          className="btn-primary px-4 py-2 rounded-xl flex items-center gap-2 text-body-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          <span>Consult</span>
        </button>
      </form>
    </div>
  );
}
