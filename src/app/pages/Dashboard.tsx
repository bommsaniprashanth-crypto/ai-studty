import { motion } from 'motion/react';
import { BookOpen, Code, Video, Flame, Target, Trophy, Calendar, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import LevelProgress, { getLevelInfo } from '../components/LevelProgress';

export default function Dashboard() {
  const { xp, streak, goals, currentReading, currentWatching, currentCoding } = useApp();
  const levelInfo = getLevelInfo(xp);

  const stats = [
    { label: 'Current Streak', value: `${streak}d`, icon: Flame, color: '#f59e0b', gradient: 'from-orange-500 to-red-500' },
    { label: 'Active Goals', value: goals.filter(g => !g.completed).length, icon: Target, color: '#6366f1', gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Completed', value: goals.filter(g => g.completed).length, icon: Trophy, color: '#10b981', gradient: 'from-green-500 to-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-400 text-lg">Track your progress and achievements</p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Level Progress Card - Spans 8 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8"
          >
            <LevelProgress
              level={levelInfo.level}
              xp={xp}
              xpToNextLevel={levelInfo.xpToNextLevel}
            />
          </motion.div>

          {/* Streak Card - Spans 4 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-4 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 shadow-xl relative overflow-hidden border border-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Flame className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-orange-100">Current Streak</p>
                  <h3 className="text-3xl font-bold text-white">{streak} Days</h3>
                </div>
              </div>
              <p className="text-sm text-orange-100/80">Keep going! Consistency is key to mastery.</p>
            </div>
          </motion.div>

          {/* Stats Grid - 3 cards, each spans 4 columns */}
          {[
            { label: 'Books', value: currentReading ? '1 Active' : 'None', icon: BookOpen, color: '#8b5cf6', gradient: 'from-purple-600 to-purple-700' },
            { label: 'Videos', value: currentWatching ? '1 Active' : 'None', icon: Video, color: '#06b6d4', gradient: 'from-cyan-600 to-cyan-700' },
            { label: 'Coding', value: currentCoding ? '1 Active' : 'None', icon: Code, color: '#10b981', gradient: 'from-green-600 to-green-700' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="lg:col-span-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity blur-2xl"
                style={{ background: `radial-gradient(circle at 50% 50%, ${stat.color}, transparent)` }}
              />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                </div>
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                >
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </motion.div>
          ))}

          {/* Active Goals Card - Spans 6 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:col-span-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Active Goals</h3>
                  <p className="text-sm text-gray-400">Your current focus</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{goals.filter(g => !g.completed).length}</p>
                <p className="text-xs text-gray-400">In Progress</p>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {goals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No goals yet. Start by adding your first goal!</p>
                </div>
              ) : (
                goals.slice(0, 5).map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className={`p-3 rounded-xl border transition-all ${
                      goal.completed
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-white/5 border-white/10 hover:border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          goal.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-600'
                        }`}
                      >
                        {goal.completed && <span className="text-white text-xs">✓</span>}
                      </div>
                      <p className={`text-sm flex-1 ${goal.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                        {goal.title}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        goal.type === 'daily' ? 'bg-blue-500/20 text-blue-400' :
                        goal.type === 'weekly' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {goal.type}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Achievements Preview - Spans 6 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-6 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-2xl p-6 shadow-xl border border-yellow-500/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Achievements</h3>
                  <p className="text-sm text-gray-400">Unlock badges and milestones</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'First Steps', icon: Sparkles, locked: xp < 10 },
                  { name: 'Dedicated', icon: Flame, locked: streak < 7 },
                  { name: 'Rising Star', icon: Trophy, locked: levelInfo.level < 3 },
                ].map((achievement, index) => (
                  <motion.div
                    key={achievement.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.45 + index * 0.05 }}
                    className={`p-4 rounded-xl border text-center ${
                      achievement.locked
                        ? 'bg-gray-800/50 border-gray-700/50'
                        : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center ${
                        achievement.locked
                          ? 'bg-gray-700 opacity-30'
                          : 'bg-gradient-to-br from-yellow-500 to-orange-500'
                      }`}
                    >
                      <achievement.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className={`text-xs font-medium ${achievement.locked ? 'text-gray-600' : 'text-white'}`}>
                      {achievement.name}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Motivational Card - Spans full width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-12 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-2xl p-8 shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="relative text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block mb-4"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-3xl font-bold text-white mb-2">
                Your next achievement starts here.
              </h3>
              <p className="text-blue-100 text-lg">
                Every small step forward is progress. Keep learning, keep growing, and watch yourself level up! 🚀
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
