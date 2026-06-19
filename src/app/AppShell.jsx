import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Compass, Lightbulb, 
  Grid, CalendarDays, TrendingUp, SquareCheck, 
  Settings, Info, Plus, Moon, Sun, Laptop
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { CosmicBackground, MoonElement } from '../components/cosmic';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/discover', label: 'Discover', icon: Compass },
  { path: '/ideas', label: 'Ideas', icon: Lightbulb },
  { path: '/matrix', label: 'Matrix', icon: Grid },
  { path: '/review', label: 'Review', icon: CalendarDays },
  { path: '/growth', label: 'Growth', icon: TrendingUp },
  { path: '/system', label: 'System', icon: SquareCheck },
];

const SECONDARY_NAV = [
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/about', label: 'About', icon: Info },
];

export default function AppShell() {
  const { theme, setTheme } = useTheme();
  const { data } = useData();
  const navigate = useNavigate();

  const handleThemeToggle = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun className="w-5 h-5" />;
    if (theme === 'dark') return <Moon className="w-5 h-5" />;
    return <Laptop className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative isolate">
      {/* Cosmic Background — mounted once, fixed, behind everything */}
      <CosmicBackground />
      <MoonElement />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 p-4 sticky top-0 h-screen relative z-10" style={{ background: '#000000', borderRight: '1px solid rgba(255, 255, 255, 0.03)', backgroundImage: 'linear-gradient(90deg, transparent, rgba(147, 112, 219, 0.03) 50%, transparent)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
        <div className="flex items-center gap-2 px-2 py-4 mb-6">
          <div className="w-8 h-8 rounded flex items-center justify-center font-catalogue font-bold text-xl leading-none" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'var(--text-primary)' }}>
            BA
          </div>
          <span className="font-catalogue text-display-md tracking-tight" style={{ color: 'var(--text-primary)' }}>Journal</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "sidebar-item flex items-center gap-3",
                isActive ? "active" : ""
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1 pt-6" style={{ borderTop: '1px solid var(--border-glass)' }}>
          {SECONDARY_NAV.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "sidebar-item flex items-center gap-3",
                isActive ? "active" : ""
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen relative pb-20 md:pb-0 max-w-[1200px] mx-auto w-full z-10">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center font-catalogue font-bold text-sm" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'var(--text-primary)' }}>
              BA
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button 
              onClick={handleThemeToggle}
              className="p-2 text-muted hover:text-primary transition-colors rounded-full"
              style={{ background: 'rgba(255,255,255,0.04)' }}
              title={`Theme: ${theme}`}
            >
              {getThemeIcon()}
            </button>
            <button 
              onClick={() => navigate('/journal')}
              className="btn-primary hidden md:flex items-center gap-2 !rounded-full"
            >
              <Plus className="w-4 h-4" />
              Log problem
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 px-4 md:px-8 py-4">
          <Outlet />
        </div>
      </main>

      {/* Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-2 z-50" style={{ background: 'rgba(5, 5, 5, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid var(--border-glass)' }}>
        {NAV_ITEMS.slice(0, 4).map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors",
              isActive ? "text-accent-violet" : "text-muted"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
        
        {/* Floating Quick Add */}
        <button 
          onClick={() => navigate('/journal')}
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg btn-primary hover:scale-105 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>

        <NavLink
          to="/matrix"
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors",
            isActive ? "text-accent-violet" : "text-muted"
          )}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-medium">More</span>
        </NavLink>
      </nav>
    </div>
  );
}
