import { useData } from '../../context/DataContext';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

const OS_ITEMS = [
  { id: 'dsa', label: 'DSA' },
  { id: 'building', label: 'Building' },
  { id: 'businessReading', label: 'Business reading' },
  { id: 'problemCollection', label: 'Problem collection', isAuto: true },
  { id: 'networking', label: 'Networking' },
  { id: 'reflection', label: 'Reflection' }
];

export default function System() {
  const { data, toggleOSItem } = useData();

  const todayStr = new Date().toISOString().split('T')[0];
  const hasProblemsToday = data.problems.some(p => p.date === todayStr);

  // Generate last 7 days strings
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().split('T')[0]);
  }

  const getDayStatus = (dateStr, itemId) => {
    const log = data.operatingSystem.dailyLogs.find(l => l.date === dateStr);
    if (itemId === 'problemCollection') {
      const hasProbs = data.problems.some(p => p.date === dateStr);
      return (log && log.problemCollection) || hasProbs;
    }
    return log ? log[itemId] : false;
  };

  const calculateItemStreak = (itemId) => {
    let streak = 0;
    // Sort dates descending
    const logsMap = new Map();
    data.operatingSystem.dailyLogs.forEach(l => logsMap.set(l.date, l));
    
    let currentDate = new Date();
    currentDate.setHours(0,0,0,0);

    // Check today first
    const tdStr = currentDate.toISOString().split('T')[0];
    let isTodayDone = getDayStatus(tdStr, itemId);
    if (isTodayDone) streak++;

    // Check past days
    for (let i = 1; i < 365; i++) { // cap at 365 for safety
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      if (getDayStatus(ds, itemId)) {
        streak++;
      } else {
        // If today isn't done, but yesterday is, streak shouldn't break until tomorrow
        if (i === 1 && !isTodayDone) {
          // It's fine, we just haven't done it today yet, keep counting from yesterday
          continue; 
        }
        break;
      }
    }
    return streak;
  };

  const hasAnyData = data.operatingSystem.dailyLogs.length > 0;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-24 md:pb-0">
      <div>
        <h1 className="text-display-lg mb-1" style={{ color: 'var(--text-primary)' }}>Founder Operating System</h1>
        <p className="text-body-sm text-muted">The daily checklist.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Today's Checklist */}
        <div className="glass-panel p-8">
          <h3 className="font-catalogue text-display-md mb-6 border-b pb-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-glass)' }}>Today's Focus</h3>
          <div className="flex flex-col gap-4">
            {OS_ITEMS.map(item => {
              const isAuto = item.isAuto;
              const isChecked = getDayStatus(todayStr, item.id);
              
              return (
                <button 
                  key={item.id}
                  disabled={isAuto && hasProblemsToday}
                  onClick={() => toggleOSItem(todayStr, item.id, !isChecked)}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                >
                  <div className={cn(
                    "w-6 h-6 rounded flex items-center justify-center border transition-colors shrink-0",
                    isChecked ? "text-white" : "text-transparent group-hover:border-ink-muted"
                  )}
                  style={isChecked ? { background: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' } : { borderColor: 'var(--border-glass)' }}
                  >
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className={cn(
                      "text-body-md font-medium transition-colors",
                      isChecked ? "text-muted line-through" : ""
                    )}
                    style={!isChecked ? { color: 'var(--text-primary)' } : {}}
                    >
                      {item.label}
                    </span>
                    {isAuto && (
                      <span className="text-caption text-muted leading-tight">
                        Auto-completes when you log a problem.
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 7-Day Heatmap & Streaks */}
        <div className="glass-panel p-8">
          <h3 className="font-catalogue text-display-md mb-6 border-b pb-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-glass)' }}>7-Day Consistency</h3>
          
          {!hasAnyData ? (
             <div className="flex items-center justify-center h-40 border border-dashed rounded-xl" style={{ borderColor: 'var(--border-glass)' }}>
               <span className="text-body-sm text-muted">Your first week starts today.</span>
             </div>
          ) : (
            <div className="flex flex-col gap-6">
              {OS_ITEMS.map(item => (
                <div key={item.id} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                    <span className="text-caption text-muted font-label uppercase tracking-widest">{calculateItemStreak(item.id)} day streak</span>
                  </div>
                  <div className="flex gap-2">
                    {last7Days.map(dateStr => {
                      const done = getDayStatus(dateStr, item.id);
                      return (
                        <div 
                          key={dateStr}
                          title={dateStr}
                          className={cn(
                            "h-8 flex-1 rounded-[4px] transition-colors border",
                            done ? "" : "bg-transparent"
                          )}
                          style={done
                            ? { background: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }
                            : { borderColor: 'var(--border-glass)' }
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
