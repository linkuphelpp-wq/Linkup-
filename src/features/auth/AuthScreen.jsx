import { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Users, MessageCircle, CheckCircle2 } from 'lucide-react';
import { auth, db } from '../../firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAppLock } from '../../context/AppLockContext';

// ───────── مكونات مخصصة (بدون مكتبات خارجية) ─────────
const Input = ({ className, ...props }) => (
  <input
    className={`w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all ${className}`}
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

// ───────── مكون الشاشة الرئيسي ─────────
export default function AuthScreen({ onLogin, onForgotPassword }) {
  const { startAuthentication, finishAuthentication } = useAppLock();

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
  const logoRef = useRef(null);

  // ✅ دوال الحماية من هجمات التخمين (Brute Force Protection)
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 دقائق بالميلي ثانية

  const getLockoutData = () => {
    try {
      const data = localStorage.getItem('auth_lockout');
      return data ? JSON.parse(data) : { attempts: 0, lockUntil: null };
    } catch {
      return { attempts: 0, lockUntil: null };
    }
  };

  const setLockoutData = (attempts, lockUntil) => {
    localStorage.setItem('auth_lockout', JSON.stringify({ attempts, lockUntil }));
  };

  const resetLockout = () => {
    localStorage.removeItem('auth_lockout');
  };

  const isLockedOut = () => {
    const { lockUntil } = getLockoutData();
    if (lockUntil && Date.now() < lockUntil) {
      return true;
    }
    if (lockUntil && Date.now() >= lockUntil) {
      resetLockout();
      return false;
    }
    return false;
  };

  const recordFailedAttempt = () => {
    const data = getLockoutData();
    const newAttempts = data.attempts + 1;
    
    if (newAttempts >= MAX_ATTEMPTS) {
      setLockoutData(0, Date.now() + LOCKOUT_DURATION);
    } else {
      setLockoutData(newAttempts, null);
    }
  };

  const [lockedOut, setLockedOut] = useState(isLockedOut());
  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    let timer;
    if (lockedOut) {
      const updateTimer = () => {
        const { lockUntil } = getLockoutData();
        if (lockUntil) {
          const remaining = Math.max(0, lockUntil - Date.now());
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          setRemainingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          
          if (remaining <= 0) {
            setLockedOut(false);
            resetLockout();
          }
        }
      };
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(timer);
  }, [lockedOut]);

  // ✅ التقاط نتيجة تسجيل الدخول بعد العودة من Google
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
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
          onLogin?.(user);
        }
      } catch (err) {
        console.error('Redirect sign-in error:', err);
        setError('فشل تسجيل الدخول عبر جوجل. حاول مرة أخرى.');
      } finally {
        finishAuthentication();
      }
    };
    checkRedirectResult();
  }, []);

  const handleLogoClick = (e) => {
    if (!logoRef.current) return;
    const rect = logoRef.current.getBoundingClientRect();
    const id = Date.now();
    setRipples(p => [...p, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    setIsLogoPressed(true);
    setTimeout(() => { setRipples(p => p.filter(r => r.id !== id)); setIsLogoPressed(false); }, 800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');

    // ✅ تحقق من الحظر أولاً
    if (isLockedOut()) {
      setError('تم حظر تسجيل الدخول مؤقتاً بسبب محاولات كثيرة. حاول مجدداً بعد 5 دقائق.');
      setLockedOut(true);
      return;
    }

    if (!email || !password) return setError('يرجى ملء جميع الحقول');
    if (!isLogin && password !== confirmPassword) return setError('كلمتا المرور غير متطابقتين');
    if (!isLogin && password.length < 6) return setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
    setLoading(true);
    try {
      const { user } = isLogin
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      resetLockout(); // ✅ نجحت العملية، امسح أي حظر سابق
      setLockedOut(false);
      
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
        onLogin?.(user);
      }
    } catch (err) {
      console.error(err);
      recordFailedAttempt(); // ✅ سجل محاولة فاشلة
      
      if (isLockedOut()) {
        setLockedOut(true);
        setError('تم حظر تسجيل الدخول مؤقتاً بسبب محاولات كثيرة. حاول مجدداً بعد 5 دقائق.');
      } else {
        const remaining = MAX_ATTEMPTS - getLockoutData().attempts;
        const baseError = ['auth/invalid-credential','auth/wrong-password'].includes(err.code) ? 'البريد أو كلمة المرور غير صحيحة' :
               err.code === 'auth/user-not-found' ? 'لا يوجد حساب بهذا البريد' :
               err.code === 'auth/email-already-in-use' ? 'هذا البريد مسجل مسبقاً' :
               err.code === 'auth/weak-password' ? 'كلمة المرور ضعيفة (6 أحرف على الأقل)' :
               'حدث خطأ. تحقق من اتصالك وحاول مرة أخرى.';
        setError(`${baseError} (${remaining} محاولات متبقية)`);
      }
    } finally { setLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true); setError('');
    try {
      startAuthentication(); // ✅ منع قفل التطبيق أثناء المصادقة
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      // لن يتم تنفيذ الكود التالي مباشرة، بل عند العودة من التحويل
    } catch (err) {
      setError('فشل تسجيل الدخول عبر جوجل. حاول مرة أخرى.');
      finishAuthentication();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] relative overflow-hidden selection:bg-purple-500/30" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/50 via-indigo-950/50 to-blue-950/50" />
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => <div key={i} className="absolute rounded-full bg-white/5 animate-float" style={{ width: Math.random()*3+1, height: Math.random()*3+1, left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDelay: `${Math.random()*5}s`, animationDuration: `${Math.random()*10+10}s` }} />)}
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-[2.5rem]" />
            
            <div ref={logoRef} onClick={handleLogoClick} className="relative flex flex-col items-center mb-8 cursor-pointer select-none group/logo">
              <div className={`absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl blur-2xl transition-all duration-500 ${isLogoPressed ? 'opacity-40 scale-110' : 'opacity-0 group-hover/logo:opacity-20 group-hover/logo:scale-105'}`} />
              <div className={`relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-xl transition-all duration-300 ${isLogoPressed ? 'scale-90 rotate-3' : 'group-hover/logo:scale-105 group-hover/logo:rotate-1'}`}>
                <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover/logo:border-white/40 transition-colors duration-300" />
                <MessageCircle className={`w-9 h-9 text-white transition-transform duration-300 ${isLogoPressed ? 'scale-110' : ''}`} />
                {ripples.map(r => <span key={r.id} className="absolute w-3 h-3 bg-white/50 rounded-full animate-ripple" style={{ left: r.x, top: r.y, transform: 'translate(-50%, -50%)' }} />)}
              </div>
              <h1 className="mt-4 text-3xl font-black text-white tracking-tight transition-all duration-500 group-hover/logo:tracking-[0.15em]">Link<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Up</span></h1>
            </div>

            <div className="relative flex bg-white/5 rounded-2xl p-1.5 mb-6 border border-white/10">
              <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg transition-all duration-300 ease-out ${!isLogin ? 'left-1.5' : 'left-[calc(50%+3px)]'}`} />
              <button type="button" onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }} className={`relative z-10 flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${isLogin ? 'text-white' : 'text-gray-400 hover:text-white'}`}>تسجيل الدخول</button>
              <button type="button" onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }} className={`relative z-10 flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${!isLogin ? 'text-white' : 'text-gray-400 hover:text-white'}`}>إنشاء حساب</button>
            </div>

            {/* ✅ رسالة الحظر المؤقت */}
            {lockedOut && (
              <div className="bg-red-500/10 border border-red-400/20 text-red-200 text-sm p-3 rounded-xl flex flex-col items-center gap-1 mb-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 font-bold">
                  <Shield className="w-4 h-4 shrink-0"/> تم تعطيل تسجيل الدخول مؤقتاً
                </div>
                <span>حاول مجدداً بعد {remainingTime} دقيقة</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group/input">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-purple-400 transition-colors" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="h-14 pr-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-purple-400/50 focus-visible:border-purple-400/50 transition-all hover:bg-white/10 focus:bg-white/10" required disabled={lockedOut || loading} />              </div>
              
              <div className="relative group/input">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-purple-400 transition-colors" />
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" className="h-14 pr-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-purple-400/50 focus-visible:border-purple-400/50 transition-all hover:bg-white/10 focus:bg-white/10" required disabled={lockedOut || loading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1 active:scale-90" disabled={lockedOut || loading}>{showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}</button>
              </div>

              {!isLogin && <div className="relative group/input">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-purple-400 transition-colors" />
                <Input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="تأكيد كلمة المرور" className="h-14 pr-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-purple-400/50 focus-visible:border-purple-400/50 transition-all hover:bg-white/10 focus:bg-white/10" required disabled={lockedOut || loading} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1 active:scale-90" disabled={lockedOut || loading}>{showConfirm ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}</button>
              </div>}

              {isLogin && <button type="button" onClick={onForgotPassword} className="text-xs text-purple-300 hover:text-purple-100 font-medium text-left transition-all hover:underline active:scale-95 origin-left" disabled={lockedOut || loading}>نسيت كلمة المرور؟</button>}
              
              {error && <div className="bg-red-500/10 border border-red-400/20 text-red-200 text-sm p-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2"><Shield className="w-4 h-4 shrink-0"/>{error}</div>}
              {success && <div className="bg-emerald-500/10 border border-emerald-400/20 text-emerald-200 text-sm p-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2"><CheckCircle2 className="w-4 h-4 shrink-0"/>{success}</div>}
              
              <Button type="submit" disabled={lockedOut || loading} className="w-full h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white rounded-xl font-bold text-base shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group/btn">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}<ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"/></>}
              </Button>
            </form>

            <div className="flex items-center gap-4 my-6"><div className="flex-1 h-px bg-white/10"/><span className="text-xs text-gray-500 font-medium">أو</span><div className="flex-1 h-px bg-white/10"/></div>
            
            <Button type="button" onClick={handleGoogleSignIn} disabled={lockedOut || loading} className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-base transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group/google">
              <svg className="w-5 h-5 group-hover/google:rotate-12 transition-transform" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              المتابعة عبر جوجل
            </Button>

            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
              <div className="flex flex-col items-center text-center group/feat cursor-pointer">
                <div className="p-2.5 rounded-xl bg-purple-500/10 group-hover/feat:bg-purple-500/20 transition-all duration-300 group-hover/feat:scale-110 group-active/feat:scale-95"><Shield className="w-5 h-5 text-purple-300 group-hover/feat:text-purple-200 transition-colors"/></div>
                <span className="text-[10px] text-gray-500 mt-1.5 font-medium group-hover/feat:text-white transition-colors">آمن ومشفر</span>
              </div>
              <div className="flex flex-col items-center text-center group/feat cursor-pointer">
                <div className="p-2.5 rounded-xl bg-blue-500/10 group-hover/feat:bg-blue-500/20 transition-all duration-300 group-hover/feat:scale-110 group-active/feat:scale-95"><Users className="w-5 h-5 text-blue-300 group-hover/feat:text-blue-200 transition-colors"/></div>
                <span className="text-[10px] text-gray-500 mt-1.5 font-medium group-hover/feat:text-white transition-colors">مجتمع تفاعلي</span>
              </div>
              <div className="flex flex-col items-center text-center group/feat cursor-pointer">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 group-hover/feat:bg-indigo-500/20 transition-all duration-300 group-hover/feat:scale-110 group-active/feat:scale-95"><Sparkles className="w-5 h-5 text-indigo-300 group-hover/feat:text-indigo-200 transition-colors"/></div>
                <span className="text-[10px] text-gray-500 mt-1.5 font-medium group-hover/feat:text-white transition-colors">تجربة عصرية</span>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500/80 mt-6 font-medium tracking-wide select-none">الحقوق محفوظة لدى أثير © ٢٠٦</p>
        </div>
      </div>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0) rotate(0);opacity:.3}50%{transform:translateY(-15px) rotate(5deg);opacity:.6}}
        .animate-float{animation:float linear infinite}
        @keyframes ripple{0%{transform:translate(-50%,-50%) scale(.5);opacity:.8}100%{transform:translate(-50%,-50%) scale(6);opacity:0}}
        .animate-ripple{animation:ripple .7s cubic-bezier(0,0,.2,1) forwards}
        @keyframes fade-in{0%{opacity:0}100%{opacity:1}}
        .animate-in.fade-in{animation:fade-in .5s ease-out forwards}
        @keyframes zoom-in-95{0%{transform:scale(0.95)}100%{transform:scale(1)}}
        .animate-in.zoom-in-95{animation:zoom-in-95 .5s ease-out forwards}
        @keyframes slide-in-from-top-2{0%{transform:translateY(-0.5rem)}100%{transform:translateY(0)}}
        .animate-in.slide-in-from-top-2{animation:slide-in-from-top-2 .3s ease-out forwards}
      `}</style>
    </div>
  );
}