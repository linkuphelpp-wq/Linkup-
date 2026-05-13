import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Send, MessageCircleQuestion } from 'lucide-react';

/* ================================================================
   DESIGN TOKENS (مطابق للإعدادات)
   ================================================================ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 26 } }
};

// بيانات وهمية للمشاكل الشائعة (يمكن استبدالها بـ Firestore لاحقاً)
const COMMON_PROBLEMS = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  question: `المشكلة الشائعة رقم ${i + 1} - هذا مثال لسؤال متكرر من المستخدمين`,
}));

export default function FAQScreen({ onBack, onNavigate }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => alert('تعذر النسخ'));
  };

  const handleSendToSupport = (text) => {
    // العودة إلى شاشة الدعم مع إرسال النص تلقائياً (سيتم تطبيقها في SupportScreen لاحقاً)
    onNavigate('support');
    // يمكنك تمرير النص عبر معلمة أو حدث
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
        className="px-4 pt-28 pb-6 space-y-2 max-w-2xl mx-auto"
      >
        <p className="text-[13px] text-stone-500 px-2 mb-4">
          اضغط على أي مشكلة لنسخها، أو اضغط زر الإرسال للذهاب مباشرة للدعم.
        </p>
        {COMMON_PROBLEMS.map((problem) => (
          <motion.div
            key={problem.id}
            variants={itemVariants}
            className="flex items-center gap-3 bg-white border border-stone-200 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all group"
          >
            <span className="text-[11px] font-bold text-stone-400 w-6 text-center">{problem.id}</span>
            <p className="flex-1 text-[14px] font-medium text-stone-700 text-right leading-relaxed">{problem.question}</p>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleCopy(problem.question)}
                className={`p-2 rounded-xl transition-all ${copiedId === problem.question ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                title="نسخ"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSendToSupport(problem.question)}
                className="p-2 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 transition-all"
                title="إرسال للدعم"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.main>
    </div>
  );
}