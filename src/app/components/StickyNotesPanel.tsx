import { motion } from 'motion/react';
import { Pin, Tag, Calendar, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';

export default function StickyNotesPanel() {
  const { stickyNotes, updateStickyNote, deleteStickyNote } = useApp();

  const pinnedNotes = stickyNotes.filter(note => note.isPinned);
  const unpinnedNotes = stickyNotes.filter(note => !note.isPinned);

  return (
    <div className="space-y-6">
      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <Pin className="w-5 h-5 text-purple-500" />
            Pinned Notes
          </h3>
          <div className="space-y-3">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onTogglePin={() => updateStickyNote(note.id, { isPinned: !note.isPinned })}
                onDelete={() => deleteStickyNote(note.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Notes */}
      {unpinnedNotes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            All Notes
          </h3>
          <div className="space-y-3">
            {unpinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onTogglePin={() => updateStickyNote(note.id, { isPinned: !note.isPinned })}
                onDelete={() => deleteStickyNote(note.id)}
              />
            ))}
          </div>
        </div>
      )}

      {stickyNotes.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No notes yet. Click the + button to create one!</p>
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, onTogglePin, onDelete }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-4 shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <p className="flex-1 text-gray-800 dark:text-gray-200 leading-relaxed">
          {note.content}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePin}
            className={`p-1.5 rounded-lg transition-colors ${
              note.isPinned
                ? 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Pin className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {note.tags.map((tag: string) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-yellow-200 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400 rounded-full text-xs font-medium flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Deadline */}
      {note.deadline && (
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>Due: {format(new Date(note.deadline), 'PPp')}</span>
        </div>
      )}
    </motion.div>
  );
}
