import { useState, useEffect, useCallback } from 'react';
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
  const { verifyPIN, autoVerify, pinLength, unlockWithRecoveryCode, verifyBiometric, biometricEnabled } = useAppLock();

  // محاولة بصمة تلقائية عند فتح الشاشة (يمكنها فتح التطبيق بمفردها)
  useEffect(() => {
    if (biometricEnabled) {
      verifyBiometric();
    }
  }, [biometricEnabled, verifyBiometric]);

  useEffect(() => {
    if (autoVerify && pin.length === pinLength) {
      handleVerify(pin);
    }
  }, [pin, autoVerify, pinLength]);

  const handleVerify = useCallback((currentPin) => {
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
  }, [verifyPIN]);

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
    if (recoveryCode.length !== 6) return;
    const ok = unlockWithRecoveryCode(recoveryCode);
    if (!ok) {
      setRecoveryError(true);
      setTimeout(() => setRecoveryError(false), 800);
      setRecoveryCode('');
    }
  };

  const showConfirmButton = !autoVerify && pin.length >= 4;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-xs px-6 flex flex-col items-center gap-8">
        {/* أيقونة القفل المركزية */}
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
              error || recoveryError ? 'bg-red-500' : success ? 'bg-emerald-500' : 'bg-gradient-to-br from-purple-600 to-blue-600'
            }`}
          >
            {success ? <Check className="w-12 h-12 text-white" /> : <Lock className="w-12 h-12 text-white" />}
          </motion.div>
        </motion.div>

        {/* العنوان والرسالة */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-black text-gray-900">
            {showRecovery ? 'رمز الاسترداد' : success ? 'تم!' : 'أدخل رمز الأمان'}
          </h1>
          <p className={`text-sm mt-2 font-medium ${error || recoveryError ? 'text-red-500' : success ? 'text-emerald-500' : 'text-gray-500'}`}>
            {recoveryError ? 'رمز الاسترداد غير صحيح' :
             success ? 'فتح التطبيق...' :
             error ? 'الرمز غير صحيح، حاول مرة أخرى' :
             showRecovery ? 'أدخل رمز الاسترداد الاحتياطي' :
             'أدخل رمز PIN (أربعة أرقام على الأقل)'}
          </p>
        </motion.div>

        {showRecovery ? (
          // واجهة رمز الاسترداد (6 أرقام)
          <div className="w-full space-y-4">
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={recoveryCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 6) setRecoveryCode(val);
              }}
              placeholder="الرمز الاحتياطي (6 أرقام)"
              className={`w-full h-14 px-4 rounded-xl border-2 text-center text-2xl tracking-widest focus:outline-none transition-colors ${
                recoveryError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-purple-500'
              }`}
              autoFocus
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleRecoverySubmit}
              disabled={recoveryCode.length !== 6}
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
            {/* حقل إدخال PIN المخفي */}
            <div className="w-full relative">
              <input
                type="password"
                inputMode="numeric"
                maxLength={pinLength}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= pinLength) setPin(val);
                }}
                className="w-full h-14 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-center text-3xl tracking-[0.5em] focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="●●●●"
                autoFocus
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-3xl text-gray-400 select-none">
                {pin.length === 0 ? '●●●●' : '●'.repeat(pin.length)}
              </div>
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