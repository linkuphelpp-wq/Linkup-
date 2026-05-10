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

  // محاولة بصمة تلقائية عند فتح الشاشة (إن كانت مفعلة)
  useEffect(() => {
    if (biometricEnabled) {
      verifyBiometric();
    }
  }, [biometricEnabled, verifyBiometric]);

  // التحقق التلقائي عند اكتمال الرمز
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

  const handleBiometric = async () => {
    if (!biometricEnabled) return;
    const ok = await verifyBiometric();
    if (!ok) {
      setError(true);
      setTimeout(() => setError(false), 800);
    }
  };

  const handleKeyPress = (value) => {
    if (error || success || showRecovery) return;
    if (value === 'delete') {
      setPin(prev => prev.slice(0, -1));
    } else if (value === 'confirm') {
      handleVerify(pin);
    } else if (value === 'fingerprint') {
      handleBiometric();
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

  // زر التأكيد يظهر فقط إذا كان التحقق التلقائي غير مفعّل والرمز يحتوي على 4 خانات على الأقل
  const showConfirmButton = !autoVerify && pin.length >= 4;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-xs px-6 flex flex-col items-center gap-6">
        {/* أيقونة القفل */}
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

        {/* زر البصمة المستقل */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleBiometric}
          disabled={!biometricEnabled}
          className={`relative w-full max-w-[200px] h-14 rounded-2xl flex items-center justify-center gap-3 font-bold text-base shadow-lg transition-all ${
            biometricEnabled
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Fingerprint className="w-7 h-7" />
          فتح بالبصمة
        </motion.button>

        {/* العنوان والتعليمات */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-xl font-black text-gray-900">
            {showRecovery ? 'رمز الاسترداد' : success ? 'تم!' : 'أدخل رمز الأمان'}
          </h1>
          <p className={`text-sm mt-1 font-medium ${error || recoveryError ? 'text-red-500' : success ? 'text-emerald-500' : 'text-gray-500'}`}>
            {recoveryError ? 'رمز الاسترداد غير صحيح' :
             success ? 'فتح التطبيق...' :
             error ? 'الرمز غير صحيح' :
             showRecovery ? 'أدخل رمز الاسترداد الاحتياطي (6 أرقام)' :
             'أدخل رمز PIN (أربعة أرقام على الأقل)'}
          </p>
        </motion.div>

        {showRecovery ? (
          /* واجهة الاسترداد */
          <div className="w-full space-y-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={recoveryCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 6) setRecoveryCode(val);
              }}
              placeholder="الرمز الاحتياطي (6 أرقام)"
              className={`w-full h-14 px-4 rounded-xl border-2 text-center text-transparent caret-transparent selection:bg-transparent placeholder:text-gray-400 focus:outline-none transition-colors ${
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
              العودة
            </button>
          </div>
        ) : (
          <>
            {/* حقل إدخال PIN مخفي النص والمؤشر */}
            <input
              type="text"
              inputMode="numeric"
              maxLength={pinLength}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= pinLength) setPin(val);
              }}
              placeholder={`أدخل الرمز (${pinLength} أرقام)`}
              className="w-full h-14 px-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-center text-transparent caret-transparent selection:bg-transparent placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              autoFocus
            />

            {/* لوحة المفاتيح الرقمية (اختيارية، تبقى للراحة) */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-[260px]">
              {['1','2','3','4','5','6','7','8','9','','0','delete'].map((key) => {
                if (key === '') return <div key="empty" />;
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

            {/* زر التأكيد اليدوي */}
            {showConfirmButton && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleVerify(pin)}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold transition-all shadow-md"
              >
                تأكيد الرمز
              </motion.button>
            )}

            {/* رابط نسيان الرمز */}
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
