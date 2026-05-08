import { useState } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';
import { useAppLock } from '../../context/AppLockContext';

export default function PinLockScreen() {
  const [attempting, setAttempting] = useState(false);
  const [error, setError] = useState(false);
  const { verifyBiometric } = useAppLock();

  const handleTap = async () => {
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
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col items-center justify-center text-right cursor-pointer"
      dir="rtl"
      onClick={handleTap}
    >
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex flex-col items-center gap-10 w-full max-w-xs px-6 pointer-events-none">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="relative">
          <motion.div animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.5 }} className="w-32 h-32 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
            <Fingerprint className="w-16 h-16 text-white" />
          </motion.div>
          {attempting && <motion.div initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0, scale: 1.8 }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 rounded-3xl border-2 border-emerald-400" />}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
          <h1 className="text-2xl font-black text-gray-900">التحقق من الهوية</h1>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            {error ? 'لم نتمكن من التحقق، حاول مرة أخرى' : 'انقر في أي مكان للتحقق'}
          </p>
          <p className="text-xs text-gray-400 mt-4">يمكنك أيضاً استخدام كلمة مرور جهازك</p>
        </motion.div>
      </motion.div>
    </div>
  );
}