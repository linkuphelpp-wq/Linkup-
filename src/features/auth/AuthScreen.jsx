import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { auth, db } from '../../firebase/config';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification,
  signInWithPopup, GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// ───────── مكونات مخصصة ─────────
const Input = ({ icon: Icon, className, ...props }) => (
  <div className="relative group/input">
    {Icon && <Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-purple-500 transition-colors" />}
    <input 
      className={`w-full h-14 pr-12 pl-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent focus:bg-white transition-all text-base ${className}`}
      {...props}
    />
  </div>
);

const Button = ({ children, className, disabled, ...props }) => (
  <button 
    disabled={disabled}
    className={`relative overflow-hidden rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {children}
  </button>
);

// ───────── مكون الشاشة الرئيسي ─────────
export default function AuthScreen({ onLogin, onForgotPassword }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exiting, setExiting] = useState(false);
  const [direction, setDirection] = useState(0); // -1 لليسار، 1 لليمين

  const getErrorMessage = (err) => {
    switch (err.code) {
      case 'auth/email-already-in-use': return 'الحساب موجود بالفعل';
      case 'auth/invalid-credential':
      case 'auth/wrong-password': return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      case 'auth/user-not-found': return 'لا يوجد حساب بهذا البريد الإلكتروني';
      case 'auth/weak-password': return 'كلمة المرور ضعيفة، 6 أحرف على الأقل';
      case 'auth/too-many-requests': return 'محاولات كثيرة، حاول لاحقاً';
      case 'auth/invalid-email': return 'بريد إلكتروني غير صالح';
      default: return 'حدث خطأ، حاول مرة أخرى';
    }
  };

  // تبديل احترافي بين الوضعين
  const switchMode = (toLogin) => {
    if (toLogin === isLogin) return;
    setDirection(toLogin ? -1 : 1);
    setIsLogin(toLogin);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError(''); 
    setSuccess('');

    if (!email || !password) return setError('يرجى ملء جميع الحقول');
    if (!isLogin && password !== confirmPassword) return setError('كلمتا المرور غير متطابقتين');
    if (!isLogin && password.length < 6) return setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
    
    setLoading(true);
    try {
      const { user } = isLogin 
        ? await signInWithEmailAndPassword(auth, email, password) 
        : await createUserWithEmailAndPassword(auth, email, password);
      
      if (!user.emailVerified) { 
        await sendEmailVerification(user); 
        setSuccess('تم إرسال رابط التحقق لبريدك.'); 
        setLoading(false); 
        return; 
      }
      
      if (!isLogin) {
        const today = new Date().toISOString().split('T')[0];
        await setDoc(doc(db, 'users', user.uid), { 
          uid: user.uid, email: user.email, displayName: '', photoURL: '', username: '', 
          status: 'online', lastSeen: serverTimestamp(), loginDates: [today], loginCount: 1, 
          settings: { fontSize: 'medium', fontFamily: 'tajawal', muteMicOnJoin: false, speakerDefault: false }, 
          contacts: [], blockedUsers: [], createdAt: serverTimestamp() 
        });
        await sendEmailVerification(user);
        setSuccess('تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني.');
        setTimeout(() => { setIsLogin(true); setSuccess(''); }, 3000);
      } else {
        setExiting(true);
        setTimeout(() => onLogin?.(user), 500);
      }
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally { 
      setLoading(false); 
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true); 
    setError('');
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const user = result.user;
      const ref = doc(db, 'users', user.uid);
      if (!(await getDoc(ref)).exists()) {
        await setDoc(ref, { 
          uid: user.uid, email: user.email, displayName: user.displayName || '', photoURL: user.photoURL || '', 
          username: '', status: 'online', lastSeen: serverTimestamp(), 
          loginDates: [new Date().toISOString().split('T')[0]], loginCount: 1, 
          settings: { fontSize: 'medium', fontFamily: 'tajawal', muteMicOnJoin: false, speakerDefault: false }, 
          contacts: [], blockedUsers: [], createdAt: serverTimestamp() 
        });
      }
      setExiting(true);
      setTimeout(() => onLogin?.(user), 500);
    } catch (err) { 
      if (err.code !== 'auth/cancelled-popup-request' && err.code !== 'auth/popup-closed-by-user') {
        setError(err.code === 'auth/account-exists-with-different-credential' ? 'البريد مسجل بطريقة مختلفة' : 'فشل تسجيل الدخول، حاول مرة أخرى');
      }
    } finally { 
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden selection:bg-purple-100" dir="rtl">
      {/* خلفية بنفسجية خفيفة جداً */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-50 rounded-full blur-[150px] opacity-60" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-50 rounded-full blur-[130px] opacity-50" />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          {!exiting && (
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="w-full max-w-md"
            >
              <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-purple-100/50 border border-gray-100">
                {/* الشعار والترحيب */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-extrabold text-gray-800">
                    {isLogin ? 'مرحباً بك' : 'إنشاء حساب'}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {isLogin ? 'سجل دخولك للمتابعة' : 'أنشئ حساباً جديداً للبدء'}
                  </p>
                </div>

                {/* تبويبات التبديل */}
                <div className="relative flex bg-gray-100 rounded-2xl p-1.5 mb-6 border border-gray-200">
                  <motion.div
                    className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 shadow-md"
                    animate={{ left: isLogin ? '1.5' : 'calc(50% + 3px)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    style={{ left: isLogin ? '0.375rem' : 'calc(50% + 0.187rem)' }}
                  />
                  <button
                    type="button"
                    onClick={() => switchMode(true)}
                    className={`relative z-10 flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode(false)}
                    className={`relative z-10 flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${!isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    إنشاء حساب
                  </button>
                </div>

                {/* النموذج */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    icon={Mail}
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="البريد الإلكتروني"
                    required
                    disabled={loading}
                  />
                  
                  <Input
                    icon={Lock}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="كلمة المرور"
                    required
                    disabled={loading}
                    className="tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    style={{ marginTop: '-2.8rem', marginLeft: '0.25rem' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  {!isLogin && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="relative">
                          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="تأكيد كلمة المرور"
                            required
                            disabled={loading}
                            className="w-full h-14 pr-12 pl-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent focus:bg-white transition-all tracking-widest"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}

                  {isLogin && (
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium text-left transition-all hover:underline"
                      disabled={loading}
                    >
                      نسيت كلمة المرور؟
                    </button>
                  )}
                  
                  {/* رسائل الخطأ والنجاح */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2">
                      <span className="shrink-0">⚠️</span> {error}
                    </div>
                  )}
                  {success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm p-3 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0"/> {success}
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white rounded-xl font-bold text-base shadow-lg shadow-purple-200/50 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}<ArrowRight className="w-4 h-4" /></>}
                  </Button>
                </form>

                {/* فاصل أو */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-gray-200"/>
                  <span className="text-xs text-gray-400 font-medium">أو</span>
                  <div className="flex-1 h-px bg-gray-200"/>
                </div>
                
                {/* زر جوجل */}
                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-14 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  المتابعة عبر جوجل
                </Button>

                {/* تذييل التبديل */}
                <p className="text-center text-sm text-gray-500 mt-6">
                  {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                  <button
                    type="button"
                    onClick={() => switchMode(!isLogin)}
                    className="text-purple-600 hover:text-purple-800 font-bold mr-1 transition-colors"
                  >
                    {isLogin ? 'إنشاء حساب' : 'تسجيل الدخول'}
                  </button>
                </p>
              </div>
              
              <p className="text-center text-xs text-gray-400 mt-4 select-none">الحقوق محفوظة لدى أثير © ٢٠٢٦</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}