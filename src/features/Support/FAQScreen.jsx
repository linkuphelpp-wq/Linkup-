import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Send, MessageCircleQuestion, Search, X, ChevronDown, ChevronUp, Copy, BookOpen
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 380, damping: 24 } }
};
const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 28 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } }
};

// تدرجات لونية للبطاقات
const gradients = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
];

export default function FAQScreen({ onBack, onNavigate }) {
  const [problems, setProblems] = useState([]);
  const [detailedId, setDetailedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'commonProblems'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setProblems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`✅ ${label} تم نسخه`, { duration: 2000 });
    }).catch(() => toast.error('تعذر النسخ'));
  };

  const filtered = problems.filter(p => {
    const q = searchQuery.toLowerCase();
    return (p.question?.toLowerCase()||'').includes(q) || (p.answer?.toLowerCase()||'').includes(q);
  });

  return (
    <div className="min-h-screen bg-stone-50 text-right" dir="rtl">
      {/* Header محسّن */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-b border-stone-200/60"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="max-w-2xl mx-auto px-5 pt-4 pb-3 flex items-center justify-between">
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={onBack} className="w-10 h-10 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-600">
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-200">
              <MessageCircleQuestion className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black text-stone-900">المشاكل الشائعة</h1>
          </div>
          <div className="w-10" />
        </div>
      </motion.header>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 pt-28 pb-8 space-y-4 max-w-2xl mx-auto"
      >
        {/* شريط البحث */}
        <motion.div variants={itemVariants} className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-stone-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مشكلة..."
            className="w-full bg-white border border-stone-200 rounded-2xl py-3 pr-10 pl-10 text-sm outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <X className="w-4 h-4 text-stone-400 hover:text-stone-600" />
            </button>
          )}
        </motion.div>

        {searchQuery && (
          <motion.p variants={itemVariants} className="text-[12px] text-stone-500 px-1">
            {filtered.length} من {problems.length} نتيجة
          </motion.p>
        )}

        {problems.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-stone-100 flex items-center justify-center">
              <MessageCircleQuestion className="w-10 h-10 text-stone-300" />
            </div>
            <p className="text-stone-400 font-medium">لا توجد مشاكل شائعة حالياً</p>
          </motion.div>
        )}

        <AnimatePresence>
          {filtered.map((problem, idx) => {
            const isExpanded = detailedId === problem.id;
            return (
              <motion.div
                key={problem.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10 }}
                className="overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-stone-200/80"
              >
                {/* بطاقة السؤال بتدرج لوني */}
                <div className={`bg-gradient-to-r ${gradients[idx % gradients.length]} p-4 text-white`}>
                  <div className="flex items-start justify-between">
                    <h3 className="text-[15px] font-bold leading-snug flex-1 ml-3">{problem.question}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleCopy(problem.question, 'السؤال')} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors" title="نسخ السؤال">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleSendToSupport(problem.question)} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors" title="إرسال للدعم">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* الجواب المختصر */}
                <div className="bg-white p-4">
                  <p className="text-[14px] text-stone-700 leading-relaxed">{problem.answer}</p>

                  {/* صورة توضيحية */}
                  {problem.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={problem.imageUrl}
                        alt="توضيح"
                        className="rounded-xl w-full h-40 object-cover border border-stone-200 cursor-pointer hover:scale-[1.02] transition-transform"
                        onClick={() => setPreviewImage(problem.imageUrl)}
                      />
                    </div>
                  )}

                  {/* زر تفاصيل أكثر */}
                  {problem.fullAnswer && (
                    <div className="mt-3 pt-3 border-t border-stone-100">
                      <button
                        onClick={() => setDetailedId(isExpanded ? null : problem.id)}
                        className="flex items-center gap-2 text-[13px] font-bold text-violet-600 hover:text-violet-800 transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                        {isExpanded ? 'إخفاء التفاصيل' : 'تفاصيل أكثر'}
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mt-3 bg-violet-50 p-4 rounded-xl border border-violet-100"
                        >
                          <p className="text-[13px] text-violet-800 leading-relaxed whitespace-pre-line">{problem.fullAnswer}</p>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.main>

      {/* معاينة الصورة */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <button onClick={() => setPreviewImage(null)} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
                <X className="w-5 h-5" />
              </button>
              <img src={previewImage} alt="معاينة" className="w-full h-auto object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}