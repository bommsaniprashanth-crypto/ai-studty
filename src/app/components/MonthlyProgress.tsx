import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, TrendingUp, Video, Code, Book, Trophy, ChevronDown, ChevronUp, Award, Star, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MonthlyProgress() {
  const { getMonthlyProgressHistory } = useApp();
  const [showHistory, setShowHistory] = useState(false);

  const history = getMonthlyProgressHistory();
  const currentMonthData = history.length > 0 ? history[0] : null; // Most recent month

  // Find best performing month
  const bestMonth = history.length > 0 ? history.reduce((best, current) => {
    const bestScore = best.totalHours + best.totalProjects + best.totalVideosWatched + best.skillsCompleted;
    const currentScore = current.totalHours + current.totalProjects + current.totalVideosWatched + current.skillsCompleted;
    return currentScore > bestScore ? current : best;
  }) : null;

  // Calculate total stats across all months
  const totalStats = history.reduce((acc, month) => ({
    totalHours: acc.totalHours + month.totalHours,
    totalVideos: acc.totalVideos + month.totalVideosWatched,
    totalProjects: acc.totalProjects + month.totalProjects,
    totalSkills: acc.totalSkills + month.skillsCompleted,
  }), { totalHours: 0, totalVideos: 0, totalProjects: 0, totalSkills: 0 });

  if (!currentMonthData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-xl border border-white/10 text-center"
      >
        <Calendar className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
        <h3 className="text-xl font-bold text-white mb-2">Monthly Progress</h3>
        <p className="text-gray-400">
          Start tracking your progress to see monthly statistics
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Month Overview */}
      {currentMonthData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 shadow-xl border border-white/20 text-white"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{currentMonthData.monthName} {currentMonthData.year}</h3>
                <p className="text-purple-100 text-sm">Current Month Progress</p>
              </div>
            </div>
            <div className="text-right">
              <Trophy className="w-8 h-8 mx-auto mb-1" />
              <p className="text-xs text-purple-100">Active</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBubble
              icon={<Code className="w-5 h-5" />}
              label="Hours"
              value={currentMonthData.totalHours}
              color="bg-blue-500/30"
            />
            <StatBubble
              icon={<Video className="w-5 h-5" />}
              label="Videos"
              value={currentMonthData.totalVideosWatched}
              color="bg-red-500/30"
            />
            <StatBubble
              icon={<Trophy className="w-5 h-5" />}
              label="Projects"
              value={currentMonthData.totalProjects}
              color="bg-green-500/30"
            />
            <StatBubble
              icon={<Award className="w-5 h-5" />}
              label="Skills"
              value={currentMonthData.skillsCompleted}
              color="bg-yellow-500/30"
            />
          </div>
        </motion.div>
      )}

      {/* Best Performing Month */}
      {bestMonth && history.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-6 shadow-xl border border-amber-400/30 text-white relative overflow-hidden"
        >
          {/* Sparkle effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-yellow-200" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{bestMonth.monthName} {bestMonth.year}</h3>
                  <p className="text-amber-100 text-sm flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Your Most Productive Month!
                  </p>
                </div>
              </div>
              <Trophy className="w-10 h-10 text-yellow-200" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Code className="w-4 h-4" />
                  <span className="text-xs font-medium">Hours</span>
                </div>
                <p className="text-2xl font-bold">{bestMonth.totalHours}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Video className="w-4 h-4" />
                  <span className="text-xs font-medium">Videos</span>
                </div>
                <p className="text-2xl font-bold">{bestMonth.totalVideosWatched}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs font-medium">Projects</span>
                </div>
                <p className="text-2xl font-bold">{bestMonth.totalProjects}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-medium">Skills</span>
                </div>
                <p className="text-2xl font-bold">{bestMonth.skillsCompleted}</p>
              </div>
            </div>

            {currentMonthData && currentMonthData.id !== bestMonth.id && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-sm text-amber-100">
                  Keep going! You're currently at <span className="font-bold">{currentMonthData.totalHours}</span> hours this month.
                  {currentMonthData.totalHours > bestMonth.totalHours ? (
                    <span className="ml-1 text-yellow-200 font-bold">🎉 New record!</span>
                  ) : (
                    <span className="ml-1">Need <span className="font-bold">{bestMonth.totalHours - currentMonthData.totalHours}</span> more to beat your record!</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* All Time Stats */}
      {history.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl border border-blue-500/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">All Time Progress</h3>
              <p className="text-sm text-gray-400">Total across {history.length} months</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-600/10 rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">Total Hours</span>
              </div>
              <p className="text-3xl font-bold text-white">{totalStats.totalHours}</p>
              <p className="text-xs text-gray-400 mt-1">Avg: {Math.round(totalStats.totalHours / history.length)}/month</p>
            </div>
            <div className="bg-red-600/10 rounded-xl p-4 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-5 h-5 text-red-400" />
                <span className="text-sm font-medium text-gray-300">Total Videos</span>
              </div>
              <p className="text-3xl font-bold text-white">{totalStats.totalVideos}</p>
              <p className="text-xs text-gray-400 mt-1">Avg: {Math.round(totalStats.totalVideos / history.length)}/month</p>
            </div>
            <div className="bg-green-600/10 rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-gray-300">Total Projects</span>
              </div>
              <p className="text-3xl font-bold text-white">{totalStats.totalProjects}</p>
              <p className="text-xs text-gray-400 mt-1">Avg: {Math.round(totalStats.totalProjects / history.length)}/month</p>
            </div>
            <div className="bg-purple-600/10 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-gray-300">Total Skills</span>
              </div>
              <p className="text-3xl font-bold text-white">{totalStats.totalSkills}</p>
              <p className="text-xs text-gray-400 mt-1">Avg: {Math.round(totalStats.totalSkills / history.length)}/month</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* History Toggle */}
      {history.length > 1 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowHistory(!showHistory)}
          className="w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 shadow-xl border border-white/10 flex items-center justify-between text-white hover:border-purple-500/30 transition-all"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span className="font-medium">View Progress History ({history.length - 1} months)</span>
          </div>
          {showHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </motion.button>
      )}

      {/* History List */}
      {showHistory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {history.slice(1).map((month, index) => {
            const isBestMonth = bestMonth && month.id === bestMonth.id;
            const totalScore = month.totalHours + month.totalProjects + month.totalVideosWatched + month.skillsCompleted;
            const avgScore = history.reduce((sum, m) => sum + m.totalHours + m.totalProjects + m.totalVideosWatched + m.skillsCompleted, 0) / history.length;
            const isAboveAverage = totalScore > avgScore;

            return (
              <motion.div
                key={month.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 shadow-xl border transition-all ${
                  isBestMonth
                    ? 'border-amber-500/50 shadow-amber-500/20'
                    : 'border-white/10 hover:border-purple-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                      isBestMonth
                        ? 'bg-amber-600/20 border-amber-500/30'
                        : 'bg-purple-600/20 border-purple-500/30'
                    }`}>
                      {isBestMonth ? (
                        <Star className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Calendar className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white">{month.monthName} {month.year}</h4>
                        {isBestMonth && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full border border-amber-500/30 flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            Best
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        Completed Month
                        {isAboveAverage && !isBestMonth && (
                          <span className="text-green-400">• Above Average</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MiniStat icon={<Code className="w-4 h-4" />} label="Hours" value={month.totalHours} />
                  <MiniStat icon={<Video className="w-4 h-4" />} label="Videos" value={month.totalVideosWatched} />
                  <MiniStat icon={<Trophy className="w-4 h-4" />} label="Projects" value={month.totalProjects} />
                  <MiniStat icon={<Award className="w-4 h-4" />} label="Skills" value={month.skillsCompleted} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

function StatBubble({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className={`${color} rounded-xl p-4 border border-white/20`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 text-purple-400">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
