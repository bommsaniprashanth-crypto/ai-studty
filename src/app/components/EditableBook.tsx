import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Clock, BookOpen, Edit2, Check, X } from 'lucide-react';

interface EditableBookProps {
  book: {
    id: string;
    title: string;
    author: string;
    progress: number;
    status: string;
    pages: number;
  };
  index: number;
  onUpdate: (id: string, updates: any) => void;
}

export default function EditableBook({ book, index, onUpdate }: EditableBookProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(book.title);
  const [editedAuthor, setEditedAuthor] = useState(book.author);
  const [editedPages, setEditedPages] = useState(book.pages);

  const handleSave = () => {
    onUpdate(book.id, {
      title: editedTitle,
      author: editedAuthor,
      pages: editedPages,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(book.title);
    setEditedAuthor(book.author);
    setEditedPages(book.pages);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: isEditing ? 1 : 1.02, x: isEditing ? 0 : 5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-bold"
                placeholder="Book title"
              />
              <input
                type="text"
                value={editedAuthor}
                onChange={(e) => setEditedAuthor(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder="Author name"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={editedPages}
                  onChange={(e) => setEditedPages(parseInt(e.target.value) || 0)}
                  className="w-24 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="Pages"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">pages</span>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                {book.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                by {book.author} • {book.pages} pages
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                  book.status === 'Completed'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : book.status === 'Reading'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                }`}
              >
                {book.status === 'Completed' ? (
                  <CheckCircle className="w-3 h-3" />
                ) : book.status === 'Reading' ? (
                  <BookOpen className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {book.status}
              </span>
            </>
          )}
        </div>
      </div>

      {!isEditing && (
        <>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {book.progress}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${book.progress}%` }}
                transition={{ delay: index * 0.1 + 0.3, duration: 1 }}
                className={`h-full rounded-full ${
                  book.status === 'Completed'
                    ? 'bg-green-500'
                    : book.status === 'Reading'
                    ? 'bg-blue-500'
                    : 'bg-gray-400'
                }`}
              />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
