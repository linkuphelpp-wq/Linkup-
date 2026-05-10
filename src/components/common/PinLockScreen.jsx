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
  const { verifyPIN, autoVerify, pinLength, unlockWithRecoveryCode, verifyBiometric, biometricEnabled } = useAppLock();

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
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-between pb-12 pt-24 px-6" dir="rtl">
      
      {/* القسم العلوي والمتوسط: الأيقونة وحقل الإدخال */}
      <div className="w-full max-w-xs flex flex-col items-center gap-8">
        
        {/* الأيقونة العلوية الهادئة */}
        <motion.div
          animate={error || recoveryError ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-gray-50 border-2 ${
            error || recoveryError ? 'border-red-100 text-red-500' : 'border-gray-100 text-gray-800'
          }`}>
            {showRecovery ? <ShieldAlert className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">
              {showRecovery ? 'رمز الاسترداد' : 'أدخل رمز المرور'}
            </h1>
            <p className={`text-sm mt-1 ${error || recoveryError ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
              {recoveryError ? 'الرمز غير صحيح' :
               error ? 'رمز المرور غير صحيح' :
               showRecovery ? 'أدخل الرمز الاحتياطي (6 أرقام)' :
               `الرجاء إدخال الرمز الخاص بك`}
            </p>
          </div>
        </motion.div>

        {/* حقول الإدخال */}
        <div className="w-full w-full">
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
                className={`w-full h-14 px-4 rounded-xl border bg-gray-50 text-center text-xl tracking-widest focus:outline-none transition-all ${
                  recoveryError ? 'border-red-300 text-red-500 focus:border-red-400' : 'border-gray-200 text-gray-900 focus:border-gray-400'
                }`}
                autoFocus
              />
              <button
                onClick={handleRecoverySubmit}
                disabled={recoveryCode.length !== 6}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-bold transition-all"
              >
                فتح التطبيق
              </button>
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
                className={`w-full h-14 px-4 rounded-xl border bg-gray-50 text-center text-3xl tracking-[0.5em] focus:outline-none transition-all ${
                  error ? 'border-red-300 text-red-500 focus:border-red-400' : 'border-gray-200 text-gray-900 focus:border-gray-400'
                }`}
                autoFocus
              />
              {showConfirmButton && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleVerify(pin)}
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-all"
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
        
        {/* زر البصمة المستقل في الأسفل */}
        {biometricEnabled && !showRecovery && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleBiometric}
            className="flex flex-col items-center gap-3 text-gray-400 hover:text-emerald-600 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center">
              <Fingerprint className="w-8 h-8" />
            </div>
            <span className="text-sm font-medium text-gray-500">استخدم البصمة</span>
          </motion.button>
        )}

        {/* زر نسيان الرمز / العودة */}
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
          className="text-sm font-medium text-gray-400 hover:text-gray-800 transition-colors"
        >
          {showRecovery ? 'العودة لرمز المرور' : 'هل نسيت الرمز؟'}
        </button>
      </div>

    </div>
  );
}
