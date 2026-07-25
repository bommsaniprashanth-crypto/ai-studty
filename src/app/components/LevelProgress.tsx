import { motion } from 'motion/react';
import { Star, Sparkles } from 'lucide-react';

interface LevelProgressProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  compact?: boolean;
}

const levels = [
  { name: 'Beginner', minXP: 0, color: '#9ca3af' },
  { name: 'Explorer', minXP: 100, color: '#3b82f6' },
  { name: 'Learner', minXP: 300, color: '#6366f1' },
  { name: 'Creator', minXP: 600, color: '#8b5cf6' },
  { name: 'Builder', minXP: 1000, color: '#06b6d4' },
  { name: 'Expert', minXP: 1500, color: '#10b981' },
  { name: 'Master', minXP: 2500, color: '#f59e0b' },
];

export function getLevelInfo(xp: number) {
  let currentLevel = levels[0];
  let nextLevel = levels[1];

  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i].minXP) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] || levels[i];
    } else {
      break;
    }
  }

  const levelIndex = levels.indexOf(currentLevel);
  const xpInCurrentLevel = xp - currentLevel.minXP;
  const xpForNextLevel = nextLevel.minXP - currentLevel.minXP;

  return {
    level: levelIndex + 1,
    levelName: currentLevel.name,
    color: currentLevel.color,
    nextLevelName: nextLevel.name,
    xpToNextLevel: xpForNextLevel - xpInCurrentLevel,
    progress: xpForNextLevel > 0 ? (xpInCurrentLevel / xpForNextLevel) * 100 : 100,
  };
}

export default function LevelProgress({ level, xp, xpToNextLevel, compact = false }: LevelProgressProps) {
  const levelInfo = getLevelInfo(xp);
  const progress = levelInfo.progress;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center border-2"
          style={{
            borderColor: levelInfo.color,
            background: `${levelInfo.color}20`,
          }}
        >
          <Star className="w-5 h-5" style={{ color: levelInfo.color }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-white">
              Level {level} - {levelInfo.levelName}
            </span>
            <span className="text-xs text-gray-400">{xp} XP</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.color}dd)`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/10 shadow-xl relative overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-10 blur-3xl"
        style={{ background: `radial-gradient(circle at 50% 50%, ${levelInfo.color}, transparent)` }}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 relative"
              style={{
                borderColor: levelInfo.color,
                background: `${levelInfo.color}20`,
              }}
            >
              <Star className="w-7 h-7" style={{ color: levelInfo.color }} />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </motion.div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Level {level}</h3>
              <p className="text-sm" style={{ color: levelInfo.color }}>
                {levelInfo.levelName}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{xp}</p>
            <p className="text-xs text-gray-400">Total XP</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Progress to {levelInfo.nextLevelName}</span>
            <span className="text-gray-400">{xpToNextLevel} XP to go</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full relative"
              style={{
                background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.color}dd)`,
              }}
            >
              <motion.div
                animate={{ x: [0, 100, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
          <p className="text-xs text-gray-500 text-center">{Math.round(progress)}% Complete</p>
        </div>
      </div>
    </motion.div>
  );
}
