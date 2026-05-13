import { motion } from 'framer-motion';
import {
  ArrowLeft, Lightbulb, MessageSquareText, Clock, CheckCircle2, ShieldCheck
} from 'lucide-react';

/* ================================================================
   DESIGN TOKENS
   ================================================================ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 24 } }
};

/* ================================================================
   STEPS DATA
   ================================================================ */
const steps = [
  {
    icon: MessageSquareText,
    title: '1. اشرح مشكلتك',
    description: 'اكتب وصفاً دقيقاً للمشكلة التي تواجهها أو اختر من المشاكل الشائعة.',
  },
  {
    icon: Clock,
    title: '2. انتظر الرد',
    description: 'فريق الدعم سيرد عليك في أقرب وقت ممكن. يُعطى الأولوية حسب الترتيب.',
  },
  {
    icon: Lightbulb,
    title: '3. احصل على الحل',
    description: 'نقدم لك حلولاً مباشرة أو إرشادات لحل المشكلة تماماً.',
  },
  {
    icon: CheckCircle2,
    title: '4. قيّم الخدمة',
    description: 'بعد الحل، أخبرنا إن كانت الإجابة مفيدة لتحسين خدمتنا.',
  },
];

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function HowItWorksScreen({ onBack, onNavigate }) {
  return (
    <div className="min-h-screen bg-stone-50 text-right" dir="rtl">
      {/* ─── Header ─── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-30 bg-white/85 backdrop-blur-xl border-b border-stone-200/60"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="max-w-2xl mx-auto px-5 pt-4 pb-3 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black text-stone-900">كيفية عمل الدعم</h1>
          </div>
          <div className="w-10" />
        </div>
      </motion.header>

      {/* ─── Content ─── */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 pt-28 pb-8 space-y-8 max-w-2xl mx-auto"
      >
        {/* مقدمة */}
        <motion.div variants={itemVariants} className="text-center py-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-emerald-50 flex items-center justify-center"
          >
            <Lightbulb className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h2 className="text-lg font-bold text-stone-800 mb-2">كيف تحصل على المساعدة؟</h2>
          <p className="text-[14px] text-stone-600 leading-relaxed max-w-md mx-auto">
            صممنا نظام الدعم ليكون سريعاً وفعالاً. اتبع الخطوات أدناه لتحصل على أفضل تجربة.
          </p>
        </motion.div>

        {/* خطوات */}
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex items-start gap-4"
            >
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shrink-0">
                <step.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-stone-800 mb-1">{step.title}</h3>
                <p className="text-[13px] text-stone-600 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* رسالة طمأنة */}
        <motion.div variants={itemVariants} className="bg-white/70 border border-stone-200 rounded-2xl p-5 text-center shadow-sm">
          <p className="text-[13px] text-stone-500 leading-relaxed">
            🛡️ خصوصيتك مهمة جداً. لا تتم مشاركة أي معلومات مع أطراف خارجية. فريق الدعم يلتزم بسرية تامة.
          </p>
        </motion.div>
      </motion.main>
    </div>
  );
}