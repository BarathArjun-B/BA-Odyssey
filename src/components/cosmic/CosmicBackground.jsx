import StarFieldLayer from './StarFieldLayer';
import TwinkleStarLayer from './TwinkleStarLayer';
import DriftingStarLayer from './DriftingStarLayer';
import NebulaLayer from './NebulaLayer';
import CosmicDustLayer from './CosmicDustLayer';
import ShootingStarTrigger from './ShootingStarTrigger';
import AsteroidLayer from './AsteroidLayer';

export default function CosmicBackground() {
  return (
    <div 
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Layer 1: Static base gradient */}
      <div className="absolute inset-0 bg-cosmic-gradient" />
      
      {/* Layer 2: Deep space static stars */}
      <StarFieldLayer />
      
      {/* Layer 3: Nebula clouds */}
      <NebulaLayer />
      
      {/* Layer 4: Distant drifting stars */}
      <DriftingStarLayer />
      
      {/* Layer 5: Interactive/twinkling stars */}
      <TwinkleStarLayer />
      
      {/* Layer 6: Tsparticles cosmic dust */}
      <CosmicDustLayer />
      
      {/* Layer 7: Occasional phenomena */}
      <ShootingStarTrigger />
      <AsteroidLayer />
    </div>
  );
}
