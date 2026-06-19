import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';

export default function StatusStamp({ status, className }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Slight delay to trigger animation after render
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (!status) return null;

  let colorStyle = { color: 'var(--text-primary)', borderColor: 'var(--text-primary)' };
  if (status === "HIGH POTENTIAL") colorStyle = { color: 'var(--status-achievement-gold)', borderColor: 'var(--status-achievement-gold)' };
  if (status === "VALIDATED") colorStyle = { color: 'var(--status-success-emerald)', borderColor: 'var(--status-success-emerald)' };
  if (status === "NEEDS DATA") colorStyle = { color: 'var(--color-warning)', borderColor: 'var(--color-warning)' };
  if (status === "ARCHIVED") colorStyle = { color: 'var(--text-muted)', borderColor: 'var(--text-muted)' };

  return (
    <div className={cn(
      "absolute -top-1 -right-1 overflow-hidden w-20 h-20 pointer-events-none z-10",
      className
    )}>
      <div className={cn(
        "absolute top-6 -right-6 w-32 text-center transform origin-center transition-transform duration-180 ease-out py-0.5 border-y-2 border-double backdrop-blur-sm shadow-sm",
        mounted ? "rotate-[35deg] scale-100" : "rotate-[0deg] scale-150 opacity-0"
      )} style={{ ...colorStyle, background: 'rgba(14, 19, 48, 0.8)' }}>
        <span className="font-label text-[10px] tracking-widest font-bold uppercase leading-none">{status}</span>
      </div>
    </div>
  );
}
