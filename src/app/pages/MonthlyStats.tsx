import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, TrendingUp, Video, Code, Trophy, Award, Star, Zap, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSkills } from '../hooks/useSkills';

export default function MonthlyStats() {
  const { resources, saveMonthlyProgress, getMonthlyProgressHistory, currentMonth } = useApp();
  const { getSkillsStats } = useSkills();

  const history = getMonthlyProgressHistory();

  // Calculate current stats
  const { totalHours: skillHours, totalProjects, skillsCompleted } = getSkillsStats();
  const videoResources = resources.filter(r => r.type === 'youtube');
  const completedVideos = videoResources.filter(v => v.status === 'completed');
  const totalVideoMinutes = completedVideos.reduce((sum, v) => sum + (v.duration || 0), 0);
  const totalVideoHours = Math.floor(totalVideoMinutes / 60);

  // Auto-save current month progress
  useEffect(() => {
    const now = new Date();
    const monthName = now.toLocaleDateString('en-US', { month: 'long' });
    const year = now.getFullYear();

    saveMonthlyProgress({
      month: currentMonth,
      year,
      monthName,
      totalHours: skillHours + totalVideoHours,
      totalVideosWatched: completedVideos.length,
      totalProjects,
      totalProblems: 0,
      skillsCompleted,
      videoDuration: totalVideoMinutes,
      booksRead: 0,
    });
  }, [skillHours, totalVideoHours, completedVideos.length, totalProjects, skillsCompleted, totalVideoMinutes]);

  // Find best performing month
  const bestMonth = history.length > 0 ? history.reduce((best, current) => {
    const bestScore = best.totalHours + best.totalProjects + best.totalVideosWatched + best.skillsCompleted;
    const currentScore = current.totalHours + current.totalProjects + current.totalVideosWatched + current.skillsCompleted;
    return currentScore > bestScore ? current : best;
  }) : null;

  // Calculate total stats
  const totalStats = history.reduce((acc, month) => ({
    totalHours: acc.totalHours + month.totalHours,
    totalVideos: acc.totalVideos + month.totalVideosWatched,
    totalProjects: acc.totalProjects + month.totalProjects,
    totalSkills: acc.totalSkills + month.skillsCompleted,
  }), { totalHours: 0, totalVideos: 0, totalProjects: 0, totalSkills: 0 });

  const avgStats = {
    hours: history.length > 0 ? Math.round(totalStats.totalHours / history.length) : 0,
    videos: history.length > 0 ? Math.round(totalStats.totalVideos / history.length) : 0,
    projects: history.length > 0 ? Math.round(totalStats.totalProjects / history.length) : 0,
    skills: history.length > 0 ? Math.round(totalStats.totalSkills / history.length) : 0,
  };

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0F19] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">
              Monthly Statistics
            </h1>
            <p className="text-gray-400 text-lg">
              Track your progress across months
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 shadow-xl border border-white/10 text-center"
          >
            <Calendar className="w-20 h-20 mx-auto mb-6 text-purple-400 opacity-50" />
            <h3 className="text-2xl font-bold text-white mb-3">Start Your Journey</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Begin tracking your skills and projects to see your monthly progress and statistics appear here automatically.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            Monthly Statistics
          </h1>
          <p className="text-gray-400 text-lg">
            Your progress journey across {history.length} {history.length === 1 ? 'month' : 'months'}
          </p>
        </motion.div>

        {/* All Time Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 shadow-2xl border border-blue-400/30 text-white mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">All Time Progress</h2>
              <p className="text-blue-100">Your complete journey</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-5 border border-white/20 backdrop-blur-sm">
              <Code className="w-6 h-6 mb-2" />
              <p className="text-4xl font-bold mb-1">{totalStats.totalHours}</p>
              <p className="text-sm text-blue-100">Total Hours</p>
              <p className="text-xs text-blue-200 mt-1">~{avgStats.hours}h/month</p>
            </div>
            <div className="bg-white/10 rounded-xl p-5 border border-white/20 backdrop-blur-sm">
              <Video className="w-6 h-6 mb-2" />
              <p className="text-4xl font-bold mb-1">{totalStats.totalVideos}</p>
              <p className="text-sm text-blue-100">Videos Watched</p>
              <p className="text-xs text-blue-200 mt-1">~{avgStats.videos}/month</p>
            </div>
            <div className="bg-white/10 rounded-xl p-5 border border-white/20 backdrop-blur-sm">
              <Trophy className="w-6 h-6 mb-2" />
              <p className="text-4xl font-bold mb-1">{totalStats.totalProjects}</p>
              <p className="text-sm text-blue-100">Projects Done</p>
              <p className="text-xs text-blue-200 mt-1">~{avgStats.projects}/month</p>
            </div>
            <div className="bg-white/10 rounded-xl p-5 border border-white/20 backdrop-blur-sm">
              <Award className="w-6 h-6 mb-2" />
              <p className="text-4xl font-bold mb-1">{totalStats.totalSkills}</p>
              <p className="text-sm text-blue-100">Skills Mastered</p>
              <p className="text-xs text-blue-200 mt-1">~{avgStats.skills}/month</p>
            </div>
          </div>
        </motion.div>

        {/* Best Month Highlight */}
        {bestMonth && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-8 shadow-2xl border border-amber-400/30 text-white mb-8 relative overflow-hidden"
          >
            {/* Sparkle effects */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <Sparkles className="absolute top-4 right-4 w-8 h-8 text-yellow-200 opacity-50" />
            <Sparkles className="absolute bottom-6 left-6 w-6 h-6 text-yellow-200 opacity-30" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-xl border border-white/30">
                  <Star className="w-8 h-8 text-yellow-200" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{bestMonth.monthName} {bestMonth.year}</h2>
                  <p className="text-amber-100 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Your Most Productive Month!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/15 rounded-xl p-4 border border-white/25 backdrop-blur-sm">
                  <Code className="w-5 h-5 mb-2" />
                  <p className="text-3xl font-bold">{bestMonth.totalHours}</p>
                  <p className="text-sm text-amber-100">Hours</p>
                </div>
                <div className="bg-white/15 rounded-xl p-4 border border-white/25 backdrop-blur-sm">
                  <Video className="w-5 h-5 mb-2" />
                  <p className="text-3xl font-bold">{bestMonth.totalVideosWatched}</p>
                  <p className="text-sm text-amber-100">Videos</p>
                </div>
                <div className="bg-white/15 rounded-xl p-4 border border-white/25 backdrop-blur-sm">
                  <Trophy className="w-5 h-5 mb-2" />
                  <p className="text-3xl font-bold">{bestMonth.totalProjects}</p>
                  <p className="text-sm text-amber-100">Projects</p>
                </div>
                <div className="bg-white/15 rounded-xl p-4 border border-white/25 backdrop-blur-sm">
                  <Award className="w-5 h-5 mb-2" />
                  <p className="text-3xl font-bold">{bestMonth.skillsCompleted}</p>
                  <p className="text-sm text-amber-100">Skills</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Scrollable Monthly Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Monthly Timeline</h2>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>Scroll to explore</span>
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {history.map((month, index) => {
              const isBestMonth = bestMonth && month.id === bestMonth.id;
              const isCurrentMonth = month.month === currentMonth;
              const totalScore = month.totalHours + month.totalProjects + month.totalVideosWatched + month.skillsCompleted;
              const avgScore = history.reduce((sum, m) => sum + m.totalHours + m.totalProjects + m.totalVideosWatched + m.skillsCompleted, 0) / history.length;
              const isAboveAverage = totalScore > avgScore;

              return (
                <motion.div
                  key={month.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-xl p-6 border transition-all ${
                    isBestMonth
                      ? 'bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-amber-500/50 shadow-lg shadow-amber-500/20'
                      : isCurrentMonth
                      ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                      : 'bg-gray-800/50 border-white/10 hover:border-purple-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                        isBestMonth
                          ? 'bg-amber-600/30 border-amber-500/50'
                          : isCurrentMonth
                          ? 'bg-purple-600/30 border-purple-500/50'
                          : 'bg-blue-600/20 border-blue-500/30'
                      }`}>
                        {isBestMonth ? (
                          <Star className="w-6 h-6 text-amber-400" />
                        ) : isCurrentMonth ? (
                          <Sparkles className="w-6 h-6 text-purple-400" />
                        ) : (
                          <Calendar className="w-6 h-6 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-white">{month.monthName} {month.year}</h3>
                          {isBestMonth && (
                            <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full border border-amber-500/30 flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              Best Month
                            </span>
                          )}
                          {isCurrentMonth && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                          {isAboveAverage && !isBestMonth && (
                            <span className="text-green-400 flex items-center gap-1">
                              <ArrowUp className="w-3 h-3" />
                              Above Average
                            </span>
                          )}
                          {!isAboveAverage && !isBestMonth && (
                            <span className="text-gray-500">Average Performance</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MonthStat icon={<Code className="w-5 h-5" />} label="Hours" value={month.totalHours} />
                    <MonthStat icon={<Video className="w-5 h-5" />} label="Videos" value={month.totalVideosWatched} />
                    <MonthStat icon={<Trophy className="w-5 h-5" />} label="Projects" value={month.totalProjects} />
                    <MonthStat icon={<Award className="w-5 h-5" />} label="Skills" value={month.skillsCompleted} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
}

function MonthStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
      <div className="flex items-center gap-2 mb-1 text-purple-400">
        {icon}
        <span className="text-xs font-medium text-gray-300">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
