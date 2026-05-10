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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-32 text-right" dir="rtl">
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 bg-white/80 backdrop-blur-2xl border-b border-gray-200/60 px-5 pt-12 pb-4 text-center shadow-sm"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-500" />
            <h1 className="text-2xl font-black text-gray-900">قفل التطبيق</h1>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">PIN · بصمة · استرداد احتياطي</p>
      </motion.header>

      <main className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {showRecoveryCodes ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm"
          >
            <div className="text-center mb-4">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600 inline-block mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="font-bold text-gray-900">رموز الاسترداد الاحتياطية</h2>
              <p className="text-xs text-gray-500 mt-1">احفظ هذه الرموز في مكان آمن. كل رمز يُستخدم لمرة واحدة لفتح التطبيق إذا نسيت الـ PIN.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 grid grid-cols-2 gap-2">
              {recoveryCodes.map((code, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-2 text-center font-mono text-sm tracking-widest select-all">
                  {code}
                </div>
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCopyCodes}
              className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" /> نسخ جميع الرموز
            </motion.button>
            <button
              onClick={() => { setShowRecoveryCodes(false); setRecoveryCodes([]); }}
              className="w-full h-10 text-sm text-gray-500 hover:text-purple-600 transition-colors mt-2"
            >
              تم، لقد حفظتها
            </button>
          </motion.div>
        ) : !lockEnabled ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm"
          >
            <div className="text-center mb-6">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600 inline-block mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <p className="font-bold text-gray-900">إنشاء رمز PIN جديد</p>
              <p className="text-xs text-gray-500 mt-1">أدخل 4 إلى 20 رقماً</p>
            </div>

            {step === 'idle' ? (
              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={20}
                    value={newPin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 20) setNewPin(val);
                    }}
                    placeholder="أدخل الرمز (4 إلى 20 رقماً)"
                    className="w-full h-14 pr-12 pl-12 rounded-xl border border-gray-200 bg-gray-50 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCreate}
                  disabled={newPin.length < 4}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl font-bold transition-all shadow-md shadow-purple-100"
                >
                  متابعة
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-center text-gray-600">أعد إدخال الرمز للتأكيد</p>
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={20}
                  value={confirmPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 20) setConfirmPin(val);
                  }}
                  placeholder="تأكيد الرمز"
                  className="w-full h-14 px-4 rounded-xl border border-gray-200 bg-gray-50 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirm}
                  disabled={confirmPin.length < 4}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-100"
                >
                  حفظ الرمز
                </motion.button>
              </div>
            )}
          </motion.div>
        ) : (
          <>
            {/* الحالة النشطة للقفل */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="font-bold text-gray-900">القفل مفعّل</span>
                </div>
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleDisable}
                className="w-full h-12 bg-red-500 hover:bg-red-400 text-white rounded-xl font-bold transition-all shadow-md shadow-red-100"
              >
                إلغاء القفل
              </motion.button>
            </motion.div>

            {/* التحقق التلقائي */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">التحقق التلقائي</p>
                    <p className="text-xs text-gray-500 mt-1">دخول فوري عند اكتمال الرمز</p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoVerifyOption(!autoVerify)}
                  className={`w-14 h-8 rounded-full transition-colors relative ${autoVerify ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${autoVerify ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </motion.div>

            {/* بصمة الإصبع */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">فتح القفل بالبصمة</p>
                    <p className="text-xs text-gray-500 mt-1">استخدم بصمة إصبعك بدلاً من الرمز</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    biometricEnabled
                      ? disableBiometric()
                      : enableBiometric().then(ok => { if (!ok) alert('فشل تفعيل البصمة، تأكد من دعم الجهاز'); });
                  }}
                  className={`w-14 h-8 rounded-full transition-colors relative ${biometricEnabled ? 'bg-emerald-600' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${biometricEnabled ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </motion.div>
          </>
        )}

        {/* رسالة الحفظ المؤقت */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 text-emerald-700"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-bold">تم نسخ الرموز بنجاح</span>
          </motion.div>
        )}
      </main>
    </div>
  );
}