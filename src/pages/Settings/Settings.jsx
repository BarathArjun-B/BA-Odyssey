import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { exportData, importData, resetData } from '../../lib/storage';

export default function Settings() {
  const { data, updateSettings, forceReloadData } = useData();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(data.settings.founderName || '');
  const [goal, setGoal] = useState(data.settings.problemGoal || 1000);
  const [importStatus, setImportStatus] = useState('');

  const handleSaveProfile = () => {
    updateSettings({ founderName: name, problemGoal: Number(goal) });
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const success = importData(e.target.result);
      if (success) {
        setImportStatus('Import successful. Reloading...');
        setTimeout(() => {
          forceReloadData();
          setImportStatus('');
        }, 1000);
      } else {
        setImportStatus('Failed to import. Invalid file.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to delete all data? This cannot be undone.")) {
      resetData();
      forceReloadData();
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto pb-24 md:pb-0">
      <div>
        <h1 className="text-display-lg mb-1" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-body-sm text-muted">Configure your mission control.</p>
      </div>

      <div className="glass-panel p-6 flex flex-col gap-6">
        <h3 className="font-catalogue text-display-md border-b pb-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-glass)' }}>Profile & Goals</h3>
        
        <div className="flex flex-col gap-2">
          <label className="text-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>Founder Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            onBlur={handleSaveProfile}
            className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus"
            style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>1,000-Problem Goal</label>
          <input 
            type="number" 
            value={goal} 
            onChange={e => setGoal(e.target.value)} 
            onBlur={handleSaveProfile}
            className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus"
            style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div className="glass-panel p-6 flex flex-col gap-6">
        <h3 className="font-catalogue text-display-md border-b pb-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-glass)' }}>Appearance</h3>
        
        <div className="flex flex-col gap-2">
          <label className="text-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>Theme</label>
          <select 
            value={theme}
            onChange={e => setTheme(e.target.value)}
            className="w-full border rounded-[10px] p-3 text-body-md cosmic-focus appearance-none"
            style={{ background: 'var(--surface-card)', borderColor: 'var(--border-glass)', color: 'var(--text-primary)' }}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>

      <div className="glass-panel p-6 flex flex-col gap-6">
        <h3 className="font-catalogue text-display-md border-b pb-2 text-pain-high" style={{ borderColor: 'var(--border-glass)' }}>Data Management</h3>
        
        <div className="flex flex-col gap-4">
          <p className="text-body-sm text-muted">Your data lives entirely in your browser. Export it regularly to keep it safe.</p>
          
          <button 
            onClick={exportData}
            className="w-full btn-secondary flex justify-center py-3"
          >
            Export All Data (JSON)
          </button>

          <div>
            <label className="w-full btn-secondary flex justify-center py-3 cursor-pointer">
              Import Data (JSON)
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            {importStatus && <p className="text-caption mt-2 text-center" style={{ color: 'var(--accent-primary)' }}>{importStatus}</p>}
          </div>

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-glass)' }}>
            <button 
              onClick={handleReset}
              className="w-full bg-pain-high/10 border border-pain-high/20 text-pain-high px-4 py-3 rounded-[10px] font-medium hover:bg-pain-high/20"
            >
              Reset All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
