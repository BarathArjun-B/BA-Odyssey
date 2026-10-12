import { useState } from 'react';
import { getAcademyData, saveAcademyData } from '../../../lib/academyStorage';
import { GitBranch, AlertTriangle, ArrowRight } from 'lucide-react';

const SCENARIOS = [
  {
    id: 1,
    title: 'The Whaling Trap: 4 Months of Runway',
    situation: 'Your B2B SaaS startup has $80k in the bank with a monthly burn of $20k (4 months left). A Fortune 500 company offers to pay $150,000 upfront, but demands a custom on-premise installation, custom LDAP integration, and a dedicated Slack channel with guaranteed 1-hour response SLA.',
    options: [
      {
        id: 'A',
        text: 'Accept the contract and pivot the team to deliver the custom installation.',
        outcome: 'You extended your runway by 7 months, but your team became an unpaid dev agency. Core product progress ground to a halt and your other 15 SaaS clients churned.',
        iqImpact: { decisionMaking: -0.5, execution: 0.2 },
        verdict: 'Dangerous Trap'
      },
      {
        id: 'B',
        text: 'Reject the on-premise request. Offer cloud SaaS with an enterprise security add-on, or walk away.',
        outcome: 'The enterprise client refused on-premise, but agreed to a standard enterprise cloud pilot for $40k. You maintained product focus and closed two similar accounts.',
        iqImpact: { decisionMaking: 0.8, productThinking: 0.6 },
        verdict: 'Masterful Founder Focus'
      },
      {
        id: 'C',
        text: 'Offer to hire two offshore contractors specifically to service the custom contract.',
        outcome: 'Managing the contractors consumed 60% of founder time. The enterprise client was dissatisfied with contractor quality and withheld milestone payments.',
        iqImpact: { decisionMaking: -0.2, leadership: 0.1 },
        verdict: 'Operational Drag'
      }
    ]
  },
  {
    id: 2,
    title: 'Co-Founder Misalignment: The AI Wrapper Pivot',
    situation: 'Your technical co-founder feels the current problem journal tool is too slow to gain viral growth. They propose pausing customer interviews to build a flashy generative AI tool because "it will get 10,000 upvotes on Product Hunt next week."',
    options: [
      {
        id: 'A',
        text: 'Agree to build the viral tool to ride the hype wave and acquire quick signups.',
        outcome: 'You got 4,000 signups on launch day, but 98% churned within 72 hours. You burned 6 weeks of runway with zero paying customers.',
        iqImpact: { customerUnderstanding: -0.8, decisionMaking: -0.4 },
        verdict: 'Vanity Trap'
      },
      {
        id: 'B',
        text: 'Insist on 10 customer interviews first to identify if real founders will pay for the AI feature before coding.',
        outcome: 'Interviews revealed users wanted structured idea scoring, not generic AI chatting. You built a focused scoring algorithm with high retention.',
        iqImpact: { customerUnderstanding: 0.9, decisionMaking: 0.7 },
        verdict: 'Disciplined Founder'
      }
    ]
  }
];

export default function DecisionSimulator() {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [decisions, setDecisions] = useState(() => {
    const data = getAcademyData('modules', {});
    return data.decisionSimulator?.decisions || [];
  });

  const scenario = SCENARIOS[currentScenarioIndex];

  const handleSelect = (option) => {
    setSelectedOption(option);

    const newDecision = {
      scenarioId: scenario.id,
      optionId: option.id,
      timestamp: new Date().toISOString(),
      verdict: option.verdict
    };

    const nextDecisions = [...decisions.filter(d => d.scenarioId !== scenario.id), newDecision];
    setDecisions(nextDecisions);

    const modules = getAcademyData('modules', {});
    saveAcademyData('modules', {
      ...modules,
      decisionSimulator: {
        ...(modules.decisionSimulator || {}),
        scenariosCompleted: nextDecisions.length,
        decisions: nextDecisions
      }
    });

    const iq = getAcademyData('founderIQ', {});
    saveAcademyData('founderIQ', {
      ...iq,
      decisionMaking: Math.min(10, Math.max(0, (iq.decisionMaking || 0) + (option.iqImpact?.decisionMaking || 0.2))),
      overallScore: Math.min(10, (iq.overallScore || 0) + 0.3)
    });
  };

  const nextScenario = () => {
    setSelectedOption(null);
    setCurrentScenarioIndex((prev) => (prev + 1) % SCENARIOS.length);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-mono tracking-widest uppercase mb-1">
            <GitBranch className="w-4 h-4" /> Crucible Simulation
          </div>
          <h1 className="text-display-lg" style={{ color: 'var(--text-primary)' }}>Decision Simulator</h1>
          <p className="text-body-sm text-muted">Stress-test your founder instincts in high-stakes startup dilemmas.</p>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded-full border border-violet-500/30 text-violet-300 bg-violet-500/10">
          Scenario {currentScenarioIndex + 1} of {SCENARIOS.length}
        </span>
      </div>

      <div className="glass-panel p-6 md:p-8 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <h2 className="text-display-md" style={{ color: 'var(--text-primary)' }}>{scenario.title}</h2>
        </div>

        <div className="p-5 rounded-xl bg-white/[0.02] border border-[var(--border-glass)] text-body-md leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {scenario.situation}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-caption font-mono uppercase text-muted tracking-wider">What is your call, Founder?</span>
          {scenario.options.map((option) => {
            const isChosen = selectedOption?.id === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3 ${
                  isChosen 
                    ? 'bg-violet-500/20 border-violet-500 text-primary' 
                    : 'bg-white/[0.02] border-[var(--border-glass)] text-muted hover:bg-white/[0.05] hover:text-primary'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5">
                  {option.id}
                </span>
                <span className="text-body-sm leading-relaxed">{option.text}</span>
              </button>
            );
          })}
        </div>

        {selectedOption && (
          <div className="p-6 rounded-xl border border-violet-500/30 bg-violet-500/10 animate-in fade-in slide-in-from-top-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-violet-300">
                Simulation Analysis: {selectedOption.verdict}
              </span>
            </div>
            <p className="text-body-sm text-primary leading-relaxed">
              {selectedOption.outcome}
            </p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={nextScenario}
                className="btn-primary flex items-center gap-2"
              >
                Next Scenario <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
