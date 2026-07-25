import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Play, CheckCircle, Clock, Bookmark, ExternalLink, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

const categories = ['Video Editing', 'Motion Graphics', 'Figma/UI Design', 'Freelancing', 'Productivity'];

export default function WatchLaterHub() {
  const { resources, addResource, updateResource } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVideo, setNewVideo] = useState({ title: '', url: '', category: categories[0], notes: '', duration: 0 });

  const videoResources = resources.filter(r => r.type === 'youtube');

  const handleAdd = () => {
    if (newVideo.title && newVideo.url) {
      addResource({
        type: 'youtube',
        title: newVideo.title,
        url: newVideo.url,
        category: newVideo.category,
        status: 'not-started',
        notes: newVideo.notes,
        duration: newVideo.duration,
      });
      setNewVideo({ title: '', url: '', category: categories[0], notes: '', duration: 0 });
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Watch Later</h2>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all border border-white/10"
        >
          <motion.div
            animate={{ rotate: showAddForm ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Plus className="w-5 h-5" />
          </motion.div>
          Add Video
        </motion.button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -20 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl border border-white/10"
        >
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Video Title"
              value={newVideo.title}
              onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all hover:bg-white/10"
            />
            <input
              type="url"
              placeholder="YouTube URL"
              value={newVideo.url}
              onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all hover:bg-white/10"
            />
            <select
              value={newVideo.category}
              onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
              ))}
            </select>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
              <input
                type="number"
                placeholder="e.g., 15"
                min="0"
                value={newVideo.duration || ''}
                onChange={(e) => setNewVideo({ ...newVideo, duration: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all hover:bg-white/10"
              />
            </div>
            <textarea
              placeholder="Notes (optional)"
              value={newVideo.notes}
              onChange={(e) => setNewVideo({ ...newVideo, notes: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all hover:bg-white/10"
            />
            <button
              onClick={handleAdd}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              Save Video
            </button>
          </div>
        </motion.div>
      )}

      {/* Categories */}
      {categories.map((category) => {
        const categoryVideos = videoResources.filter(v => v.category === category);
        if (categoryVideos.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="text-lg font-semibold text-white mb-3">
              {category}
            </h3>
            <div className="space-y-3">
              {categoryVideos.map((video) => (
                <VideoCard key={video.id} video={video} onUpdate={updateResource} />
              ))}
            </div>
          </div>
        );
      })}

      {videoResources.length === 0 && !showAddForm && (
        <div className="text-center py-12 text-gray-400 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10 shadow-xl">
          <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No videos saved yet. Click "Add Video" to get started!</p>
        </div>
      )}
    </div>
  );
}

function VideoCard({ video, onUpdate }: any) {
  const [showNotes, setShowNotes] = useState(false);

  const statusIcons = {
    'not-started': <Clock className="w-4 h-4" />,
    'in-progress': <Play className="w-4 h-4" />,
    'completed': <CheckCircle className="w-4 h-4" />,
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all border border-white/10"
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail Placeholder */}
        <div className="w-32 h-20 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden border border-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10" />
          <Play className="w-8 h-8 text-purple-400 relative z-10" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate mb-1">
            {video.title}
          </h4>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 border ${
              video.status === 'completed'
                ? 'bg-green-600/20 text-green-300 border-green-500/30'
                : video.status === 'in-progress'
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                : 'bg-gray-600/20 text-gray-300 border-gray-500/30'
            }`}>
              {statusIcons[video.status]}
              {video.status.replace('-', ' ')}
            </span>
            {video.duration > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 bg-purple-600/20 text-purple-300 border border-purple-500/30">
                <Clock className="w-3 h-3" />
                {formatDuration(video.duration)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Watch
            </a>
            {video.notes && (
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-sm text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                Notes
              </button>
            )}
            <select
              value={video.status}
              onChange={(e) => onUpdate(video.id, { status: e.target.value })}
              className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <option value="not-started" className="bg-gray-900">Not Started</option>
              <option value="in-progress" className="bg-gray-900">Watching</option>
              <option value="completed" className="bg-gray-900">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {showNotes && video.notes && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-white/10 text-sm text-gray-300"
        >
          {video.notes}
        </motion.div>
      )}
    </motion.div>
  );
}
