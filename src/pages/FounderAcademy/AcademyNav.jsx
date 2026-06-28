import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  Rocket, Lightbulb, Package, Users, GitBranch, Database, 
  UserCircle, BookOpen, MessageSquare, Target, BarChart2, 
  Network, ClipboardList 
} from 'lucide-react';
import { getAcademyData } from '../../lib/academyStorage';

const navSections = [
  {
    title: 'Core Curriculum',
    links: [
      { to: '/academy/fundamentals', label: 'Startup Fundamentals', icon: Rocket },
      { to: '/academy/thinking', label: 'Founder Thinking', icon: Lightbulb },
      { to: '/academy/product', label: 'Product Thinking', icon: Package },
      { to: '/academy/leadership', label: 'Leadership', icon: Users },
    ]
  },
  {
    title: 'Practice & Intelligence',
    links: [
      { to: '/academy/simulator', label: 'Decision Simulator', icon: GitBranch },
      { to: '/academy/missions', label: 'Daily Missions', icon: Target },
      { to: '/academy/mentor', label: 'AI Mentor', icon: MessageSquare },
      { to: '/academy/debrief', label: 'Mission Debrief', icon: ClipboardList },
    ]
  },
  {
    title: 'Reference & Insights',
    links: [
      { to: '/academy/startups', label: 'Startup Database', icon: Database },
      { to: '/academy/founders', label: 'Founder Profiles', icon: UserCircle },
      { to: '/academy/books', label: 'Book Library', icon: BookOpen },
    ]
  },
  {
    title: 'Your Progress',
    links: [
      { to: '/academy/iq', label: 'Founder IQ', icon: BarChart2 },
      { to: '/academy/graph', label: 'Knowledge Graph', icon: Network },
    ]
  }
];

export default function AcademyNav() {
  const iqData = getAcademyData('founderIQ', {});
  const overallScore = (iqData.overallScore || 0).toFixed(1);

  return (
    <div className="flex flex-col h-full py-4 px-3 space-y-6">
      
      {/* Header section */}
      <div className="px-3 mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-body-base font-semibold text-white">Founder Academy</h2>
          <div className="text-body-sm text-muted">IQ: {overallScore}/10</div>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm transition-all duration-200",
                        isActive 
                          ? "bg-[rgba(124,107,168,0.15)] text-primary font-medium" 
                          : "text-muted hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
                      )
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
