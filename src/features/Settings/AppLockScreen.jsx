import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Shield, Zap, CheckCircle, Eye, EyeOff, Fingerprint, Copy } from 'lucide-react';
import { useAppLock } from '../../context/AppLockContext';

export default function AppLockScreen({ onBack }) {
  const { lockEnabled, autoVerify, setPIN, disableLock, setAutoVerifyOption,
          enableBiometric, disableBiometric, biometricEnabled } = useAppLock();
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [step, setStep] = useState('idle');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

  const handleCreate = () => {
    if (newPin.length < 4 || newPin.length > 20) {
      setError('الرمز يجب أن يكون بين 4 و 20 رقم');
      return;
    }
    setStep('confirming');
    setError('');
  };

  const handleConfirm = () => {
    if (newPin !== confirmPin) {
      setError('الرمزان غير متطابقين');
      setConfirmPin('');
      return;
    }
    const result = setPIN(newPin);
    if (result.success) {
      setRecoveryCodes(result.codes);
      setShowRecoveryCodes(true);
      setStep('idle');
      setNewPin('');
      setConfirmPin('');
    }
  };

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDisable = () => {
    if (window.confirm('هل أنت متأكد من إلغاء قفل التطبيق؟')) {
      disableLock();
      setNewPin('');
      setConfirmPin('');
      setStep('idle');
      setError('');
      setShowRecoveryCodes(false);
      setRecoveryCodes([]);
    }
  };

  const handleBiometricToggle = async () => {
    if (biometricEnabled) {
      disableBiometric();
    } else {
      const result = await enableBiometric();
      if (!result.success) {
        if (result.error === 'not_supported') {
          alert('جهازك لا يدعم البصمة، أو لم يتم تفعيلها في إعدادات النظام الخاص بجوالك.');
        } else {
          alert('تم إلغاء أو فشل تفعيل البصمة. يرجى المحاولة مرة أخرى.');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32 text-right font-sans" dir="rtl">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 bg-[#F8F9FA]/90 backdrop-blur-xl px-5 pt-12 pb-6 text-center"
        style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center active:scale-95 transition-all text-gray-600 hover:text-gray-900 shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-800">إعدادات الأمان</h1>
          </div>
        </div>
      </motion.header>

      <main className="px-4 space-y-5 max-w-md mx-auto">
        {showRecoveryCodes ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="font-semibold text-gray-800">رموز الاسترداد الاحتياطية</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">احفظ هذه الرموز في مكان آمن. كل رمز يُستخدم لمرة واحدة لفتح التطبيق إذا نسيت الـ PIN.</p>
            </div>
            <div className="bg-[#F8F9FA] rounded-xl p-4 mb-5 grid grid-cols-2 gap-3">
              {recoveryCodes.map((code, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-lg p-3 text-center font-mono text-sm tracking-widest text-gray-700 shadow-sm select-all">
                  {code}
                </div>
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleCopyCodes}
              className="w-full h-12 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" /> نسخ جميع الرموز
            </motion.button>
            <button
              onClick={() => { setShowRecoveryCodes(false); setRecoveryCodes([]); }}
              className="w-full h-12 text-sm text-gray-500 hover:text-gray-800 transition-colors mt-2 font-medium"
            >
              تم، لقد حفظتها
            </button>
          </motion.div>
        ) : !lockEnabled ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center mx-auto mb-3 border border-gray-100">
                <Lock className="w-5 h-5" />
              </div>
              <p className="font-semibold text-gray-800">رمز مرور جديد</p>
              <p className="text-sm text-gray-400 mt-1">أدخل 4 أرقام على الأقل</p>
            </div>

            {step === 'idle' ? (
              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={20}
                    value={newPin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 20) setNewPin(val);
                    }}
                    placeholder="أدخل الرمز"
                    className="w-full h-14 pr-12 pl-12 rounded-xl border border-gray-200 bg-gray-50 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-gray-700 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreate}
                  disabled={newPin.length < 4}
                  className="w-full h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl font-medium transition-colors"
                >
                  متابعة
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-center text-gray-500">أعد إدخال الرمز للتأكيد</p>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={20}
                    value={confirmPin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 20) setConfirmPin(val);
                    }}
                    placeholder="تأكيد الرمز"
                    className="w-full h-14 px-4 rounded-xl border border-gray-200 bg-gray-50 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  disabled={confirmPin.length < 4}
                  className="w-full h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl font-medium transition-colors"
                >
                  حفظ وتفعيل
                </motion.button>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">القفل مفعل</p>
                  <p className="text-xs text-gray-400 mt-0.5">التطبيق محمي برمز مرور</p>
                </div>
              </div>
              <button
                onClick={handleDisable}
                className="px-4 py-2 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                إلغاء
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center border border-gray-100">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">التحقق التلقائي</p>
                  <p className="text-xs text-gray-400 mt-0.5">دخول فوري بدون زر تأكيد</p>
                </div>
              </div>
              <button
                onClick={() => setAutoVerifyOption(!autoVerify)}
                className={`w-12 h-7 rounded-full transition-colors relative ${autoVerify ? 'bg-blue-500' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${autoVerify ? 'translate-x-5' : ''}`} />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center border border-gray-100">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">البصمة</p>
                  <p className="text-xs text-gray-400 mt-0.5">فتح التطبيق بالبصمة</p>
                </div>
              </div>
              <button
                onClick={handleBiometricToggle}
                className={`w-12 h-7 rounded-full transition-colors relative ${biometricEnabled ? 'bg-blue-500' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${biometricEnabled ? 'translate-x-5' : ''}`} />
              </button>
            </motion.div>
          </div>
        )}

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 text-white rounded-xl p-4 flex items-center justify-center gap-2 shadow-lg fixed bottom-8 left-4 right-4 max-w-sm mx-auto z-50"
          >
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium">تم نسخ الرموز للحافظة</span>
          </motion.div>
        )}
      </main>
    </div>
  );
}
