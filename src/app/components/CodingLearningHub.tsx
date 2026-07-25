import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Code, Github, FileText, ExternalLink, BookOpen, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';

const resourceTypes = [
  { value: 'article', label: 'Tutorial/Article', icon: FileText },
  { value: 'github', label: 'GitHub Repo', icon: Github },
  { value: 'website', label: 'Documentation', icon: BookOpen },
  { value: 'youtube', label: 'Video Course', icon: Code },
];

export default function CodingLearningHub() {
  const { resources, addResource, updateResource } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({
    type: 'article',
    title: '',
    url: '',
    category: 'Programming',
    notes: '',
  });

  const codingResources = resources.filter(r =>
    ['article', 'github', 'website'].includes(r.type) || (r.type === 'youtube' && r.category === 'Programming')
  );

  const handleAdd = () => {
    if (newResource.title && newResource.url) {
      addResource({
        ...newResource,
        type: newResource.type as any,
        status: 'not-started',
      });
      setNewResource({ type: 'article', title: '', url: '', category: 'Programming', notes: '' });
      setShowAddForm(false);
    }
  };

  const byStatus = {
    'not-started': codingResources.filter(r => r.status === 'not-started'),
    'in-progress': codingResources.filter(r => r.status === 'in-progress'),
    'completed': codingResources.filter(r => r.status === 'completed'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Learning Resources</h2>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all border border-white/10"
        >
          <Plus className="w-5 h-5" />
          Add Resource
        </motion.button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl border border-white/10"
        >
          <div className="space-y-4">
            <select
              value={newResource.type}
              onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
            >
              {resourceTypes.map((type) => (
                <option key={type.value} value={type.value} className="bg-gray-900">{type.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Resource Title"
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500"
            />
            <input
              type="url"
              placeholder="URL"
              value={newResource.url}
              onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500"
            />
            <textarea
              placeholder="Notes - Key concepts, important points..."
              value={newResource.notes}
              onChange={(e) => setNewResource({ ...newResource, notes: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500"
            />
            <button
              onClick={handleAdd}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all"
            >
              Save Resource
            </button>
          </div>
        </motion.div>
      )}

      {/* Learning Status Sections */}
      {['in-progress', 'not-started', 'completed'].map((status) => {
        const items = byStatus[status as keyof typeof byStatus];
        if (items.length === 0) return null;

        const statusConfig = {
          'not-started': { label: 'To Learn', color: 'text-gray-400', icon: BookOpen, gradient: 'from-gray-600 to-gray-700' },
          'in-progress': { label: 'Currently Learning', color: 'text-blue-400', icon: Code, gradient: 'from-blue-600 to-blue-700' },
          'completed': { label: 'Mastered', color: 'text-green-400', icon: Trophy, gradient: 'from-green-600 to-emerald-600' },
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        const Icon = config.icon;

        return (
          <div key={status}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${config.color}`}>
              <Icon className="w-5 h-5" />
              {config.label} ({items.length})
            </h3>
            <div className="space-y-3">
              {items.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} onUpdate={updateResource} gradient={config.gradient} />
              ))}
            </div>
          </div>
        );
      })}

      {codingResources.length === 0 && !showAddForm && (
        <div className="text-center py-16 text-gray-500 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10">
          <Code className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-gray-400">No resources saved yet. Click "Add Resource" to start your learning journey!</p>
        </div>
      )}
    </div>
  );
}

function ResourceCard({ resource, onUpdate, gradient }: any) {
  const [showNotes, setShowNotes] = useState(false);

  const typeIcons = {
    article: FileText,
    github: Github,
    website: BookOpen,
    youtube: Code,
  };

  const Icon = typeIcons[resource.type as keyof typeof typeIcons] || FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 shadow-xl hover:shadow-2xl transition-all border border-white/10 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white mb-2">{resource.title}</h4>
            <div className="flex items-center gap-4 mb-3">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Resource
              </a>
              {resource.notes && (
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="text-sm text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  {showNotes ? 'Hide Notes' : 'Show Notes'}
                </button>
              )}
            </div>
            <select
              value={resource.status}
              onChange={(e) => onUpdate(resource.id, { status: e.target.value })}
              className="text-sm px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <option value="not-started" className="bg-gray-900">To Learn</option>
              <option value="in-progress" className="bg-gray-900">Learning</option>
              <option value="completed" className="bg-gray-900">Mastered</option>
            </select>
          </div>
        </div>
      </div>

      {showNotes && resource.notes && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="relative mt-4 pt-4 border-t border-white/10"
        >
          <h5 className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">Key Concepts:</h5>
          <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
            {resource.notes}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
