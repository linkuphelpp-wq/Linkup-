import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, AtSign, ArrowRight, Check, Loader2, Shield, Sparkles } from 'lucide-react';
import { db } from '../../../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '../../../context/LanguageContext'; // في حال أردت دعم الترجمة لاحقاً

export default function WorldAuthScreen({ currentUser, onSuccess, onBack }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [worldUserExists, setWorldUserExists] = useState(false);

  // التحقق من وجود حساب عالم للمستخدم الحالي
  useEffect(() => {
    if (!currentUser?.uid) {
      setChecking(false);
      return;
    }
    const checkWorldUser = async () => {
      try {
        const snap = await getDoc(doc(db, 'world_users', currentUser.uid));
        if (snap.exists()) {
          setWorldUserExists(true);
          // المستخدم موجود بالفعل، انتقل مباشرة إلى الشاشة الرئيسية
          onSuccess?.(snap.data());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setChecking(false);
      }
    };
    checkWorldUser();
  }, [currentUser, onSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = username.trim().toLowerCase();

    if (!trimmed) {
      setError('يرجى إدخال معرف');
      return;
    }
    if (trimmed.length < 3 || trimmed.length > 20) {
      setError('المعرف يجب أن يكون بين 3 و 20 حرفاً');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError('المعرف يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطة سفلية فقط');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // التحقق من عدم وجود المعرف من قبل
      const existingQuery = await getDoc(doc(db, 'usernames', `world_${trimmed}`));
      if (existingQuery.exists()) {
        setError('هذا المعرف محجوز، اختر معرفاً آخر');
        setLoading(false);
        return;
      }

      // بناء بيانات المستخدم العالمية
      const worldUserData = {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'مستخدم',
        photoURL: currentUser.photoURL || '',
        username: trimmed,
        followers: [],
        following: [],
        createdAt: serverTimestamp(),
        bio: '',
      };

      // حفظ في world_users وحجز المعرف
      await setDoc(doc(db, 'world_users', currentUser.uid), worldUserData);
      await setDoc(doc(db, 'usernames', `world_${trimmed}`), { uid: currentUser.uid, createdAt: serverTimestamp() });

      onSuccess?.(worldUserData);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ، حاول مرة أخرى لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (worldUserExists) return null; // سينتقل فوراً بسبب useEffect

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden" dir="rtl">
      {/* تأثيرات خلفية */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 bg-purple-200 rounded-full blur-[100px] opacity-30 animate-pulse" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-200 rounded-full blur-[100px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* رأس الصفحة */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-5 pt-12 pb-4 shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95">
              <ArrowRight className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-purple-500" />
              <h1 className="text-xl font-black text-gray-900">العالم</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">اختر معرفاً لتبدأ رحلتك في العالم</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
            {/* أيقونة وشعار */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-800">مرحباً بك في العالم</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                أنت على بُعد خطوة من الانضمام إلى المجتمع العالمي. اختر معرفك الذي سيراك العالم به.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">المعرف</label>
                <div className="relative">
                  <AtSign className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    value={username}
                    onChange={e => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                      setUsername(val);
                      setError('');
                    }}
                    placeholder="مثال: atheer_world"
                    className="w-full h-14 pr-12 pl-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all text-lg"
                    maxLength={20}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">يمكنك استخدام الأحرف الإنجليزية، الأرقام، والشرطة السفلية ( _ ) فقط. من 3 إلى 20 حرفاً.</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white rounded-xl font-bold text-base shadow-lg shadow-purple-200/50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    انضم إلى العالم
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* نصائح أمان */}
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-1">معلومات مهمة</p>
                  <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                    <li>معرفك هو ما سيراك به الآخرون في العالم.</li>
                    <li>لا يمكن تغيير المعرف لاحقاً، فاختر بحكمة.</li>
                    <li>بريدك الإلكتروني وبياناتك الخاصة لن تظهر لأي شخص.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}