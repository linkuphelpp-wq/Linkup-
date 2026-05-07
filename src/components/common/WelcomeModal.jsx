import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

// ✅ أيقونتك الحقيقية من مجلد public
const AppIcon = () => (
  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/20 overflow-hidden">
    <img
      src="./icon-512.png"
      alt="LinkUp"
      className="w-full h-full object-cover"
    />
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

  const handleLearnMore = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      onLearnMore?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={isExiting ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 40 }}
        animate={isExiting ? { opacity: 0, scale: 0.8, y: 40 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-100/60 rounded-full blur-2xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-100/60 rounded-full blur-2xl" />

        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="flex flex-col items-center mb-6"
          >
            <AppIcon />
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mt-3">
              Link<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Up</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">مرحباً بك في LinkUp!</h2>
            <p className="text-gray-600 text-sm">تواصل مع من حولك بسهولة.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 mb-8"
          >
            {[
              'بدون إعلانات ولا تعقيدات',
              'خصوصيتك أولاً، بياناتك محمية وآمنة',
              'سريع وبسيط، تواصل في لحظات',
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-3 text-right">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span className="text-gray-700 font-medium text-sm">{text}</span>
              </div>
            ))}
          </motion.div>

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
              onClick={handleLearnMore}
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