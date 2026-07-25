import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  delay?: number;
  trend?: string;
  gradient?: string;
}

export default function StatCard({ title, value, icon, color, delay = 0, trend, gradient }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border border-white/10 relative overflow-hidden group"
    >
      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity blur-2xl"
        style={{ background: `radial-gradient(circle at 50% 50%, ${color}, transparent)` }}
      />

      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-2">{title}</p>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
            className="text-4xl font-bold text-white mb-1"
          >
            {value}
          </motion.h3>
          {trend && (
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          )}
        </div>
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${gradient || ''}`}
          style={!gradient ? { background: `linear-gradient(135deg, ${color}, ${color}dd)` } : undefined}
        >
          <div className="text-white">{icon}</div>
        </div>
      </div>
    </motion.div>
  );
}
