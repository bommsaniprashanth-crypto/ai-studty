import { useState } from 'react';
import { motion } from 'motion/react';
import { Code, CheckCircle, Flame, FolderGit2, Trophy, Cpu, X } from 'lucide-react';
import StatCard from '../components/StatCard';
import ProgressCard from '../components/ProgressCard';
import StickyReminder from '../components/StickyReminder';
import CircularProgress from '../components/CircularProgress';
import CodingLearningHub from '../components/CodingLearningHub';

export default function Coding() {
  const [languages, setLanguages] = useState([
    { name: 'Python', problems: 0, total: 60, color: '#3776ab' },
    { name: 'Java', problems: 0, total: 50, color: '#f89820' },
    { name: 'HTML/CSS/JS', projects: 0, total: 15, color: '#e34c26' },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLanguage, setNewLanguage] = useState({
    name: '',
    type: 'problems' as 'problems' | 'projects',
    total: 50,
    color: '#6366f1',
  });

  const handleAddLanguage = () => {
    if (newLanguage.name && newLanguage.total > 0) {
      const langToAdd = {
        name: newLanguage.name,
        total: newLanguage.total,
        color: newLanguage.color,
        ...(newLanguage.type === 'problems' ? { problems: 0 } : { projects: 0 }),
      };
      setLanguages([...languages, langToAdd]);
      setNewLanguage({
        name: '',
        type: 'problems',
        total: 50,
        color: '#6366f1',
      });
      setShowAddForm(false);
    }
  };

  const handleUpdateProgress = (langName: string, increment: number) => {
    setLanguages(languages.map(lang => {
      if (lang.name === langName) {
        if ('problems' in lang) {
          return { ...lang, problems: Math.min((lang.problems || 0) + increment, lang.total) };
        } else if ('projects' in lang) {
          return { ...lang, projects: Math.min((lang.projects || 0) + increment, lang.total) };
        }
      }
      return lang;
    }));
  };

  // Calculate stats
  const totalProblems = languages.reduce((sum, lang) => sum + (lang.problems || 0), 0);
  const totalProjects = languages.reduce((sum, lang) => sum + (lang.projects || 0), 0);
  const totalLanguages = languages.length;

  const recentProblems: Array<{
    title: string;
    platform: string;
    difficulty: string;
    solved: boolean;
  }> = [];

  const projects: Array<{
    name: string;
    tech: string;
    status: string;
    progress: number;
  }> = [];

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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Coding Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Master programming through consistent practice
            </p>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Problems Solved"
              value={totalProblems.toString()}
              icon={<CheckCircle className="w-7 h-7" />}
              color="#10b981"
              delay={0.1}
            />
            <StatCard
              title="Languages"
              value={totalLanguages.toString()}
              icon={<Code className="w-7 h-7" />}
              color="#3b82f6"
              delay={0.2}
            />
            <StatCard
              title="Projects"
              value={totalProjects.toString()}
              icon={<FolderGit2 className="w-7 h-7" />}
              color="#8b5cf6"
              delay={0.3}
            />
            <StatCard
              title="Coding Streak"
              value="0d"
              icon={<Flame className="w-7 h-7" />}
              color="#f59e0b"
              delay={0.4}
            />
          </div>

          {/* Language Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Language Progress
              </h2>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:shadow-green-500/30 transition-all flex items-center gap-2 border border-white/10"
              >
                <motion.div
                  animate={{ rotate: showAddForm ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Code className="w-4 h-4" />
                </motion.div>
                Add Language
              </motion.button>
            </div>

            {/* Add Language Form */}
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl border border-white/10 mb-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">Add New Language</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Language Name</label>
                    <input
                      type="text"
                      placeholder="e.g., JavaScript, C++, Go"
                      value={newLanguage.name}
                      onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Track By</label>
                    <select
                      value={newLanguage.type}
                      onChange={(e) => setNewLanguage({ ...newLanguage, type: e.target.value as 'problems' | 'projects' })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                    >
                      <option value="problems" className="bg-gray-900">Problems Solved</option>
                      <option value="projects" className="bg-gray-900">Projects Built</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Goal Target</label>
                    <input
                      type="number"
                      min="1"
                      value={newLanguage.total}
                      onChange={(e) => setNewLanguage({ ...newLanguage, total: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={newLanguage.color}
                        onChange={(e) => setNewLanguage({ ...newLanguage, color: e.target.value })}
                        className="w-16 h-12 rounded-lg border border-white/10 bg-white/5 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={newLanguage.color}
                        onChange={(e) => setNewLanguage({ ...newLanguage, color: e.target.value })}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAddLanguage}
                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all"
                  >
                    Add Language
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 bg-white/5 text-gray-300 rounded-xl hover:bg-white/10 transition-all border border-white/10 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {languages.map((lang, index) => (
                <ProgressCard
                  key={lang.name}
                  title={lang.name}
                  value={lang.problems || lang.projects || 0}
                  total={lang.total}
                  icon={<Code className="w-6 h-6" />}
                  color={lang.color}
                  delay={index * 0.1}
                  onUpdate={(increment) => handleUpdateProgress(lang.name, increment)}
                />
              ))}
            </div>
          </div>

          {/* Learning Hub */}
          <div className="mb-8">
            <CodingLearningHub />
          </div>

          {/* Projects Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Active Projects
            </h2>
            {projects.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10 shadow-xl">
                <FolderGit2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No projects yet. Start building!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project, index) => (
                <motion.div
                  key={project.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border border-white/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-400">{project.tech}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        project.status === 'Completed'
                          ? 'bg-green-600/20 text-green-300 border-green-500/30'
                          : project.status === 'In Progress'
                          ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                          : 'bg-gray-600/20 text-gray-300 border-gray-500/30'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full relative"
                    >
                      <motion.div
                        animate={{ x: [0, 100, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
              </div>
            )}
          </div>

          {/* Recent Problems */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl border border-white/10"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Recent Problems
            </h3>
            {recentProblems.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No problems solved yet. Start coding!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProblems.map((problem, index) => (
                <motion.div
                  key={problem.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-900/20 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    {problem.solved ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Cpu className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{problem.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{problem.platform}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      problem.difficulty === 'Easy'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : problem.difficulty === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                </motion.div>
              ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <StickyReminder
            message="Code daily. Even one problem builds confidence and sharpens your problem-solving skills."
            color="#10b981"
          />

          {/* Weekly Goal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="mt-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all text-white border border-white/20"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Weekly Goal
            </h3>
            <CircularProgress percentage={0} size={120} color="#ffffff" />
            <p className="text-sm text-green-100 mt-4 text-center">
              0/25 problems solved this week
            </p>
          </motion.div>

          {/* Coding Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl border border-white/10"
          >
            <h3 className="text-lg font-bold text-white mb-4">
              Coding Tips
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>Solve 2-3 problems daily</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>Review solutions after solving</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>Build projects to apply concepts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>Learn data structures deeply</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
