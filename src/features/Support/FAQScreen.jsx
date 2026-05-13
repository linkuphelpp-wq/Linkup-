import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Copy, Send, MessageCircleQuestion, ChevronDown, ChevronUp, BookOpen, ImageIcon
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

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
  const [detailedId, setDetailedId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'commonProblems'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setProblems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleCopy = (text) => navigator.clipboard.writeText(text).catch(() => {});
  const handleSend = (text) => onNavigate('support');

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
            <div className="flex items-start gap-3 p-4">
              <div className="flex-1 text-right min-w-0">
                <h3 className="text-[14px] font-bold text-stone-800 mb-2 leading-snug">{problem.question}</h3>
                {/* الجواب المختصر */}
                <div className="bg-stone-50 rounded-xl p-3">
                  <p className="text-[13px] text-stone-600 leading-relaxed">{problem.answer}</p>
                  {problem.imageUrl && (
                    <div className="mt-2">
                      <img src={problem.imageUrl} alt="توضيح" className="rounded-lg w-full h-auto max-h-48 object-cover border border-stone-200" />
                    </div>
                  )}
                  {problem.fullAnswer && (
                    <div className="mt-2">
                      <button
                        onClick={() => setDetailedId(detailedId === problem.id ? null : problem.id)}
                        className="flex items-center gap-1 text-[11px] font-medium text-violet-600 hover:text-violet-800 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        {detailedId === problem.id ? 'إخفاء التفاصيل' : 'تفاصيل أكثر'}
                        {detailedId === problem.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
                {problem.fullAnswer && detailedId === problem.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-2 bg-violet-50 p-3 rounded-xl border border-violet-100"
                  >
                    <p className="text-[12px] text-violet-800 leading-relaxed whitespace-pre-line">{problem.fullAnswer}</p>
                  </motion.div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 pt-1">
                <button onClick={() => handleCopy(problem.question)} className="p-2 rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 transition-all" title="نسخ السؤال">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => handleSend(problem.question)} className="p-2 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 transition-all" title="إرسال للدعم">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.main>
    </div>
  );
}