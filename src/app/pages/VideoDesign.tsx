import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Film, Wand2, Play } from 'lucide-react';
import StatCard from '../components/StatCard';
import StickyReminder from '../components/StickyReminder';
import WatchLaterHub from '../components/WatchLaterHub';
import EditableSkill from '../components/EditableSkill';
import { useSkills } from '../hooks/useSkills';
import { useApp } from '../context/AppContext';

export default function VideoDesign() {
  const { skills, updateSkill, getSkillsStats } = useSkills();
  const { resources, saveMonthlyProgress, currentMonth } = useApp();

  // Calculate stats
  const { totalHours: skillHours, totalProjects, skillsCompleted: skillsMastered } = getSkillsStats();

  // Calculate total video time
  const videoResources = resources.filter(r => r.type === 'youtube');
  const completedVideos = videoResources.filter(v => v.status === 'completed');
  const totalVideoMinutes = completedVideos.reduce((sum, v) => sum + (v.duration || 0), 0);
  const totalVideoHours = Math.floor(totalVideoMinutes / 60);
  const remainingMinutes = totalVideoMinutes % 60;
  const totalHours = skillHours + totalVideoHours;

  // Auto-save monthly progress whenever stats change
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
      skillsCompleted: skillsMastered,
      videoDuration: totalVideoMinutes,
      booksRead: 0,
    });
  }, [skillHours, totalVideoHours, completedVideos.length, totalProjects, skillsMastered, totalVideoMinutes]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Video Editing & Design
            </h1>
            <p className="text-gray-400">
              Track your creative journey and design skills
            </p>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Projects"
              value={totalProjects.toString()}
              icon={<Film className="w-7 h-7" />}
              color="#9333ea"
              delay={0.1}
            />
            <StatCard
              title="Practice Hours"
              value={totalHours > 0
                ? `${totalHours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`
                : '0h'}
              icon={<Play className="w-7 h-7" />}
              color="#c026d3"
              delay={0.2}
            />
            <StatCard
              title="Skills Mastered"
              value={`${skillsMastered}/${skills.length}`}
              icon={<Wand2 className="w-7 h-7" />}
              color="#e879f9"
              delay={0.3}
            />
          </div>

          {/* Skills Progress */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Skills Progress
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skills.map((skill, index) => (
                <EditableSkill
                  key={skill.id}
                  skill={skill}
                  delay={index * 0.1}
                  onUpdate={updateSkill}
                />
              ))}
            </div>
          </div>

          {/* Watch Later Hub */}
          <div className="mb-8">
            <WatchLaterHub />
          </div>

          {/* Recent Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Recent Projects
            </h3>
            <div className="text-center py-12 text-gray-400">
              <Film className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No projects yet. Start creating!</p>
            </div>
          </motion.div>
        </div>

        {/* Sidebar with Sticky Reminder */}
        <div className="lg:col-span-1">
          <StickyReminder
            message="Consistency improves creativity. Practice 30 minutes daily to build muscle memory and develop your unique style."
            color="#9333ea"
          />

          {/* Tips Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl border border-white/10"
          >
            <h3 className="text-lg font-bold text-white mb-4">
              Quick Tips
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                <span>Watch tutorials daily for 20 minutes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                <span>Recreate designs you admire</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                <span>Build a portfolio of your work</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">•</span>
                <span>Learn keyboard shortcuts</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
