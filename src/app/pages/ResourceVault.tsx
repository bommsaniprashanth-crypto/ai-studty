import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Youtube, FileText, Github, Globe, Image as ImageIcon, ExternalLink, Trash2, Plus, Share2, Copy, Check, BookOpen, Edit2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const typeIcons = {
  youtube: Youtube,
  article: FileText,
  github: Github,
  website: Globe,
  pdf: FileText,
  design: ImageIcon,
};

const typeColors = {
  youtube: 'text-red-600 dark:text-red-400',
  article: 'text-blue-600 dark:text-blue-400',
  github: 'text-gray-800 dark:text-gray-200',
  website: 'text-green-600 dark:text-green-400',
  pdf: 'text-purple-600 dark:text-purple-400',
  design: 'text-pink-600 dark:text-pink-400',
};

export default function ResourceVault() {
  const { resources, deleteResource, addResource, updateResource } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({
    type: 'youtube' as any,
    title: '',
    url: '',
    category: '',
    notes: '',
  });

  const categories = Array.from(new Set(resources.map(r => r.category)));

  const handleAddResource = () => {
    if (newResource.title && newResource.url && newResource.category) {
      addResource({
        ...newResource,
        status: 'not-started',
      });
      setNewResource({
        type: 'youtube',
        title: '',
        url: '',
        category: '',
        notes: '',
      });
      setShowAddForm(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || resource.type === selectedType;
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const groupedByType = filteredResources.reduce((acc, resource) => {
    if (!acc[resource.type]) acc[resource.type] = [];
    acc[resource.type].push(resource);
    return acc;
  }, {} as Record<string, typeof resources>);

  return (
    <div className="min-h-screen bg-[#0B0F19] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">
              Resource Vault
            </h1>
            <p className="text-gray-400 text-lg">
              Your centralized hub for all learning resources
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all border border-white/10"
          >
            <Plus className="w-5 h-5" />
            Add Resource
          </motion.button>
        </motion.div>

        {/* Add Resource Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl border border-white/10 mb-8"
          >
            <h3 className="text-xl font-bold text-white mb-4">Add New Resource</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Resource Type</label>
                <select
                  value={newResource.type}
                  onChange={(e) => setNewResource({ ...newResource, type: e.target.value as any })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                >
                  <option value="youtube" className="bg-gray-900">YouTube Video</option>
                  <option value="article" className="bg-gray-900">Article/Blog</option>
                  <option value="github" className="bg-gray-900">GitHub Repo</option>
                  <option value="website" className="bg-gray-900">Website</option>
                  <option value="pdf" className="bg-gray-900">PDF Document</option>
                  <option value="design" className="bg-gray-900">Design Resource</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <input
                  type="text"
                  placeholder="e.g., Programming, Design, Books"
                  value={newResource.category}
                  onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Resource title"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes (Optional)</label>
                <textarea
                  placeholder="Add notes about this resource..."
                  value={newResource.notes}
                  onChange={(e) => setNewResource({ ...newResource, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 resize-none h-24"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddResource}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                Save Resource
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 bg-white/5 text-gray-300 rounded-xl hover:bg-white/10 transition-all border border-white/10"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl border border-white/10 mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all hover:bg-white/10"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType || ''}
            onChange={(e) => setSelectedType(e.target.value || null)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <option value="" className="bg-gray-900">All Types</option>
            <option value="youtube" className="bg-gray-900">YouTube Videos</option>
            <option value="article" className="bg-gray-900">Articles</option>
            <option value="github" className="bg-gray-900">GitHub Repos</option>
            <option value="website" className="bg-gray-900">Websites</option>
            <option value="pdf" className="bg-gray-900">PDFs</option>
            <option value="design" className="bg-gray-900">Design</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <option value="" className="bg-gray-900">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
            ))}
          </select>
        </div>
      </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatBox label="Total Resources" value={resources.length} color="from-purple-600 to-pink-600" />
          <StatBox label="Completed" value={resources.filter(r => r.status === 'completed').length} color="from-green-600 to-emerald-600" />
          <StatBox label="In Progress" value={resources.filter(r => r.status === 'in-progress').length} color="from-blue-600 to-cyan-600" />
          <StatBox label="To Learn" value={resources.filter(r => r.status === 'not-started').length} color="from-amber-600 to-orange-600" />
        </div>

        {/* Resources Grid */}
        {Object.entries(groupedByType).map(([type, typeResources]) => {
          const Icon = typeIcons[type as keyof typeof typeIcons];

          return (
            <div key={type} className="mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {type.charAt(0).toUpperCase() + type.slice(1)} ({typeResources.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {typeResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} onDelete={deleteResource} onUpdate={updateResource} />
                ))}
              </div>
            </div>
          );
        })}

        {filteredResources.length === 0 && (
          <div className="text-center py-20 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10">
            <Filter className="w-16 h-16 mx-auto mb-4 opacity-30 text-gray-500" />
            <p className="text-gray-400">No resources found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all border border-white/10`}
    >
      <p className="text-sm opacity-90 mb-2">{label}</p>
      <p className="text-4xl font-bold">{value}</p>
    </motion.div>
  );
}

function ResourceCard({ resource, onDelete, onUpdate }: any) {
  const Icon = typeIcons[resource.type as keyof typeof typeIcons];
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(resource.title);
  const [editedCategory, setEditedCategory] = useState(resource.category);
  const [editedUrl, setEditedUrl] = useState(resource.url);

  const handleShare = async () => {
    const shareText = `Check out this resource: ${resource.title}\n${resource.url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.title,
          text: shareText,
          url: resource.url,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = () => {
    onUpdate(resource.id, {
      title: editedTitle,
      category: editedCategory,
      url: editedUrl,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(resource.title);
    setEditedCategory(resource.category);
    setEditedUrl(resource.url);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: isEditing ? 1 : 1.02, y: isEditing ? 0 : -4 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border border-white/10 group relative overflow-hidden"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSave}
                  className="p-2 hover:bg-green-500/10 rounded-lg transition-all text-green-400 hover:text-green-300"
                  title="Save changes"
                >
                  <Check className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCancel}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-all text-red-400 hover:text-red-300"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all text-blue-400 hover:text-blue-300"
                  title="Edit resource"
                >
                  <Edit2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShare}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all text-purple-400 hover:text-purple-300"
                  title="Share resource"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDelete(resource.id)}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-all text-red-400 hover:text-red-300"
                  title="Delete resource"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm"
              placeholder="Resource title"
            />
            <input
              type="text"
              value={editedCategory}
              onChange={(e) => setEditedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm"
              placeholder="Category"
            />
            <input
              type="url"
              value={editedUrl}
              onChange={(e) => setEditedUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm"
              placeholder="URL"
            />
          </div>
        ) : (
          <>
            <h3 className="font-bold text-white mb-3 line-clamp-2 text-lg">
              {resource.title}
            </h3>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="px-3 py-1 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-cyan-300 rounded-full text-xs font-medium border border-cyan-500/30 flex items-center gap-1.5">
                <Icon className="w-3 h-3" />
                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
              </span>
              <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs font-medium border border-purple-500/30">
                {resource.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                resource.status === 'completed'
                  ? 'bg-green-600/20 text-green-300 border-green-500/30'
                  : resource.status === 'in-progress'
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                  : 'bg-gray-600/20 text-gray-300 border-gray-500/30'
              }`}>
                {resource.status === 'not-started' ? 'To Learn' : resource.status.replace('-', ' ')}
              </span>
            </div>

            {resource.notes && (
              <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                {resource.notes}
              </p>
            )}

            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open Resource
            </a>
          </>
        )}
      </div>
    </motion.div>
  );
}
