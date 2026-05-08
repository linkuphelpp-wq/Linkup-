import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';
import { useAppLock } from '../../context/AppLockContext';

export default function PinLockScreen() {
  const [attempting, setAttempting] = useState(false);
  const [error, setError] = useState(false);
  const { verifyBiometric } = useAppLock();

  // محاولة التحقق تلقائياً عند ظهور الشاشة لراحة المستخدم
  useEffect(() => {
    const autoVerify = setTimeout(() => {
      handleTap();
    }, 500);
    return () => clearTimeout(autoVerify);
  }, []);

  const handleTap = async () => {
    if (attempting) return;
    setAttempting(true);
    setError(false);
    try {
      const result = await verifyBiometric();
      if (!result.success) {
        setError(true);
        setTimeout(() => setError(false), 800);
      }
    } catch (err) {
      setError(true);
    } finally {
      setAttempting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center text-right cursor-pointer"
      dir="rtl"
      onClick={handleTap}
    >
      {/* خلفية تجميلية */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="relative z-10 flex flex-col items-center gap-10 w-full max-w-xs px-6 pointer-events-none"
      >
        <motion.div 
          initial={{ scale: 0.8 }} 
          animate={{ scale: 1 }} 
          transition={{ type: 'spring', stiffness: 200, damping: 15 }} 
          className="relative"
        >
          <motion.div 
            animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}} 
            transition={{ duration: 0.4 }} 
            className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-colors duration-300 ${error ? 'bg-red-500' : 'bg-gradient-to-br from-indigo-600 to-blue-700'}`}
          >
            <Fingerprint className="w-14 h-14 text-white" />
          </motion.div>
          
          {attempting && (
            <motion.div 
              initial={{ opacity: 1, scale: 1 }} 
              animate={{ opacity: 0, scale: 1.6 }} 
              transition={{ repeat: Infinity, duration: 1.2 }} 
              className="absolute inset-0 rounded-[2.5rem] border-2 border-indigo-400" 
            />
          )}
        </motion.div>

        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">التطبيق مقفل</h1>
          <p className="text-gray-500 mt-3 font-medium">
            {error ? 'فشل التحقق، المس لإعادة المحاولة' : 'استخدم البصمة لإلغاء القفل'}
          </p>
        </div>
      </motion.div>
      
      <div className="absolute bottom-12 text-gray-400 text-sm font-medium">
        LinkUp Security System
      </div>
    </div>
  );
}
