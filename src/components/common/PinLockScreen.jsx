import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Delete, Fingerprint } from 'lucide-react';
import { useAppLock } from '../../context/AppLockContext';

export default function PinLockScreen() {
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState(false);
  const [lockedMessage, setLockedMessage] = useState('');
  const { verifyPin, verifyBiometric, biometricEnabled } = useAppLock();
  
  const pinLength = (localStorage.getItem('app_lock_pin') || '123456').length;
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  const handleNumber = (num) => {
    if (lockedMessage) return;
    if (enteredPin.length >= pinLength) return;
    
    const newPin = enteredPin + num;
    setEnteredPin(newPin);
    
    if (newPin.length === pinLength) {
      const result = verifyPin(newPin);
      if (result.success) {
        setError(false);
      } else {
        setError(true);
        setEnteredPin('');
        if (result.locked) {
          setLockedMessage('محظور لمدة دقيقة');
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

  const handleBiometric = async () => {
    const result = await verifyBiometric();
    if (!result.success) {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col items-center justify-center text-right" dir="rtl">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100/60 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/60 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center gap-8 w-full max-w-xs px-6"
      >
        {/* أيقونة البصمة (إذا كانت مفعلة) أو أيقونة القفل */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="cursor-pointer"
          onClick={biometricEnabled ? handleBiometric : undefined}
        >
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl ${
            biometricEnabled 
              ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/20' 
              : 'bg-gradient-to-br from-purple-600 to-blue-500 shadow-purple-500/20'
          }`}>
            {biometricEnabled ? (
              <Fingerprint className="w-10 h-10 text-white" />
            ) : (
              <div className="text-white">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 1v6M12 17v6M5.64 5.64l4.24 4.24M14.12 14.12l4.24 4.24M1 12h6M17 12h6M5.64 18.36l4.24-4.24M14.12 9.88l4.24-4.24"/>
                </svg>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-2xl font-black text-gray-900">أدخل رمز PIN</h1>
          <p className="text-sm text-gray-500 mt-1">
            {lockedMessage || (biometricEnabled ? 'أو استخدم بصمتك للدخول' : `أدخل الرمز المكون من ${pinLength} أرقام`)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4 items-center"
        >
          {[...Array(pinLength)].map((_, i) => (
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