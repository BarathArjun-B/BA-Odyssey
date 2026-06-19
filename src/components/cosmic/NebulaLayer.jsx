export default function NebulaLayer() {
  return (
    <div className="absolute inset-0">
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 animate-[nebula-drift-1_80s_ease-in-out_infinite]"
        style={{ 
          background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)',
          filter: 'blur(100px)',
          willChange: 'transform'
        }}
      />
      <div 
        className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 animate-[nebula-drift-2_100s_ease-in-out_infinite]"
        style={{ 
          background: 'radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%)',
          filter: 'blur(120px)',
          willChange: 'transform'
        }}
      />
      <div 
        className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] rounded-full opacity-30 animate-[nebula-drift-3_120s_ease-in-out_infinite]"
        style={{ 
          background: 'radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%)',
          filter: 'blur(100px)',
          willChange: 'transform'
        }}
      />
    </div>
  );
}
