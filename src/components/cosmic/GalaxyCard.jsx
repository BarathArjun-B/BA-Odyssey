import { motion } from 'framer-motion';
import NeonBorder from './NeonBorder';

export default function GalaxyCard({ children, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
      style={{ filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.2))' }}
    >
      <NeonBorder className="h-full">
        {children}
      </NeonBorder>
    </motion.div>
  );
}
