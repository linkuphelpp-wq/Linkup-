import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, Delete, Check } from 'lucide-react';
import { useAppLock } from '../../context/AppLockContext';

export default function PinLockScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { verifyPIN, autoVerify, pinLength } = useAppLock();

  const handleVerify = useCallback((currentPin) => {
    if (currentPin.length >= 4) {
      const valid = verifyPIN(currentPin);
      if (!valid) {
        setError(true);
        setPin('');
        setTimeout(() => setError(false), 800);
      }
    }
  }, [verifyPIN]);

  // التحقق التلقائي عند الوصول إلى طول الرمز المخزن
  useEffect(() => {
    if (autoVerify && pin.length === pinLength) {
      handleVerify(pin);
    }
  }, [pin, autoVerify, pinLength, handleVerify]);

  const handleKeyPress = (value) => {
    if (error) return;
    if (value === 'delete') {
      setPin(prev => prev.slice(0, -1));
    } else if (value === 'confirm') {
      handleVerify(pin);
    } else if (pin.length < 6) {
      setPin(prev => prev + value);
    }
  };

  const showConfirmButton = !autoVerify && pin.length >= 4;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-xs px-6 flex flex-col items-center gap-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative"
        >
          <motion.div
            animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl ${
              error ? 'bg-red-500' : 'bg-gradient-to-br from-purple-600 to-blue-600'
            }`}
          >
            <Lock className="w-9 h-9 text-white" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-xl font-black text-gray-900">أدخل رمز الأمان</h1>
          <p className={`text-sm mt-2 ${error ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
            {error ? 'الرمز غير صحيح، حاول مرة أخرى' : 'أدخل رمز PIN للاستمرار'}
          </p>
          {showConfirmButton && (
            <p className="text-xs text-gray-400 mt-1">اضغط ✓ للمتابعة</p>
          )}
        </motion.div>

        {/* دوائر الرمز */}
        <div className="flex gap-3 justify-center">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                i <= pin.length
                  ? error
                    ? 'bg-red-500 border-red-500 scale-110'
                    : 'bg-purple-600 border-purple-600 scale-110'
                  : 'border-gray-300 bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* لوحة المفاتيح */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
          {['1','2','3','4','5','6','7','8','9','confirm','0','delete'].map((key) => {
            if (key === 'confirm') {
              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleKeyPress('confirm')}
                  disabled={!showConfirmButton}
                  className={`h-12 rounded-xl flex items-center justify-center transition-all ${
                    showConfirmButton
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-white active:scale-90'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-5 h-5" />
                </motion.button>
              );
            }
            if (key === 'delete') {
              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleKeyPress('delete')}
                  className="h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-90 transition-all"
                >
                  <Delete className="w-5 h-5 text-gray-600" />
                </motion.button>
              );
            }
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleKeyPress(key)}
                className="h-12 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 font-bold text-lg flex items-center justify-center active:scale-90 transition-all"
              >
                {key}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}