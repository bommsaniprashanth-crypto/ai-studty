import { motion } from 'motion/react';
import { FileText, Sparkles } from 'lucide-react';

interface CustomPageProps {
  title: string;
}

export default function CustomPage({ title }: CustomPageProps) {
  return (
    <div className="min-h-screen bg-[#0B0F19] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            {title}
          </h1>
          <p className="text-gray-400 text-lg">
            Your custom page for organizing and tracking
          </p>
        </motion.div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-16 shadow-xl border border-white/10 text-center"
        >
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-full blur-2xl opacity-30" />
            <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-3">
            Your custom page is ready!
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Start building your personalized tracker. Add content, track your progress, and organize your resources here.
          </p>

          <div className="flex items-center justify-center gap-2 text-purple-400">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">Customize this page to fit your needs</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
