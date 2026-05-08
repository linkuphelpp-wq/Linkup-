import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint } from 'lucide-react';
import { useAppLock } from '../../context/AppLockContext';

export default function PinLockScreen() {
  const [attempting, setAttempting] = useState(false);
  const [error, setError] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const { verifyBiometric } = useAppLock();

  // تأخير بسيط لإظهار واجهة البصمة لضمان أن النظام جاهز
  useEffect(() => {
    const timer = setTimeout(() => setShowUI(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleVerify = async () => {
    if (attempting) return;
    setAttempting(true);
    setError(false);
    const result = await verifyBiometric();
    if (!result.success) {
      setError(true);
      setTimeout(() => setError(false), 800);
    }
    setAttempting(false);
  };

  return (
    <div
      className="fixed inset-0 z-[999999] bg-white flex flex-col items-center justify-center"
      dir="rtl"
      onClick={handleVerify}
    >
      <AnimatePresence>
        {showUI && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 ${error ? 'bg-red-50' : 'bg-slate-50'}`}
            >
              <Fingerprint className={`w-12 h-12 ${error ? 'text-red-500' : 'text-indigo-600'}`} />
            </motion.div>
            
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">تطبيق أثير مقفل</h2>
              <p className="text-sm text-gray-500 mt-2">المس الشاشة للتحقق من الهوية</p>
            </div>

            {error && (
              <motion.p 
                initial={{ y: 10, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                className="text-red-500 text-sm font-bold"
              >
                فشل التحقق، حاول مجدداً
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
