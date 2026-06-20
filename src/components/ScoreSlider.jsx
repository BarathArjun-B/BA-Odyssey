import { cn } from '../lib/utils';

export default function ScoreSlider({ 
  label, 
  value, 
  onChange, 
  min = 1, 
  max = 10, 
  leftLabel, 
  rightLabel,
  description
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-baseline">
        <label className="text-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</label>
        <span className={cn("text-mono-id font-bold")} style={{ color: 'var(--accent-primary)' }}>{value}/{max}</span>
      </div>
      {description && <p className="text-caption text-muted -mt-1">{description}</p>}
      
      <div className="relative pt-4 pb-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer cosmic-focus"
          style={{
            background: `linear-gradient(90deg, var(--accent-primary) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.08) ${((value - min) / (max - min)) * 100}%)`,
            accentColor: 'var(--accent-primary)',
          }}
        />
        <div className="flex justify-between mt-2 text-caption font-label uppercase tracking-widest text-[10px] text-muted">
          <span>{leftLabel || min}</span>
          <span>{rightLabel || max}</span>
        </div>
      </div>
    </div>
  );
}
