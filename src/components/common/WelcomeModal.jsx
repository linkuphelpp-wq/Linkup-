import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useState } from 'react'; // استيراد useState

const AppIcon = () => (
  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
    <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
      <path d="M22 24C23.5 22.5 24 20 24 16C24 12 23.5 9.5 22 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 24C8.5 22.5 8 20 8 16C8 12 8.5 9.5 10 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 24H18C19.1046 24 20 23.1046 20 22V10C20 8.89543 19.1046 8 18 8H14C12.8954 8 12 8.89543 12 10V22C12 23.1046 12.8954 24 14 24Z" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  </div>
);

export default function WelcomeModal({ open, onClose, onLearnMore }) {
  const [isVisible, setIsVisible] = useState(open);

  // تحديث الحالة المرئية عند تغيير خاصية open من الخارج
  useEffect(() => {
    if (open) setIsVisible(true);
  }, [open]);

  const handleClose = () => {
    setIsVisible(false); // بدء حركة الاختفاء
    setTimeout(() => {
      onClose?.(); // استدعاء دالة الإغلاق الأصلية بعد انتهاء الحركة
    }, 300); // يجب أن يتطابق الوقت مع مدة الحركة
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 40 }} // حركة الخروج (عكس حركة الدخول)
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
              mass: 0.8
            }}
            className="w-full max-w-md"
          >
            {/* البطاقة العائمة الزجاجية */}
            <div className="relative overflow-hidden rounded-3xl">
              {/* خلفية متدرجة مع كرات متوهجة */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
                <div className="absolute -top-40 -right-40 w-60 h-60 bg-blue-300/40 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-60 h-60 bg-cyan-300/40 rounded-full blur-3xl" />
              </div>
              
              {/* المحتوى الزجاجي */}
              <div className="relative backdrop-blur-xl bg-white/60 rounded-3xl p-8 shadow-2xl border border-white/50">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                      delay: 0.2
                    }}
                    className="flex justify-center mb-4"
                  >
                    <AppIcon />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">مرحباً بك في LinkUp!</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    نحن سعداء بانضمامك إلينا. استمتع بتجربة اتصال آمنة وسريعة دون أي إعلانات أو تتبع.
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleClose} // استدعاء دالة الإغلاق الجديدة
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      متابعة
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onLearnMore}
                      className="w-full h-12 rounded-xl border-2 border-gray-200/80 bg-white/50 backdrop-blur-sm text-gray-700 font-medium hover:bg-white/80 transition-all"
                    >
                      معرفة المزيد عن أثير
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}