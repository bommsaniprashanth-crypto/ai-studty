import { motion } from 'motion/react';
import { BookOpen, Video, Code, Target, FileText, Play, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function HeroSection() {
  const { currentReading, currentWatching, currentCoding, goals } = useApp();

  const todaysGoals = goals.filter(g => g.type === 'daily');
  const completedToday = todaysGoals.filter(g => g.completed).length;

  return (
    <div className="mb-12">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Welcome Back, Prashanth! 👋
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Let's continue your learning journey
        </p>
      </motion.div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Continue Reading */}
        {currentReading && (
          <ContinueCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Continue Reading"
            subtitle={currentReading.title}
            progress={currentReading.progress}
            color="from-blue-500 to-purple-600"
            delay={0.1}
          />
        )}

        {/* Continue Watching */}
        {currentWatching && (
          <ContinueCard
            icon={<Video className="w-6 h-6" />}
            title="Continue Watching"
            subtitle={currentWatching.title}
            progress={currentWatching.progress}
            color="from-purple-500 to-pink-500"
            delay={0.2}
          />
        )}

        {/* Continue Coding */}
        {currentCoding && (
          <ContinueCard
            icon={<Code className="w-6 h-6" />}
            title="Continue Coding"
            subtitle={currentCoding.title}
            progress={currentCoding.progress}
            color="from-green-500 to-blue-500"
            delay={0.3}
          />
        )}

        {/* Today's Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {completedToday}/{todaysGoals.length}
            </span>
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
            Today's Goals
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {completedToday === todaysGoals.length ? 'All done! 🎉' : `${todaysGoals.length - completedToday} remaining`}
          </p>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedToday / todaysGoals.length) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            />
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Continue Where You Left Off
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentReading && (
            <ActivityCard
              icon={<BookOpen className="w-5 h-5" />}
              type="Book"
              title={currentReading.title}
              subtitle={`${currentReading.progress}% complete`}
              color="text-blue-600 dark:text-blue-400"
            />
          )}
          {currentWatching && (
            <ActivityCard
              icon={<Play className="w-5 h-5" />}
              type="Video"
              title={currentWatching.title}
              subtitle={`${currentWatching.progress}% watched`}
              color="text-purple-600 dark:text-purple-400"
            />
          )}
          {currentCoding && (
            <ActivityCard
              icon={<Code className="w-5 h-5" />}
              type="Course"
              title={currentCoding.title}
              subtitle={`${currentCoding.progress}% complete`}
              color="text-green-600 dark:text-green-400"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ContinueCard({ icon, title, subtitle, progress, color, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 truncate">{subtitle}</p>
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-3">
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: delay + 0.3 }}
              className={`h-full bg-gradient-to-r ${color} rounded-full`}
            />
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
      </div>
    </motion.div>
  );
}

function ActivityCard({ icon, type, title, subtitle, color }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={`${color} mt-1`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium mb-1 ${color}`}>{type}</p>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate mb-1">
            {title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}
