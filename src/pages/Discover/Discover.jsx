import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROMPT_CATEGORIES, getRandomPrompt } from '../../lib/prompts';
import { RefreshCcw, ArrowRight } from 'lucide-react';

export default function Discover() {
  const [currentPrompt, setCurrentPrompt] = useState(getRandomPrompt());
  const navigate = useNavigate();

  const handleShuffle = () => {
    setCurrentPrompt(getRandomPrompt());
  };

  const handleLogThis = () => {
    navigate('/journal', { state: { autoOpen: true, prompt: currentPrompt } });
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-12">
      <div>
        <h1 className="text-display-lg mb-2" style={{ color: 'var(--text-primary)' }}>Discovery Assistant</h1>
        <p className="text-body-lg text-muted">When you know you should log something, but don't know what.</p>
      </div>

      {/* Featured Prompt Card */}
      <div className="discovery-card p-8 md:p-12 items-center text-center">
        <div className="absolute top-4 right-4 text-[120px] font-catalogue leading-none pointer-events-none rotate-12" style={{ color: 'var(--accent-primary)', opacity: 0.08 }}>?</div>
        
        <span className="text-caption font-label uppercase tracking-widest text-muted mb-6">Today's Focus</span>
        <h2 className="text-display-md md:text-display-lg mb-12 max-w-2xl relative z-10" style={{ color: 'var(--text-primary)' }}>
          "{currentPrompt}"
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full sm:w-auto">
          <button 
            onClick={handleShuffle}
            className="btn-secondary flex-1 sm:flex-none flex justify-center items-center gap-2 px-6"
          >
            <RefreshCcw className="w-4 h-4" /> Shuffle
          </button>
          <button 
            onClick={handleLogThis}
            className="btn-primary flex-1 sm:flex-none flex justify-center items-center gap-2 px-8"
          >
            Log this <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Prompt Library List */}
      <div>
        <h3 className="font-catalogue text-display-md mb-6 border-b pb-2" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-glass)' }}>Prompt Library</h3>
        <div className="flex flex-col gap-8">
          {PROMPT_CATEGORIES.map(category => (
            <div key={category.category}>
              <h4 className="text-body-md font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{category.category}</h4>
              <ul className="flex flex-col gap-2 pl-4 border-l-2" style={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}>
                {category.prompts.map(p => (
                  <li 
                    key={p} 
                    className="text-body-sm text-muted hover:text-ink cursor-pointer transition-colors"
                    onClick={() => {
                      setCurrentPrompt(p);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
