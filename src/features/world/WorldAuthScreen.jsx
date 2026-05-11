import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Mail, Lock, Eye, EyeOff, Globe, AtSign, Shield, CheckCircle2, Loader2
} from 'lucide-react';
import { auth, db } from '../../../firebase/config';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function WorldAuthScreen({ onBack, onWorldEnter }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState('auth'); // 'auth' أو 'chooseUsername'
  const [worldUsername, setWorldUsername] = useState('');
  const [worldUserData, setWorldUserData] = useState(null);
  const [existingWorldUser, setExistingWorldUser] = useState(false);

  // مستمع لحالة المصادقة
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.emailVerified) {
        // تحقق من وجود حساب عالمي
        const snap = await getDoc(doc(db, 'world_users', fbUser.uid));
        if (snap.exists()) {
          // لديه حساب عالمي بالفعل، ندخله مباشرة
          onWorldEnter?.(snap.data());
        } else {
          // لا يوجد حساب عالمي، انتقل لاختيار معرف
          setWorldUserData({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'مستخدم',
            photoURL: fbUser.photoURL || '',
          });
          setStep('chooseUsername');
        }
      } else if (fbUser && !fbUser.emailVerified) {
        setError('يرجى التحقق من بريدك الإلكتروني أولاً.');
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(user);
        setSuccess('تم إرسال رابط التحقق لبريدك. يرجى التحقق ثم تسجيل الدخول.');
        setLoading(false);
        return;
      }
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use': setError('البريد مستخدم بالفعل. حاول تسجيل الدخول.'); break;
        case 'auth/invalid-credential': setError('بريد أو كلمة مرور غير صحيحة.'); break;
        case 'auth/weak-password': setError('كلمة المرور ضعيفة (6 أحرف على الأقل).'); break;
        default: setError('حدث خطأ. حاول مرة أخرى.');
      }
      setLoading(false);
    }
  };

  const handleChooseUsername = async () => {
    const trimmed = worldUsername.trim().toLowerCase();
    if (!trimmed || trimmed.length < 3 || trimmed.length > 20) {
      setError('المعرف يجب أن يكون بين 3 و 20 حرفاً.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError('المعرف: أحرف إنجليزية، أرقام، وشرطة سفلية فقط.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const existing = await getDoc(doc(db, 'world_usernames', trimmed));
      if (existing.exists()) {
        setError('المعرف محجوز. اختر معرفاً آخر.');
        setLoading(false);
        return;
      }
      const finalData = { ...worldUserData, username: trimmed, createdAt: serverTimestamp() };
      await setDoc(doc(db, 'world_users', worldUserData.uid), finalData);
      await setDoc(doc(db, 'world_usernames', trimmed), { uid: worldUserData.uid, createdAt: serverTimestamp() });
      onWorldEnter?.(finalData);
    } catch (err) {
      setError('فشل حفظ المعرف. حاول لاحقاً.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden" dir="rtl">
      {/* خلفية تأثير */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200 rounded-full blur-[120px] animate-pulse opacity-30" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200 rounded-full blur-[120px] animate-pulse opacity-30" style={{ animationDelay: '2s' }} />
      </div>

      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-5 pt-12 pb-4 shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-purple-500" />
              <h1 className="text-xl font-black text-gray-900">العالم</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">سجل دخولك للانضمام إلى العالم</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-8 relative z-10">
        <AnimatePresence mode="wait">
          {step === 'auth' ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="w-full max-w-md"
            >
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-800">{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}</h2>
                  <p className="text-sm text-gray-500 mt-2">للعالم</p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="البريد الإلكتروني"
                      className="w-full h-14 pr-12 pl-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-white transition-all"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="كلمة المرور"
                      className="w-full h-14 pr-12 pl-12 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-white transition-all"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2"><Shield className="w-4 h-4 shrink-0"/>{error}</div>}
                  {success && <div className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-xl flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0"/>{success}</div>}

                  <button type="submit" disabled={loading} className="w-full h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white rounded-xl font-bold text-base shadow-lg shadow-purple-200/50 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <>{isLogin ? 'دخول' : 'إنشاء حساب'}<ArrowRight className="w-4 h-4"/></>}
                  </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                  {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                  <button onClick={() => setIsLogin(!isLogin)} className="text-purple-600 font-bold mr-1">{isLogin ? 'إنشاء حساب' : 'تسجيل الدخول'}</button>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="username"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="w-full max-w-md"
            >
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <AtSign className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-800">اختر معرفك</h2>
                  <p className="text-sm text-gray-500 mt-2">هذا المعرف سيظهر للجميع في العالم</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <AtSign className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      value={worldUsername}
                      onChange={e => setWorldUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="المعرف"
                      className="w-full h-14 pr-12 pl-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-white transition-all"
                      maxLength={20}
                    />
                  </div>
                  {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2"><Shield className="w-4 h-4 shrink-0"/>{error}</div>}
                  <button onClick={handleChooseUsername} disabled={loading || !worldUsername.trim()} className="w-full h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white rounded-xl font-bold text-base shadow-lg shadow-purple-200/50 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <>انضم إلى العالم<ArrowRight className="w-4 h-4"/></>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}