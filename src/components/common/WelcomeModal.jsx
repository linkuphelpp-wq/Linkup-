import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { EyeOff, Shield, Zap } from 'lucide-react';

const features = [
  { icon: EyeOff, text: 'بدون إعلانات ولا تعقيدات' },
  { icon: Shield, text: 'خصوصيتك أولاً، بياناتك محمية وآمنة' },
  { icon: Zap, text: 'سريع وبسيط، تواصل في لحظات' },
];

const AppIcon = () => (
  <div className="relative w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/30">
    <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
      <path d="M22 24C23.5 22.5 24 20 24 16C24 12 23.5 9.5 22 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 24C8.5 22.5 8 20 8 16C8 12 8.5 9.5 10 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 24H18C19.1046 24 20 23.1046 20 22V10C20 8.89543 19.1046 8 18 8H14C12.8954 8 12 8.89543 12 10V22C12 23.1046 12.8954 24 14 24Z" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  </div>
);

export default function WelcomeModal({ open, onClose, onLearnMore }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsExiting(false);
    }
  }, [open]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={isExiting ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 30 }}
        animate={isExiting ? { opacity: 0, scale: 0.8, y: 30 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
      >
        {/* زخارف الخلفية */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-100/60 rounded-full blur-2xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-100/60 rounded-full blur-2xl" />

        <div className="relative z-10">
          {/* الشعار والعنوان */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="mb-4">
              <AppIcon />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Link<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Up</span>
            </h1>
          </motion.div>

          {/* عنوان الترحيب */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">مرحباً بك في LinkUp!</h2>
            <p className="text-gray-600 text-sm">تواصل مع من حولك بسهولة، بدون إعلانات ولا تعقيدات.</p>
          </motion.div>

          {/* قائمة الميزات */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 mb-8"
          >
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-sm">
                  <feat.icon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-gray-700 font-medium text-sm">{feat.text}</p>
              </div>
            ))}
          </motion.div>

          {/* الأزرار */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col gap-3"
          >
            <Button
              onClick={handleClose}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all active:scale-95"
            >
              متابعة
            </Button>
            <button
              onClick={onLearnMore}
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium py-2"
            >
              تعرف المزيد عن أثير
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}