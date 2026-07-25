import { motion } from 'motion/react';
import { BookOpen, Play, FileText, Calendar, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ReadingNow() {
  const { currentReading } = useApp();

  if (!currentReading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No book currently being read</p>
      </div>
    );
  }

  const currentPage = Math.floor(352 * (currentReading.progress / 100));
  const totalPages = 352;
  const pagesPerDay = 25;
  const remainingPages = totalPages - currentPage;
  const daysRemaining = Math.ceil(remainingPages / pagesPerDay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 shadow-xl border border-blue-200 dark:border-blue-800"
    >
      <div className="flex items-start gap-2 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Currently Reading
          </h3>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {currentReading.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{currentReading.subtitle}</p>
        </div>
      </div>

      {/* Cover Placeholder */}
      <div className="mb-6 rounded-xl bg-gradient-to-br from-blue-200 to-purple-300 dark:from-blue-800 dark:to-purple-900 h-48 flex items-center justify-center">
        <BookOpen className="w-24 h-24 text-white/50" />
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-medium">Pages</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {currentPage}/{totalPages}
          </p>
        </div>
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Progress</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {currentReading.progress}%
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Reading Progress</span>
          <span>{currentReading.progress}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${currentReading.progress}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between mb-6 text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Last read: Today</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <TrendingUp className="w-4 h-4" />
          <span>{daysRemaining} days remaining</span>
        </div>
      </div>

      {/* Notes Section */}
      {currentReading.notes && (
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Personal Notes
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {currentReading.notes}
          </p>
        </div>
      )}

      {/* Continue Reading Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5" />
        Continue Reading
      </motion.button>
    </motion.div>
  );
}
