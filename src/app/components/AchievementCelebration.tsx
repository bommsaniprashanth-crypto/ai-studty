import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, Star, Flame, BookOpen, Code, Film, Target } from 'lucide-react';

interface AchievementCelebrationProps {
  show: boolean;
  onClose: () => void;
  achievement: {
    type: 'book' | 'coding' | 'video' | 'streak' | 'level' | 'goal';
    title: string;
    description: string;
    xp?: number;
  };
}

const achievementIcons = {
  book: BookOpen,
  coding: Code,
  video: Film,
  streak: Flame,
  level: Star,
  goal: Target,
};

const achievementMessages = {
  book: '📚 Book Completed!',
  coding: '💻 Coding Goal Reached!',
  video: '🎬 Course Finished!',
  streak: '🔥 Streak Increased!',
  level: '⭐ New Level Unlocked!',
  goal: '🎯 Goal Achieved!',
};

export default function AchievementCelebration({ show, onClose, achievement }: AchievementCelebrationProps) {
  useEffect(() => {
    if (show) {
      // Confetti explosion
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: {
            x: randomInRange(0.1, 0.9),
            y: Math.random() - 0.2,
          },
          colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
        });
      }, 250);

      // Auto close after animation
      const timeout = setTimeout(() => {
        onClose();
      }, 4000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [show, onClose]);

  const Icon = achievementIcons[achievement.type];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl" />

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 shadow-2xl border border-white/10 max-w-md text-center">
              {/* Animated icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', duration: 0.8 }}
                className="mb-6 inline-flex"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full blur-xl opacity-50 animate-pulse" />
                  <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full p-6">
                    <Icon className="w-16 h-16 text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Trophy animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', duration: 0.8 }}
                className="mb-4"
              >
                <Trophy className="w-20 h-20 mx-auto text-yellow-400" />
              </motion.div>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {achievementMessages[achievement.type]}
                </h2>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {achievement.title}
                </h3>
                <p className="text-gray-400 mb-6">
                  {achievement.description}
                </p>

                {achievement.xp && (
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full px-6 py-3 border border-blue-500/30">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-xl font-bold text-white">+{achievement.xp} XP</span>
                  </div>
                )}
              </motion.div>

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [0, -100],
                    x: [0, (i % 2 === 0 ? 1 : -1) * 50],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="absolute"
                  style={{
                    left: `${20 + i * 10}%`,
                    bottom: '20%',
                  }}
                >
                  <Star className="w-4 h-4 text-yellow-400" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
