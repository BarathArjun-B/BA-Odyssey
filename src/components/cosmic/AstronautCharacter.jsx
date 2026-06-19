import { motion, useReducedMotion } from 'framer-motion';

export default function AstronautCharacter({ size = 200, floating = true }) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = floating && !prefersReducedMotion;

  return (
    <div
      className="inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <motion.div
        animate={shouldAnimate ? { y: [-8, 8, -8] } : { y: 0 }}
        transition={{
          duration: 5.5,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="w-full h-full"
      >
        <motion.div
          animate={shouldAnimate ? { rotate: [-2, 2, -2] } : { rotate: 0 }}
          transition={{
            duration: 8,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="w-full h-full"
        >
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
          >
            {/* Helmet */}
            <circle cx="100" cy="72" r="32" fill="#1a1e3a" stroke="#8B5CF6" strokeWidth="2" />
            {/* Visor */}
            <ellipse cx="100" cy="72" rx="22" ry="20" fill="url(#visorGradient)" />
            {/* Visor reflection */}
            <ellipse cx="92" cy="66" rx="8" ry="5" fill="rgba(244,246,255,0.2)" transform="rotate(-15 92 66)" />
            
            {/* Body/suit */}
            <rect x="78" y="100" width="44" height="50" rx="12" fill="#1a1e3a" stroke="#8B5CF6" strokeWidth="1.5" />
            {/* Chest panel */}
            <rect x="88" y="108" width="24" height="16" rx="4" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.4)" strokeWidth="1" />
            {/* Chest lights */}
            <circle cx="95" cy="114" r="2" fill="#22D3EE" opacity="0.8" />
            <circle cx="105" cy="114" r="2" fill="#34D399" opacity="0.8" />
            <circle cx="100" cy="120" r="1.5" fill="#E8B339" opacity="0.8" />

            {/* Backpack */}
            <rect x="122" y="105" width="12" height="35" rx="6" fill="#12162e" stroke="#8B5CF6" strokeWidth="1" />

            {/* Left arm */}
            <path d="M78 110 C60 115, 55 130, 62 145" stroke="#1a1e3a" strokeWidth="10" strokeLinecap="round" fill="none" />
            <path d="M78 110 C60 115, 55 130, 62 145" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Left glove */}
            <circle cx="62" cy="145" r="6" fill="#1a1e3a" stroke="#8B5CF6" strokeWidth="1" />

            {/* Right arm */}
            <path d="M122 110 C140 108, 148 120, 145 138" stroke="#1a1e3a" strokeWidth="10" strokeLinecap="round" fill="none" />
            <path d="M122 110 C140 108, 148 120, 145 138" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Right glove */}
            <circle cx="145" cy="138" r="6" fill="#1a1e3a" stroke="#8B5CF6" strokeWidth="1" />

            {/* Left leg */}
            <path d="M90 148 C85 165, 80 175, 76 185" stroke="#1a1e3a" strokeWidth="10" strokeLinecap="round" fill="none" />
            <path d="M90 148 C85 165, 80 175, 76 185" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Left boot */}
            <ellipse cx="74" cy="188" rx="8" ry="5" fill="#1a1e3a" stroke="#8B5CF6" strokeWidth="1" />

            {/* Right leg */}
            <path d="M110 148 C115 165, 120 175, 124 185" stroke="#1a1e3a" strokeWidth="10" strokeLinecap="round" fill="none" />
            <path d="M110 148 C115 165, 120 175, 124 185" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Right boot */}
            <ellipse cx="126" cy="188" rx="8" ry="5" fill="#1a1e3a" stroke="#8B5CF6" strokeWidth="1" />

            {/* Tether line */}
            <path d="M67 105 C50 90, 35 95, 25 80" stroke="rgba(139,92,246,0.3)" strokeWidth="1" strokeDasharray="4 3" fill="none" />

            <defs>
              <linearGradient id="visorGradient" x1="78" y1="52" x2="122" y2="92" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4F8EF7" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
