import { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Target, FileText, Flame, CheckCircle, Clock, Plus } from 'lucide-react';
import StatCard from '../components/StatCard';
import StickyReminder from '../components/StickyReminder';
import ReadingNow from '../components/ReadingNow';
import EditableBook from '../components/EditableBook';
import { useBooks } from '../hooks/useBooks';

export default function Books() {
  const { books, addBook, updateBook } = useBooks();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    pages: 0,
    status: 'Planned',
    progress: 0,
  });

  const completedBooks = books.filter(book => book.status === 'Completed').length;
  const totalPages = books.reduce((sum, book) => sum + (book.pages || 0), 0);

  const handleAddBook = () => {
    if (newBook.title && newBook.author) {
      addBook(newBook);
      setNewBook({
        title: '',
        author: '',
        pages: 0,
        status: 'Planned',
        progress: 0,
      });
      setShowAddForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Reading Now Section */}
            <div className="mb-8">
              <ReadingNow />
            </div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                Books Tracker
              </h1>
              <p className="text-gray-400 text-lg">
                Build knowledge and expand your mind through reading
              </p>
            </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Books Planned"
              value={books.length}
              icon={<Target className="w-7 h-7" />}
              color="#3b82f6"
              delay={0.1}
            />
            <StatCard
              title="Completed"
              value={completedBooks}
              icon={<CheckCircle className="w-7 h-7" />}
              color="#10b981"
              delay={0.2}
            />
            <StatCard
              title="Pages Read"
              value={totalPages}
              icon={<FileText className="w-7 h-7" />}
              color="#8b5cf6"
              delay={0.3}
            />
            <StatCard
              title="Reading Streak"
              value="12d"
              icon={<Flame className="w-7 h-7" />}
              color="#f59e0b"
              delay={0.4}
            />
          </div>

          {/* Book Cards */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold dark:text-gray-200 text-[#bfcbdb]">
                My Reading List
              </h2>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all border border-white/10"
              >
                <Plus className="w-5 h-5" />
                Add Book
              </motion.button>
            </div>

            {/* Add Book Form */}
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl border border-white/10 mb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Book Title"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition-all hover:bg-white/10"
                  />
                  <input
                    type="text"
                    placeholder="Author Name"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition-all hover:bg-white/10"
                  />
                  <input
                    type="number"
                    placeholder="Total Pages"
                    value={newBook.pages || ''}
                    onChange={(e) => setNewBook({ ...newBook, pages: parseInt(e.target.value) || 0 })}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition-all hover:bg-white/10"
                  />
                  <select
                    value={newBook.status}
                    onChange={(e) => setNewBook({ ...newBook, status: e.target.value })}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <option value="Planned" className="bg-gray-900">Planned</option>
                    <option value="Reading" className="bg-gray-900">Reading</option>
                    <option value="Completed" className="bg-gray-900">Completed</option>
                  </select>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleAddBook}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                  >
                    Add to Library
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
            {books.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl shadow-lg bg-[#121212] bg-[#101010]">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No books in your list yet. Add your first book to start tracking!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {books.map((book, index) => (
                  <EditableBook
                    key={book.id}
                    book={book}
                    index={index}
                    onUpdate={updateBook}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Reading Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl"
          >
            <h3 className="text-2xl font-bold mb-4">Monthly Reading Goal</h3>
            <p className="text-blue-100 mb-6">
              Complete 5 books this month to expand your knowledge and improve focus.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-sm text-blue-100 mb-1">Target</p>
                <p className="text-2xl font-bold">5 Books</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-sm text-blue-100 mb-1">Completed</p>
                <p className="text-2xl font-bold">0 Books</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-sm text-blue-100 mb-1">Remaining</p>
                <p className="text-2xl font-bold">5 Books</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <StickyReminder
            message="Reading daily improves focus, vocabulary, and critical thinking. Even 20 minutes makes a difference!"
            color="#3b82f6"
          />

          {/* Reading Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
              Reading Tips
            </h3>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Read at the same time daily</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Take notes of key insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Discuss books with others</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Mix fiction and non-fiction</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
    </div>
  );
}
