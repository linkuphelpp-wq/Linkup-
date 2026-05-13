import { motion } from 'framer-motion';
import {
  ArrowLeft, Lightbulb, MessageSquareText, Clock, CheckCircle2, ShieldCheck, Zap, Star, HeartHandshake
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 26 } }
};

const steps = [
  { icon: MessageSquareText, title: '1. اشرح مشكلتك', description: 'اكتب وصفاً دقيقاً للمشكلة التي تواجهها، أو اختر من المشاكل الشائعة.', color: 'from-violet-500 to-purple-600' },
  { icon: Clock, title: '2. انتظر الرد', description: 'فريق الدعم سيرد عليك في أقرب وقت. الأولوية حسب ترتيب التذاكر.', color: 'from-blue-500 to-indigo-600' },
  { icon: Lightbulb, title: '3. احصل على الحل', description: 'نقدم لك حلولاً دقيقة أو إرشادات مخصصة لمشكلتك.', color: 'from-amber-500 to-orange-600' },
  { icon: CheckCircle2, title: '4. قيّم الخدمة', description: 'أخبرنا إن كانت الإجابة مفيدة لنساعدك مستقبلاً بشكل أفضل.', color: 'from-emerald-500 to-teal-600' },
];

const tips = [
  'كلما كان وصف المشكلة دقيقاً، كان الحل أسرع وأكثر فائدة.',
  'يمكنك إرفاق صورة أو فيديو للمشكلة عند التواصل مع الدعم.',
  'تصفح قسم المشاكل الشائعة، فقد تجد حلاً فورياً لمشكلتك.',
  'لا تشارك بياناتك الحساسة مثل كلمات المرور في رسائل الدعم.',
];

export default function HowItWorksScreen({ onBack, onNavigate }) {
  return (
    <div className="min-h-screen bg-stone-50 text-right" dir="rtl">
      {/* Header */}
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
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black text-stone-900">كيفية عمل الدعم</h1>
          </div>
          <div className="w-10" />
        </div>
      </motion.header>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 pt-28 pb-8 space-y-8 max-w-2xl mx-auto"
      >
        {/* بطاقة ترحيبية */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-200 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-white/20 flex items-center justify-center"
          >
            <HeartHandshake className="w-10 h-10" />
          </motion.div>
          <h2 className="text-xl font-black mb-2">نحن هنا لمساعدتك</h2>
          <p className="text-emerald-50 leading-relaxed">
            صممنا نظام الدعم ليكون سريعاً وفعالاً. اتبع الخطوات أدناه لتحصل على أفضل تجربة.
          </p>
        </motion.div>

        {/* الخطوات */}
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-start gap-4"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${step.color} text-white shadow-md shrink-0`}>
                <step.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[16px] font-black text-stone-800 mb-1">{step.title}</h3>
                <p className="text-[14px] text-stone-600 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* قسم النصائح الذهبية */}
        <motion.div variants={itemVariants} className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-amber-800">نصائح للحصول على دعم أسرع</h3>
          </div>
          <ul className="space-y-3">
            {tips.map((tip, idx) => (
              <motion.li key={idx} variants={itemVariants} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <p className="text-[14px] text-amber-800 leading-relaxed">{tip}</p>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* رسالة الخصوصية */}
        <motion.div variants={itemVariants} className="text-center py-4">
          <div className="inline-flex items-center gap-2 bg-stone-100 rounded-full px-4 py-2">
            <ShieldCheck className="w-4 h-4 text-stone-500" />
            <p className="text-[12px] text-stone-500 font-medium">خصوصيتك مهمة. لا نشارك بياناتك مع أي طرف.</p>
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}