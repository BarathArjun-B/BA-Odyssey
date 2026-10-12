import { useState } from 'react';
import { getAcademyData, saveAcademyData } from '../../../lib/academyStorage';
import { Network, CheckCircle2, Sparkles, Compass, ArrowRight } from 'lucide-react';

const NODES = [
  {
    id: 'problem_first',
    label: 'Problem-First Thinking',
    category: 'Discovery',
    x: 160,
    y: 120,
    connections: ['customer_discovery', 'icp'],
    definition: 'Anchor deeply on acute, frequent real-world pain rather than attaching to a preliminary tech solution.',
    application: 'Write a problem thesis that doesn\'t mention your software or tech stack once.'
  },
  {
    id: 'customer_discovery',
    label: 'Mom-Test Discovery',
    category: 'Discovery',
    x: 360,
    y: 100,
    connections: ['icp', 'concierge_mvp'],
    definition: 'Interviews focused strictly on the user\'s past behavior and manual workarounds, never hypothetical future purchases.',
    application: 'Ask: "When was the last time you dealt with this? What did you do?"'
  },
  {
    id: 'icp',
    label: 'Ideal Customer Profile',
    category: 'Strategy',
    x: 560,
    y: 120,
    connections: ['distribution_moat', 'value_prop'],
    definition: 'The narrowest persona who experiences the problem so painfully that they actively hack imperfect solutions.',
    application: 'Define the single trigger event that turns a prospect into a desperate buyer.'
  },
  {
    id: 'concierge_mvp',
    label: 'Concierge MVP',
    category: 'Product Craft',
    x: 240,
    y: 280,
    connections: ['feedback_loops', 'unit_economics'],
    definition: 'Delivering the service manually via human ops and spreadsheets before automating a single line of backend logic.',
    application: 'Solve the problem for 3 people by hand this week.'
  },
  {
    id: 'value_prop',
    label: 'Positioning & Value Prop',
    category: 'Strategy',
    x: 480,
    y: 260,
    connections: ['distribution_moat', 'unit_economics'],
    definition: 'The clear articulation of why your approach is uniquely suited for your specific target persona over alternatives.',
    application: 'Complete: "Unlike [Competitors], [Our Product] helps [ICP] achieve [Benefit] by [Secret]."'
  },
  {
    id: 'distribution_moat',
    label: 'Distribution Moat',
    category: 'Distribution',
    x: 700,
    y: 220,
    connections: ['network_effects'],
    definition: 'An acquisition channel that compounds over time (organic word-of-mouth, developer APIs, programmatic SEO).',
    application: 'Build an acquisition channel directly into your product\'s daily usage loop.'
  },
  {
    id: 'feedback_loops',
    label: 'Fast Feedback Loops',
    category: 'Product Craft',
    x: 200,
    y: 440,
    connections: ['pivot_matrix'],
    definition: 'Reducing the turnaround time between customer complaint and shipping a working fix to under 48 hours.',
    application: 'Ship a user-requested micro-improvement within 24 hours of receiving the request.'
  },
  {
    id: 'unit_economics',
    label: 'Unit Economics & LTV/CAC',
    category: 'Financials',
    x: 420,
    y: 420,
    connections: ['defensible_moats'],
    definition: 'Generating sustainable contribution margin where customer lifetime value exceeds acquisition cost by >3x.',
    application: 'Target a payback period of under 6 months on net customer acquisition cost.'
  },
  {
    id: 'network_effects',
    label: 'Network Effects',
    category: 'Distribution',
    x: 680,
    y: 380,
    connections: ['defensible_moats'],
    definition: 'Every new user makes the product systematically more valuable for every existing user on the network.',
    application: 'Enable users to invite collaborators to share data, templates, or project state.'
  },
  {
    id: 'pivot_matrix',
    label: 'Pivot Decision Matrix',
    category: 'Strategy',
    x: 280,
    y: 560,
    connections: ['defensible_moats'],
    definition: 'Rational diagnostic separating low-conversion onboarding friction from total lack of market demand.',
    application: 'Assess 30 user interviews: did anyone try to pay or use it daily without prompting?'
  },
  {
    id: 'defensible_moats',
    label: 'Defensible Moats',
    category: 'Strategy',
    x: 580,
    y: 540,
    connections: [],
    definition: 'Enduring competitive advantages: high switching costs, proprietary data assets, and brand trust.',
    application: 'Design data workflows that make switching out of your tool painful for enterprise workflows.'
  }
];

const CATEGORY_COLORS = {
  Discovery: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
  Strategy: 'text-violet-400 border-violet-500/40 bg-violet-500/10',
  'Product Craft': 'text-amber-400 border-amber-500/40 bg-amber-500/10',
  Distribution: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  Financials: 'text-rose-400 border-rose-500/40 bg-rose-500/10'
};

export default function KnowledgeGraph() {
  const [kgData, setKgData] = useState(() => getAcademyData('knowledgeGraph', { mastered: [] }));
  const [selectedNodeId, setSelectedNodeId] = useState('problem_first');

  const masteredNodes = kgData.mastered || [];
  const selectedNode = NODES.find(n => n.id === selectedNodeId) || NODES[0];
  const isMastered = masteredNodes.includes(selectedNode.id);

  const toggleMasterNode = (id) => {
    const nextMastered = masteredNodes.includes(id)
      ? masteredNodes.filter(x => x !== id)
      : [...masteredNodes, id];

    const updated = {
      ...kgData,
      mastered: nextMastered
    };

    setKgData(updated);
    saveAcademyData('knowledgeGraph', updated);

    // Update Founder IQ
    const iq = getAcademyData('founderIQ', {});
    const change = isMastered ? -0.3 : 0.3;
    saveAcademyData('founderIQ', {
      ...iq,
      learning: Math.min(10, Math.max(0, (iq.learning || 0) + change)),
      overallScore: Math.min(10, Math.max(0, (iq.overallScore || 0) + (isMastered ? -0.1 : 0.1)))
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-mono tracking-widest uppercase mb-1">
            <Network className="w-4 h-4" /> Concept Graph
          </div>
          <h1 className="text-display-lg" style={{ color: 'var(--text-primary)' }}>Startup Knowledge Graph</h1>
          <p className="text-body-sm text-muted">Interactive visual mesh connecting customer discovery, moats, and unit economics.</p>
        </div>

        <div className="px-3.5 py-1.5 rounded-lg bg-white/[0.02] border border-[var(--border-glass)] text-caption font-mono text-muted">
          Mastered: <span className="text-emerald-400 font-bold">{masteredNodes.length}</span> / {NODES.length}
        </div>
      </div>

      {/* Main Grid: Visual Graph + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph Canvas */}
        <div className="lg:col-span-8 glass-panel p-4 md:p-6 rounded-2xl relative overflow-x-auto min-h-[500px] flex items-center justify-center">
          <svg className="w-[820px] h-[640px] relative select-none">
            {/* Edges */}
            {NODES.map((source) =>
              source.connections.map((targetId) => {
                const target = NODES.find(n => n.id === targetId);
                if (!target) return null;
                const isEdgeActive = selectedNode.id === source.id || selectedNode.id === target.id;
                return (
                  <line
                    key={`${source.id}-${target.id}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={isEdgeActive ? 'rgba(139, 92, 246, 0.6)' : 'rgba(255, 255, 255, 0.1)'}
                    strokeWidth={isEdgeActive ? 2 : 1}
                    strokeDasharray={isEdgeActive ? '4 2' : undefined}
                  />
                );
              })
            )}

            {/* Nodes */}
            {NODES.map((node) => {
              const isSelected = selectedNode.id === node.id;
              const nodeMastered = masteredNodes.includes(node.id);
              return (
                <g
                  key={node.id}
                  className="cursor-pointer transition-transform duration-200"
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 26 : 22}
                    fill={nodeMastered ? 'rgba(16, 185, 129, 0.2)' : isSelected ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.04)'}
                    stroke={nodeMastered ? '#10b981' : isSelected ? '#a78bfa' : 'rgba(255, 255, 255, 0.2)'}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill={nodeMastered ? '#6ee7b7' : isSelected ? '#ffffff' : '#9ca3af'}
                  >
                    {node.label.slice(0, 3).toUpperCase()}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 36}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#9ca3af"
                    className="font-mono"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Inspector */}
        <div className="lg:col-span-4 glass-panel p-6 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <div>
              <span className={`px-2.5 py-0.5 rounded text-caption font-mono uppercase font-medium border ${CATEGORY_COLORS[selectedNode.category] || ''}`}>
                {selectedNode.category}
              </span>
              <h2 className="text-display-md mt-2" style={{ color: 'var(--text-primary)' }}>
                {selectedNode.label}
              </h2>
            </div>

            <div>
              <h4 className="text-caption font-mono uppercase text-muted tracking-wider mb-1.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-violet-400" /> Core Concept
              </h4>
              <p className="text-body-sm text-muted leading-relaxed bg-white/[0.02] p-3.5 rounded-xl border border-[var(--border-glass)]">
                {selectedNode.definition}
              </p>
            </div>

            <div>
              <h4 className="text-caption font-mono uppercase text-muted tracking-wider mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Actionable Application
              </h4>
              <p className="text-body-sm text-muted leading-relaxed bg-white/[0.02] p-3.5 rounded-xl border border-[var(--border-glass)]">
                {selectedNode.application}
              </p>
            </div>

            <div>
              <h4 className="text-caption font-mono uppercase text-muted tracking-wider mb-2">Connected Nodes</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.connections.map(cId => {
                  const target = NODES.find(n => n.id === cId);
                  return (
                    <button
                      key={cId}
                      onClick={() => setSelectedNodeId(cId)}
                      className="px-2.5 py-1 rounded-lg text-caption bg-white/[0.02] border border-[var(--border-glass)] text-muted hover:text-white flex items-center gap-1"
                    >
                      <span>{target?.label || cId}</span>
                      <ArrowRight className="w-3 h-3 text-muted/60" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-glass)] flex items-center justify-between">
            <span className="text-caption text-muted">
              {isMastered ? 'Mastery verified' : 'Mark concept as mastered'}
            </span>
            <button
              onClick={() => toggleMasterNode(selectedNode.id)}
              className={`px-4 py-2 rounded-lg text-body-sm font-medium flex items-center gap-2 transition-all ${
                isMastered
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'btn-primary'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isMastered ? 'Mastered' : 'Master Concept'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
