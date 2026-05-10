import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, Delete, Check, Fingerprint } from 'lucide-react';
import { useAppLock } from '../../context/AppLockContext';

export default function ShieldPinScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryError, setRecoveryError] = useState(false);
  const { verifyPIN, autoVerify, pinLength, unlockWithRecoveryCode, verifyBiometric, biometricEnabled } = useAppLock();

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

  useEffect(() => {
    if (autoVerify && pin.length === pinLength) {
      handleVerify(pin);
    }
  }, [pin, autoVerify, pinLength, handleVerify]);

  // محاولة البصمة تلقائياً عند فتح الشاشة
  useEffect(() => {
    if (biometricEnabled) {
      verifyBiometric();
    }
  }, [biometricEnabled, verifyBiometric]);

  const handleKeyPress = (value) => {
    if (error || showRecovery) return;
    if (value === 'delete') {
      setPin(prev => prev.slice(0, -1));
    } else if (value === 'confirm') {
      handleVerify(pin);
    } else if (value === 'fingerprint') {
      const tryAuth = async () => {
        const ok = await verifyBiometric();
        if (!ok) { setError(true); setTimeout(() => setError(false), 800); }
      };
      tryAuth();
    } else if (pin.length < 20) {
      setPin(prev => prev + value);
    }
  };

  const handleRecoverySubmit = () => {
    if (!recoveryCode.trim()) return;
    const ok = unlockWithRecoveryCode(recoveryCode.trim());
    if (!ok) {
      setRecoveryError(true);
      setRecoveryCode('');
      setTimeout(() => setRecoveryError(false), 800);
    }
  };

  const showConfirmButton = !autoVerify && pin.length >= 4;

  // توليد دوائر الرمز بناءً على الطول الفعلي للمستخدم
  const dots = Array.from({ length: pinLength });

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-xs px-6 flex flex-col items-center gap-8">
        {/* الأيقونة الرئيسية */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative"
        >
          <motion.div
            animate={error || recoveryError ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl ${
              error || recoveryError ? 'bg-red-500' : 'bg-gradient-to-br from-purple-600 to-blue-600'
            }`}
          >
            {showRecovery ? <Lock className="w-9 h-9 text-white" /> : <Lock className="w-9 h-9 text-white" />}
          </motion.div>
        </motion.div>

        {/* العنوان والرسالة */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-xl font-black text-gray-900">
            {showRecovery ? 'رمز الاسترداد' : 'أدخل رمز الأمان'}
          </h1>
          <p className={`text-sm mt-2 ${error || recoveryError ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
            {recoveryError ? 'رمز الاسترداد غير صحيح' : error ? 'الرمز غير صحيح' : showRecovery ? 'أدخل أحد رموز الاسترداد التي حفظتها' : 'أدخل رمز PIN الخاص بك'}
          </p>
          {!showRecovery && showConfirmButton && (
            <p className="text-xs text-gray-400 mt-1">اضغط ✓ للتأكيد</p>
          )}
        </motion.div>

        {showRecovery ? (
          // واجهة رمز الاسترداد
          <div className="w-full space-y-3">
            <input
              type="text"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="أدخل رمز الاسترداد"
              className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <button
              onClick={handleRecoverySubmit}
              disabled={recoveryCode.length < 8}
              className="w-full h-12 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-300 text-white rounded-xl font-bold transition-all active:scale-[0.98]"
            >
              فتح التطبيق
            </button>
            <button
              onClick={() => { setShowRecovery(false); setRecoveryCode(''); setRecoveryError(false); }}
              className="w-full h-10 text-sm text-gray-500 hover:text-purple-600 transition-colors"
            >
              العودة لإدخال الرمز
            </button>
          </div>
        ) : (
          <>
            {/* دوائر ديناميكية */}
            <div className="flex gap-3 justify-center flex-wrap">
              {dots.map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                    i < pin.length
                      ? error ? 'bg-red-500 border-red-500 scale-110' : 'bg-purple-600 border-purple-600 scale-110'
                      : 'border-gray-300 bg-transparent'
                  }`}
                />
              ))}
            </div>

            {/* لوحة المفاتيح */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
              {['1','2','3','4','5','6','7','8','9','fingerprint','0','delete'].map((key) => {
                if (key === 'fingerprint') {
                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleKeyPress('fingerprint')}
                      disabled={!biometricEnabled}
                      className={`h-12 rounded-xl flex items-center justify-center transition-all ${
                        biometricEnabled
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white active:scale-90'
                          : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <Fingerprint className="w-5 h-5" />
                    </motion.button>
                  );
                }
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

            {/* زر نسيان الرمز */}
            <button
              onClick={() => setShowRecovery(true)}
              className="text-xs text-gray-400 hover:text-purple-600 transition-colors mt-2"
            >
              نسيت الرمز؟
            </button>
          </>
        )}
      </div>
    </div>
  );
}