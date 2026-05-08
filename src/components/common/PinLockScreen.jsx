import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint } from 'lucide-react';
import { useAppLock } from '../../context/AppLockContext';

export default function PinLockScreen() {
  const [error, setError] = useState(false);
  const { verifyBiometric } = useAppLock();

  // محاولة فتح البصمة تلقائياً بمجرد دخول المستخدم للتطبيق
  useEffect(() => {
    const triggerVerify = async () => {
      const result = await verifyBiometric();
      if (!result.success) {
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    };
    
    const timer = setTimeout(triggerVerify, 500); // تأخير بسيط لضمان استقرار الواجهة
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[999999] bg-white flex flex-col items-center justify-center"
      dir="rtl"
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col items-center gap-8"
      >
        <button
          onClick={() => verifyBiometric()}
          className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${error ? 'bg-red-50' : 'bg-slate-50'}`}
        >
          <Fingerprint className={`w-12 h-12 ${error ? 'text-red-500' : 'text-indigo-600'}`} />
        </button>
        
        <div className="text-center px-6">
          <h2 className="text-2xl font-bold text-gray-800">تطبيق أثير</h2>
          <p className="text-gray-500 mt-2">استخدم البصمة للعودة للمحادثات</p>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-red-500 font-medium"
          >
            لم يتم التعرف على البصمة، حاول مرة أخرى
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
