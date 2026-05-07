import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Delete, Shield } from 'lucide-react';
import { useAppLock } from '../../context/AppLockContext';

export default function PinLockScreen() {
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState(false);
  const [lockedMessage, setLockedMessage] = useState('');
  const { verifyPin, failedAttempts } = useAppLock();

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  const handleNumber = (num) => {
    if (lockedMessage) return;
    if (enteredPin.length >= 6) return;
    
    const newPin = enteredPin + num;
    setEnteredPin(newPin);
    
    if (newPin.length === 6) {
      const result = verifyPin(newPin);
      
      if (result.success) {
        setError(false);
        // سيختفي القفل تلقائياً
      } else {
        setError(true);
        setEnteredPin('');
        
        if (result.locked) {
          const minutes = Math.ceil(result.remainingTime / 60);
          setLockedMessage(`محظور لدقيقة كاملة`);
          setTimeout(() => setLockedMessage(''), 60000);
        } else {
          setTimeout(() => setError(false), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    if (lockedMessage) return;
    setEnteredPin(prev => prev.slice(0, -1));
    setError(false);
  };

  useEffect(() => {
    setEnteredPin('');
    setError(false);
    setLockedMessage('');
  }, [failedAttempts]);

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col items-center justify-center text-right" dir="rtl">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100/60 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/60 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center gap-8 w-full max-w-xs px-6"
      >
        {/* الأيقونة */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-xl shadow-purple-500/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* العنوان */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-2xl font-black text-gray-900">أدخل رمز PIN</h1>
          <p className="text-sm text-gray-500 mt-1">
            {lockedMessage || 'أدخل الرمز المكون من 6 أرقام'}
          </p>
        </motion.div>

        {/* نقاط PIN */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4 items-center"
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: error ? [1, 1.3, 1] : i < enteredPin.length ? [0, 1] : 1,
                backgroundColor: error ? '#ef4444' : i < enteredPin.length ? '#7c3aed' : '#e5e7eb'
              }}
              transition={{ duration: 0.3 }}
              className="w-4 h-4 rounded-full"
            />
          ))}
        </motion.div>

        {/* لوحة الأرقام */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-3 w-full"
        >
          {numbers.map((num, index) => (
            <motion.button
              key={num}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.03 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNumber(num)}
              disabled={lockedMessage !== ''}
              className={`h-16 rounded-2xl text-2xl font-bold transition-all shadow-sm ${
                lockedMessage
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-white text-gray-800 border border-gray-100 hover:border-purple-200 hover:shadow-md active:bg-purple-50'
              }`}
            >
              {num}
            </motion.button>
          ))}
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            disabled={lockedMessage !== '' || enteredPin.length === 0}
            className="h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-all disabled:opacity-30"
          >
            <Delete className="w-6 h-6 text-gray-600" />
          </motion.button>
          
          <div className="h-16" />
        </motion.div>
      </motion.div>
    </div>
  );
}