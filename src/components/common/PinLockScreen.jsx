import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, Fingerprint, ShieldAlert } from 'lucide-react';
import { useAppLock } from '../../context/AppLockContext';

export default function PinLockScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryError, setRecoveryError] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false); // حالة الأنيميشن الجذاب

  const { verifyPIN, autoVerify, pinLength, unlockWithRecoveryCode, verifyBiometric, biometricEnabled, unlockApp } = useAppLock();

  // دالة النجاح: تشغل الأنيميشن أولاً، ثم تفتح التطبيق بعد نصف ثانية
  const handleSuccess = useCallback(() => {
    setIsUnlocking(true);
    setTimeout(() => {
      unlockApp();
    }, 450); // مدة الأنيميشن بالملي ثانية
  }, [unlockApp]);

  // تشغيل البصمة تلقائياً عند ظهور الشاشة
  useEffect(() => {
    let mounted = true;
    if (biometricEnabled && !isUnlocking) {
      const checkBio = async () => {
        const ok = await verifyBiometric();
        if (ok && mounted) {
          handleSuccess();
        }
      };
      // تأخير بسيط جداً للسماح للشاشة بالظهور قبل طلب البصمة من النظام
      setTimeout(() => {
        if (mounted) checkBio();
      }, 300);
    }
    return () => { mounted = false; };
  }, [biometricEnabled, verifyBiometric, handleSuccess, isUnlocking]);

  // التحقق التلقائي للرمز
  useEffect(() => {
    if (autoVerify && pin.length === pinLength && !isUnlocking) {
      handleVerify(pin);
    }
  }, [pin, autoVerify, pinLength, isUnlocking]);

  const handleVerify = useCallback((currentPin) => {
    if (currentPin.length >= 4) {
      const valid = verifyPIN(currentPin);
      if (valid) {
        handleSuccess();
      } else {
        setError(true);
        setTimeout(() => setError(false), 600);
        setPin('');
      }
    }
  }, [verifyPIN, handleSuccess]);

  const handleBiometricClick = async () => {
    if (!biometricEnabled || isUnlocking) return;
    const ok = await verifyBiometric();
    if (ok) {
      handleSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 600);
    }
  };

  const handleRecoverySubmit = () => {
    if (recoveryCode.length !== 6 || isUnlocking) return;
    const ok = unlockWithRecoveryCode(recoveryCode);
    if (ok) {
      handleSuccess();
    } else {
      setRecoveryError(true);
      setTimeout(() => setRecoveryError(false), 600);
      setRecoveryCode('');
    }
  };

  const showConfirmButton = !autoVerify && pin.length >= 4;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={
        isUnlocking 
        ? { opacity: 0, scale: 1.08, filter: "blur(6px)" } // أنيميشن الفتح الناعم
        : { opacity: 1, scale: 1, filter: "blur(0px)" }
      }
      transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }} // تأثير سلس (Easing)
      className="fixed inset-0 z-[9999] bg-[#F8F9FA] flex flex-col items-center justify-between pb-16 pt-28 px-6 font-sans" 
      dir="rtl"
    >
      
      {/* القسم العلوي والمتوسط */}
      <div className="w-full max-w-[280px] flex flex-col items-center gap-10">
        
        {/* الأيقونة العلوية الهادئة جداً */}
        <motion.div
          animate={error || recoveryError ? { x: [-8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-sm border border-gray-100 text-gray-500">
            {showRecovery ? <ShieldAlert className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-800 tracking-wide">
              {showRecovery ? 'رمز الاسترداد' : 'أدخل رمز المرور'}
            </h1>
            <p className={`text-xs mt-1.5 ${error || recoveryError ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
              {recoveryError ? 'الرمز غير صحيح' :
               error ? 'رمز المرور غير صحيح' :
               showRecovery ? 'أدخل الرمز الاحتياطي (6 أرقام)' :
               `التطبيق مقفل لحمايتك`}
            </p>
          </div>
        </motion.div>

        {/* حقول الإدخال بهدوء واندماج مع الخلفية */}
        <div className="w-full">
          {showRecovery ? (
            <div className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={recoveryCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 6) setRecoveryCode(val);
                }}
                placeholder="الرمز الاحتياطي"
                disabled={isUnlocking}
                className={`w-full h-14 px-4 rounded-xl border bg-white shadow-sm text-center text-xl tracking-widest focus:outline-none transition-all ${
                  recoveryError ? 'border-red-200 text-red-500 focus:border-red-300' : 'border-gray-100 text-gray-700 focus:border-blue-200 focus:ring-2 focus:ring-blue-50'
                }`}
                autoFocus
              />
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleRecoverySubmit}
                disabled={recoveryCode.length !== 6 || isUnlocking}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-medium transition-colors"
              >
                فتح التطبيق
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= pinLength) setPin(val);
                }}
                placeholder="الرمز"
                disabled={isUnlocking}
                className={`w-full h-14 px-4 rounded-xl border bg-white shadow-sm text-center text-3xl tracking-[0.4em] focus:outline-none transition-all ${
                  error ? 'border-red-200 text-red-500 focus:border-red-300' : 'border-gray-100 text-gray-700 focus:border-blue-200 focus:ring-2 focus:ring-blue-50'
                }`}
                autoFocus
              />
              {showConfirmButton && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleVerify(pin)}
                  disabled={isUnlocking}
                  className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                >
                  تأكيد
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* القسم السفلي: البصمة وزر الاسترداد */}
      <div className="w-full flex flex-col items-center gap-8">
        
        {/* زر البصمة المستقل في الأسفل بتصميم شفاف وهادئ */}
        {biometricEnabled && !showRecovery && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleBiometricClick}
            disabled={isUnlocking}
            className="flex flex-col items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors"
          >
            <div className="w-14 h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center">
              <Fingerprint className="w-6 h-6" />
            </div>
          </motion.button>
        )}

        {/* زر نسيان الرمز */}
        <button
          onClick={() => {
            if (showRecovery) {
              setShowRecovery(false);
              setRecoveryCode('');
              setRecoveryError(false);
            } else {
              setShowRecovery(true);
            }
          }}
          disabled={isUnlocking}
          className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showRecovery ? 'العودة لرمز المرور' : 'هل نسيت الرمز؟'}
        </button>
      </div>

    </motion.div>
  );
}
