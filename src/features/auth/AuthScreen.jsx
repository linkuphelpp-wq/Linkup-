import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Users, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { auth, db } from '../../firebase/config';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification,
  signInWithPopup, GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const Input = ({ className, ...props }) => (
  <input 
    className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all ${className}`}
    {...props}
  />
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
  const [ripples, setRipples] = useState([]);
  const [isLogoPressed, setIsLogoPressed] = useState(false);
  const [exiting, setExiting] = useState(false);
  const logoRef = useRef(null);

  const handleLogoClick = (e) => {
    if (!logoRef.current) return;
    const rect = logoRef.current.getBoundingClientRect();
    const id = Date.now();
    setRipples(p => [...p, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    setIsLogoPressed(true);
    setTimeout(() => { setRipples(p => p.filter(r => r.id !== id)); setIsLogoPressed(false); }, 800);
  };

  const getErrorMessage = (err) => {
    switch (err.code) {
      case 'auth/email-already-in-use': return 'الحساب موجود بالفعل';
      case 'auth/invalid-credential':
      case 'auth/wrong-password': return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      case 'auth/user-not-found': return 'لا يوجد حساب بهذا البريد الإلكتروني';
      case 'auth/weak-password': return 'كلمة المرور ضعيفة جداً، يجب أن تكون 6 أحرف على الأقل';
      case 'auth/too-many-requests': return 'محاولات كثيرة، حاول مرة أخرى لاحقاً';
      case 'auth/invalid-email': return 'صيغة البريد الإلكتروني غير صالحة';
      default: return 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى';
    }
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
        setTimeout(() => {
          onLogin?.(user);
        }, 500);
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
      setTimeout(() => {
        onLogin?.(user);
      }, 500);
    } catch (err) { 
      console.error("خطأ تسجيل الدخول بجوجل:", err);
      if (err.code !== 'auth/cancelled-popup-request' && err.code !== 'auth/popup-closed-by-user') {
        if (err.code === 'auth/account-exists-with-different-credential') {
          setError('هذا البريد مسجل مسبقاً بطريقة دخول مختلفة');
        } else {
          setError('فشل تسجيل الدخول عبر جوجل، حاول مرة أخرى');
        }
      }
    } finally { 
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden selection:bg-purple-200/50" dir="rtl">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <AnimatePresence>
          {!exiting && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="w-full max-w-md"
            >
              <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-8 shadow-xl border border-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none rounded-[2.5rem]" />
                
                <div ref={logoRef} onClick={handleLogoClick} className="relative flex flex-col items-center mb-8 cursor-pointer select-none group/logo">
                  <div className={`absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-3xl blur-2xl transition-all duration-500 ${isLogoPressed ? 'opacity-30 scale-110' : 'opacity-0 group-hover/logo:opacity-20 group-hover/logo:scale-105'}`} />
                  <div className={`relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg transition-all duration-300 ${isLogoPressed ? 'scale-90 rotate-3' : 'group-hover/logo:scale-105 group-hover/logo:rotate-1'}`}>
                    <div className="absolute inset-0 rounded-2xl border border-white/30 group-hover/logo:border-white/50 transition-colors duration-300" />
                    <MessageCircle className="w-9 h-9 text-white drop-shadow-sm" />
                    {ripples.map(r => <span key={r.id} className="absolute w-3 h-3 bg-white/60 rounded-full animate-ripple" style={{ left: r.x, top: r.y, transform: 'translate(-50%, -50%)' }} />)}
                  </div>
                  <h1 className="mt-4 text-3xl font-black text-gray-800 tracking-tight">Link<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Up</span></h1>
                </div>

                <div className="relative flex bg-gray-100 rounded-2xl p-1.5 mb-6 border border-gray-200">
                  <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 shadow-md transition-all duration-300 ease-out ${!isLogin ? 'left-1.5' : 'left-[calc(50%+3px)]'}`} />
                  <button type="button" onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }} className={`relative z-10 flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}>تسجيل الدخول</button>
                  <button type="button" onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }} className={`relative z-10 flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${!isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}>إنشاء حساب</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative group/input">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-purple-500 transition-colors" />
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="h-14 pr-12" required disabled={loading} />
                  </div>
                  
                  <div className="relative group/input">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-purple-500 transition-colors" />
                    <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" className="h-14 pr-12" required disabled={loading} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 active:scale-90" disabled={loading}>{showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}</button>
                  </div>

                  {!isLogin && <div className="relative group/input">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-purple-500 transition-colors" />
                    <Input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="تأكيد كلمة المرور" className="h-14 pr-12" required disabled={loading} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 active:scale-90" disabled={loading}>{showConfirm ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}</button>
                  </div>}

                  {isLogin && <button type="button" onClick={onForgotPassword} className="text-xs text-purple-500 hover:text-purple-700 font-medium text-left transition-all hover:underline active:scale-95 origin-left" disabled={loading}>نسيت كلمة المرور؟</button>}
                  
                  {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2"><Shield className="w-4 h-4 shrink-0"/>{error}</div>}
                  {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm p-3 rounded-xl flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0"/>{success}</div>}
                  
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white rounded-xl font-bold text-base shadow-lg shadow-purple-200/50 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group/btn">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}<ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"/></>}
                  </Button>
                </form>

                <div className="flex items-center gap-4 my-6"><div className="flex-1 h-px bg-gray-200"/><span className="text-xs text-gray-400 font-medium">أو</span><div className="flex-1 h-px bg-gray-200"/></div>
                
                <Button type="button" onClick={handleGoogleSignIn} disabled={loading} className="w-full h-14 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-bold text-base transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group/google">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  المتابعة عبر جوجل
                </Button>

                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
                  <div className="flex flex-col items-center text-center group/feat cursor-pointer">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-500 group-hover/feat:bg-purple-100 transition-all duration-300"><Shield className="w-5 h-5" /></div>
                    <span className="text-[10px] text-gray-500 mt-1.5 font-medium">آمن ومشفر</span>
                  </div>
                  <div className="flex flex-col items-center text-center group/feat cursor-pointer">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500 group-hover/feat:bg-blue-100 transition-all duration-300"><Users className="w-5 h-5" /></div>
                    <span className="text-[10px] text-gray-500 mt-1.5 font-medium">مجتمع تفاعلي</span>
                  </div>
                  <div className="flex flex-col items-center text-center group/feat cursor-pointer">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-500 group-hover/feat:bg-indigo-100 transition-all duration-300"><Sparkles className="w-5 h-5" /></div>
                    <span className="text-[10px] text-gray-500 mt-1.5 font-medium">تجربة عصرية</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-6 font-medium tracking-wide select-none">الحقوق محفوظة لدى أثير © ٢٠٢٦</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0) rotate(0);opacity:.3}50%{transform:translateY(-15px) rotate(5deg);opacity:.6}}
        .animate-float{animation:float linear infinite}
        @keyframes ripple{0%{transform:translate(-50%,-50%) scale(.5);opacity:.8}100%{transform:translate(-50%,-50%) scale(6);opacity:0}}
        .animate-ripple{animation:ripple .7s cubic-bezier(0,0,.2,1) forwards}
      `}</style>
    </div>
  );
}