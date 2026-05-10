import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock, Delete, Check, Fingerprint } from 'lucide-react';
import { useAppLock } from '../../context/AppLockContext';

export default function ShieldPinScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryError, setRecoveryError] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const { verifyPIN, autoVerify, pinLength, unlockWithRecoveryCode, verifyBiometric, biometricEnabled } = useAppLock();
  const inputRef = useRef(null);

  // محاولة بصمة تلقائية عند فتح الشاشة
  useEffect(() => {
    if (biometricEnabled) {
      verifyBiometric().then(ok => {
        if (!ok) { /* لا نفعل شيئاً */ }
      });
    }
  }, [biometricEnabled, verifyBiometric]);

  useEffect(() => {
    if (autoVerify && pin.length === pinLength) {
      handleVerify(pin);
    }
  }, [pin, autoVerify, pinLength]);

  const handleVerify = (currentPin) => {
    if (currentPin.length >= 4) {
      const valid = verifyPIN(currentPin);
      if (!valid) {
        setError(true);
        setTimeout(() => setError(false), 800);
        setPin('');
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 400);
      }
    }
  };

  const handleKeyPress = (value) => {
    if (error || success || showRecovery) return;
    if (value === 'delete') {
      setPin(prev => prev.slice(0, -1));
    } else if (value === 'confirm') {
      handleVerify(pin);
    } else if (value === 'fingerprint') {
      verifyBiometric().then(ok => {
        if (!ok) { setError(true); setTimeout(() => setError(false), 800); }
      });
    } else if (pin.length < 20) {
      setPin(prev => prev + value);
    }
  };

  const handleRecoverySubmit = () => {
    if (!recoveryCode.trim()) return;
    const ok = unlockWithRecoveryCode(recoveryCode.trim());
    if (!ok) {
      setRecoveryError(true);
      setTimeout(() => setRecoveryError(false), 800);
      setRecoveryCode('');
    } else {
      setRecoverySuccess(true);
      setTimeout(() => setRecoverySuccess(false), 400);
    }
  };

  const showConfirmButton = !autoVerify && pin.length >= 4;

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
            animate={error || recoveryError ? { x: [0, -12, 12, -12, 12, 0] } : {}}
            transition={{ duration: 0.6 }}
            className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl ${
              error || recoveryError ? 'bg-red-500' : success || recoverySuccess ? 'bg-emerald-500' : 'bg-gradient-to-br from-purple-600 to-blue-600'
            }`}
          >
            {showRecovery ? (
              <Lock className="w-12 h-12 text-white" />
            ) : success ? (
              <Check className="w-12 h-12 text-white" />
            ) : (
              <Lock className="w-12 h-12 text-white" />
            )}
          </motion.div>
        </motion.div>

        {/* العنوان والرسالة */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-black text-gray-900">
            {showRecovery ? 'رمز الاسترداد' : 'مرحباً بك'}
          </h1>
          <p className={`text-sm mt-2 font-medium ${error || recoveryError ? 'text-red-500' : success || recoverySuccess ? 'text-emerald-500' : 'text-gray-500'}`}>
            {recoveryError ? 'الرمز غير صحيح، حاول مرة أخرى' :
             recoverySuccess ? 'تم فتح التطبيق بنجاح' :
             error ? 'الرمز غير صحيح' :
             showRecovery ? 'أدخل رمز الاسترداد لمرة واحدة' :
             'أدخل رمز PIN الخاص بك'}
          </p>
        </motion.div>

        {showRecovery ? (
          // واجهة رمز الاسترداد
          <div className="w-full space-y-4">
            <input
              type="text"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="رمز الاسترداد (8 أرقام)"
              className={`w-full h-14 px-4 rounded-xl border-2 text-center text-lg tracking-widest focus:outline-none transition-colors ${
                recoveryError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-purple-500'
              }`}
              autoFocus
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleRecoverySubmit}
              disabled={recoveryCode.length < 8}
              className="w-full h-12 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-300 text-white rounded-xl font-bold transition-all"
            >
              فتح التطبيق
            </motion.button>
            <button
              onClick={() => { setShowRecovery(false); setRecoveryCode(''); setRecoveryError(false); }}
              className="w-full h-10 text-sm text-gray-500 hover:text-purple-600 transition-colors"
            >
              العودة لإدخال الرمز
            </button>
          </div>
        ) : (
          <>
            {/* دوائر الرمز (ديناميكية) */}
            <div className="flex gap-4 justify-center flex-wrap">
              {Array.from({ length: pinLength }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    scale: i < pin.length ? 1.15 : 1,
                    backgroundColor: i < pin.length ? (error ? '#EF4444' : '#8B5CF6') : '#E5E7EB',
                    borderColor: i < pin.length ? (error ? '#DC2626' : '#7C3AED') : '#D1D5DB'
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="w-4 h-4 rounded-full border-2"
                />
              ))}
            </div>

            {/* لوحة المفاتيح الرقمية */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-[260px]">
              {['1','2','3','4','5','6','7','8','9','fingerprint','0','delete'].map((key) => {
                if (key === 'fingerprint') {
                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleKeyPress('fingerprint')}
                      disabled={!biometricEnabled}
                      className={`h-14 rounded-2xl flex items-center justify-center transition-all ${
                        biometricEnabled
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-200'
                          : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <Fingerprint className="w-7 h-7" />
                    </motion.button>
                  );
                }
                if (key === 'delete') {
                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleKeyPress('delete')}
                      className="h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
                    >
                      <Delete className="w-6 h-6 text-gray-600" />
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
                      className={`h-14 rounded-2xl flex items-center justify-center transition-all ${
                        showConfirmButton
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-200'
                          : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <Check className="w-7 h-7" />
                    </motion.button>
                  );
                }
                return (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleKeyPress(key)}
                    className="h-14 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 font-bold text-2xl flex items-center justify-center shadow-sm transition-all"
                  >
                    {key}
                  </motion.button>
                );
              })}
            </div>

            {/* زر نسيان الرمز */}
            <button
              onClick={() => setShowRecovery(true)}
              className="text-sm text-gray-400 hover:text-purple-600 transition-colors"
            >
              هل نسيت الرمز؟
            </button>
          </>
        )}
      </div>
    </div>
  );
}