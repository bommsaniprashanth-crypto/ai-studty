import { useState } from 'react';
import { motion } from 'motion/react';
import { Edit2, Check, X, Plus, Minus } from 'lucide-react';

interface EditableSkillProps {
  skill: {
    id: string;
    name: string;
    hours?: number;
    projects?: number;
    total: number;
    icon: any;
    color: string;
  };
  delay: number;
  onUpdate: (id: string, updates: any) => void;
}

export default function EditableSkill({ skill, delay, onUpdate }: EditableSkillProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(skill.name);
  const [editedTotal, setEditedTotal] = useState(skill.total);

  const value = skill.hours || skill.projects || 0;
  const percentage = Math.round((value / skill.total) * 100);

  const handleSave = () => {
    onUpdate(skill.id, {
      name: editedName,
      total: editedTotal,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(skill.name);
    setEditedTotal(skill.total);
    setIsEditing(false);
  };

  const handleUpdateProgress = (increment: number) => {
    const currentValue = value;
    const newValue = Math.max(0, Math.min(currentValue + increment, skill.total));

    if ('hours' in skill) {
      onUpdate(skill.id, { hours: newValue });
    } else if ('projects' in skill) {
      onUpdate(skill.id, { projects: newValue });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: isEditing ? 1 : 1.02, y: isEditing ? 0 : -4 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border border-white/10 group relative overflow-hidden"
    >
      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity blur-2xl"
        style={{ background: `radial-gradient(circle at 50% 50%, ${skill.color}, transparent)` }}
      />

      <div className="relative flex items-center justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
          style={{ backgroundColor: `${skill.color}30`, border: `1px solid ${skill.color}40` }}
        >
          <div style={{ color: skill.color }}>{skill.icon}</div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSave}
                className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors border border-green-500/30"
              >
                <Check className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCancel}
                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors border border-red-500/30"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </>
          ) : (
            <>
              <span className="text-2xl font-bold text-white">
                {percentage}%
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-lg bg-white/5 text-blue-400 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Edit2 className="w-4 h-4" />
              </motion.button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="relative space-y-3">
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold text-white placeholder-gray-500"
            placeholder="Skill name"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Goal:</span>
            <input
              type="number"
              value={editedTotal}
              onChange={(e) => setEditedTotal(parseInt(e.target.value) || 0)}
              className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-white"
            />
            <span className="text-xs text-gray-400">
              {skill.hours !== undefined ? 'hours' : 'projects'}
            </span>
          </div>
        </div>
      ) : (
        <div className="relative">
          <h3 className="text-lg font-semibold text-white mb-2">
            {skill.name}
          </h3>
          <p className="text-sm text-gray-400 mb-3">
            {value} / {skill.total}
          </p>

          {/* Progress bar */}
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ delay: delay + 0.3, duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full relative"
              style={{ backgroundColor: skill.color }}
            >
              <motion.div
                animate={{ x: [0, 100, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>

          {/* Progress Controls */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleUpdateProgress(-1)}
              disabled={value <= 0}
              className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30 flex items-center justify-center gap-1 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="w-3 h-3" />
              Remove
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleUpdateProgress(1)}
              disabled={value >= skill.total}
              className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/30 flex items-center justify-center gap-1 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-3 h-3" />
              Add
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
