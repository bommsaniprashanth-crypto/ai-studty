import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { Plus, Minus } from 'lucide-react';

interface ProgressCardProps {
  title: string;
  value: number;
  total: number;
  icon: ReactNode;
  color: string;
  delay?: number;
  onUpdate?: (increment: number) => void;
}

export default function ProgressCard({ title, value, total, icon, color, delay = 0, onUpdate }: ProgressCardProps) {
  const percentage = Math.round((value / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border border-white/10 group relative overflow-hidden"
    >
      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity blur-2xl"
        style={{ background: `radial-gradient(circle at 50% 50%, ${color}, transparent)` }}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: `${color}30`, border: `1px solid ${color}40` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
          <span className="text-2xl font-bold text-white">
            {percentage}%
          </span>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-3">
          {value} / {total}
        </p>

        {/* Progress bar */}
        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ delay: delay + 0.3, duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full relative"
            style={{ backgroundColor: color }}
          >
            <motion.div
              animate={{ x: [0, 100, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>

        {/* Progress Controls */}
        {onUpdate && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdate(-1)}
              disabled={value <= 0}
              className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30 flex items-center justify-center gap-1 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="w-3 h-3" />
              Remove
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdate(1)}
              disabled={value >= total}
              className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/30 flex items-center justify-center gap-1 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-3 h-3" />
              Add
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
