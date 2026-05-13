import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Send, MessageCircleQuestion, ChevronDown, ChevronUp } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

/* ================================================================
   DESIGN TOKENS
   ================================================================ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 26 } }
};

export default function FAQScreen({ onBack, onNavigate }) {
  const [problems, setProblems] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  // جلب المشاكل الشائعة من Firestore
  useEffect(() => {
    const q = query(collection(db, 'commonProblems'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));
      setProblems(list);
    });
    return () => unsub();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const handleSendToSupport = (text) => {
    onNavigate('support');
    // يمكن تحسينها لاحقاً لتمرير النص تلقائياً
  };

  return (
    <div className="min-h-screen bg-stone-50 text-right" dir="rtl">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-30 bg-white/85 backdrop-blur-xl border-b border-stone-200/60"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="max-w-2xl mx-auto px-5 pt-4 pb-3 flex items-center justify-between">
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={onBack} className="w-10 h-10 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-600">
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <MessageCircleQuestion className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black text-stone-900">المشاكل الشائعة</h1>
          </div>
          <div className="w-10" />
        </div>
      </motion.header>

      {/* Content */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 pt-28 pb-8 space-y-3 max-w-2xl mx-auto"
      >
        {problems.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-stone-100 flex items-center justify-center">
              <MessageCircleQuestion className="w-8 h-8 text-stone-400" />
            </div>
            <p className="text-stone-500 font-medium">لا توجد مشاكل شائعة حالياً</p>
          </motion.div>
        )}

        {problems.map((problem) => (
          <motion.div
            key={problem.id}
            variants={itemVariants}
            className="bg-white border border-stone-200 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4">
              <div className="flex-1 text-right">
                <h3 className="text-[14px] font-bold text-stone-800 mb-1">{problem.question}</h3>
                <p className="text-[12px] text-stone-500">
                  {expandedId === problem.id ? 'اضغط للإخفاء' : 'اضغط لرؤية الجواب'}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleCopy(problem.question)}
                  className="p-2 rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 transition-all"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSendToSupport(problem.question)}
                  className="p-2 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setExpandedId(expandedId === problem.id ? null : problem.id)}
                  className="p-2 rounded-xl bg-stone-50 text-stone-400 hover:bg-stone-100 transition-all"
                >
                  {expandedId === problem.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {expandedId === problem.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="px-4 pb-4"
              >
                <div className="pt-3 border-t border-stone-100">
                  <p className="text-[13px] text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl">
                    {problem.answer || 'لا يوجد جواب مفصل حالياً'}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.main>
    </div>
  );
}