

export default function About() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto pb-24 md:pb-0 items-center text-center mt-12">
      <div className="w-16 h-16 btn-primary rounded-xl flex items-center justify-center font-catalogue font-bold text-3xl leading-none mb-4" style={{ boxShadow: '0 0 24px rgba(139, 92, 246, 0.3)' }}>
        BA
      </div>
      
      <h1 className="text-display-xl mb-4" style={{ color: 'var(--text-primary)' }}>The Founder's Field Journal</h1>
      
      <div className="text-body-lg text-muted flex flex-col gap-6 max-w-xl text-left glass-panel p-8">
        <p>
          Most founder tools help people manage ideas they already have. BA exists earlier in the timeline — it helps people build the <strong style={{ color: 'var(--text-primary)' }}>muscle of noticing</strong>.
        </p>
        <p>
          Great founders are not idea collectors. They are problem collectors. Ideas are cheap and emotionally seductive — people fall in love with them and become defensive. Problems are neutral, falsifiable, and compound.
        </p>
        <p>
          A person who has logged 1,000 specific, well-documented problems has effectively run 1,000 small market-research interviews with themselves and the world around them.
        </p>
        <p>
          The best opportunities will surface by sheer repetition and pattern density.
        </p>
      </div>

      <div className="mt-12 flex flex-col items-center gap-2">
        <span className="font-catalogue text-display-md text-muted">Barath Arjun</span>
        <span className="font-label text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>Version 1.0</span>
      </div>
    </div>
  );
}
