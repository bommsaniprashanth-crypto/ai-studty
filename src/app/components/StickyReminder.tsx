import { motion } from 'motion/react';
import { Lightbulb } from 'lucide-react';

interface StickyReminderProps {
  message: string;
  color?: string;
}

export default function StickyReminder({ message, color = '#f59e0b' }: StickyReminderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="sticky top-20 bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-2xl p-6 shadow-lg border-l-4"
      style={{ borderColor: color }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}30` }}
        >
          <Lightbulb className="w-6 h-6" style={{ color }} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Daily Reminder</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{message}</p>
        </div>
      </div>
    </motion.div>
  );
}
