import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Palette, Mic, Speaker, Lock, RefreshCw,
  MessageCircle, Share2, Sparkles, Check, Crown,
  AlertTriangle, X, TabletSmartphone, User, ChevronRight, Zap, ChevronLeft
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, getDocs, writeBatch, doc, deleteDoc } from 'firebase/firestore';

// ───────── بطاقة الإعداد المحسّنة (تصميم عصري) ─────────
const SettingRow = ({ icon: Icon, label, desc, onClick, toggle, isToggled, onToggle, color = 'purple' }) => {
  const colorsMap = {
    purple: 'from-purple-500 to-indigo-500 bg-purple-50 text-purple-600',
    blue: 'from-blue-500 to-cyan-500 bg-blue-50 text-blue-600',
    green: 'from-emerald-500 to-teal-500 bg-emerald-50 text-emerald-600',
    orange: 'from-orange-500 to-red-500 bg-orange-50 text-orange-600',
    pink: 'from-pink-500 to-rose-500 bg-pink-50 text-pink-600',
  };
  const colorSet = colorsMap[color] || colorsMap.purple;
  const [gradientFrom, gradientTo, bgColor, textColor] = colorSet.split(' ');

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.97 }}
      onClick={toggle ? undefined : onClick}
      className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100/80 cursor-pointer transition-all shadow-sm hover:shadow-lg p-4"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-transparent to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500" />
      <div className="relative flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white shadow-md group-hover:shadow-lg transition-all group-hover:scale-110`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 text-right">
          <p className="text-sm font-bold text-gray-800">{label}</p>
          {desc && <p className="text-xs text-gray-500 mt-0.5 truncate">{desc}</p>}
        </div>
        {toggle ? (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 shrink-0 ${isToggled ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-md' : 'bg-gray-300'}`}
          >
            <motion.span
              animate={{ x: isToggled ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
            />
          </button>
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
        )}
      </div>
    </motion.div>
  );
};

// ───────── مكون النافذة المنبثقة العصري ─────────
const SimpleModal = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ───────── القسم الواحد (مع حركة ظهور محسّنة) ─────────
const Section = ({ title, children, delay = 0, icon: Icon }) => (
  <motion.section
    initial={{ opacity: 0, x: -30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay, type: 'spring', stiffness: 200, damping: 18 }}
    className="space-y-4"
  >
    <div className="flex items-center gap-3 px-1 mb-2">
      {Icon && <Icon className="w-5 h-5 text-purple-500" />}
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
    </div>
    <div className="space-y-3">{children}</div>
  </motion.section>
);

// ───────── المكون الرئيسي (شاشة الإعدادات النهائية) ─────────
export default function SettingsScreen({
  onOpenAtheer, onOpenAbout, onOpenPrivacy, onOpenDataManagement, onOpenAppLock, onOpenProfile,
  onOpenSupport, muteMicOnJoin, speakerDefault, onToggleMuteMic, onToggleSpeaker,
  fontSize, fontFamily, onSelectFontSize, onSelectFontFamily, isAdmin, onOpenAdmin, onOpenPartner
}) {
  const [showFontModal, setShowFontModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetText, setResetText] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('compactMode') === 'true');

  useEffect(() => {
    localStorage.setItem('compactMode', compactMode);
    if (compactMode) {
      document.documentElement.style.fontSize = '14px';
    } else {
      document.documentElement.style.fontSize = '';
    }
  }, [compactMode]);

  const sizes = [
    { v: 'small', l: 'صغير' },
    { v: 'medium', l: 'متوسط' },
    { v: 'large', l: 'كبير' },
    { v: 'xlarge', l: 'كبير جداً' }
  ];

  const fonts = [
    { v: 'tajawal', l: 'Tajawal', desc: 'الافتراضي' },
    { v: 'cairo', l: 'Cairo', desc: 'واضح' },
    { v: 'rubik', l: 'Rubik', desc: 'ناعم' },
    { v: 'ibm-plex', l: 'IBM Plex', desc: 'مميز', featured: true }
  ];

  const handleResetApp = async () => {
    if (resetText.trim() !== 'حذف') return;
    setResetLoading(true);
    try {
      if (!auth?.currentUser?.uid || !db) throw new Error('فشل المصادقة');
      const batch = writeBatch(db);
      const chatsSnap = await getDocs(query(collection(db, 'chats'), where('participants', 'array-contains', auth.currentUser.uid)));
      chatsSnap.forEach(d => batch.delete(doc(db, 'chats', d.id)));
      await batch.commit();
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('تعذر إعادة الضبط. تأكد من اتصالك أو سجّل الدخول مجدداً.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-24">
      {/* 🔥 الشريط العلوي الموحد: زر العودة + العنوان + زر الدرع للمشرف */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b border-gray-200/40 px-5 pt-14 pb-4 text-center shadow-sm"
      >
        <div className="flex items-center justify-between">
          {/* زر العودة */}
          <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          {/* العنوان في المنتصف */}
          <h1 className="text-2xl font-black text-gray-800 tracking-tight flex-1">الإعدادات</h1>

          {/* زر الدرع للمشرف فقط */}
          {isAdmin ? (
            <button onClick={onOpenAdmin} className="p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700">
              <Shield className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-10" /> // حشو للمحافظة على التمركز
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">تحكم كامل في تطبيقك كما تحب</p>
      </motion.div>

      {/* المحتوى الرئيسي مع أقسام متحركة */}
      <div className="px-4 py-6 space-y-8 max-w-lg mx-auto">
        <Section title="الحساب" delay={0.1} icon={User}>
          <SettingRow icon={User} label="الملف الشخصي" desc="تعديل اسمك وصورتك" onClick={onOpenProfile} color="purple" />
        </Section>

        <Section title="المظهر" delay={0.2} icon={Palette}>
          <SettingRow icon={Palette} label="حجم الخط" desc={sizes.find(s => s.v === fontSize)?.l} onClick={() => setShowSizeModal(true)} color="blue" />
          <SettingRow icon={Palette} label="نوع الخط" desc={fonts.find(f => f.v === fontFamily)?.l} onClick={() => setShowFontModal(true)} color="blue" />
          <SettingRow icon={TabletSmartphone} label="تصغير الأبعاد" desc="مناسب للشاشات الصغيرة" toggle isToggled={compactMode} onToggle={() => setCompactMode(!compactMode)} color="green" />
        </Section>

        <Section title="المكالمات" delay={0.3} icon={Mic}>
          <SettingRow icon={Mic} label="كتم الميكروفون تلقائياً" toggle isToggled={muteMicOnJoin} onToggle={onToggleMuteMic} color="orange" />
          <SettingRow icon={Speaker} label="مكبر الصوت افتراضياً" toggle isToggled={speakerDefault} onToggle={onToggleSpeaker} color="orange" />
        </Section>

        <Section title="الخصوصية والأمان" delay={0.4} icon={Lock}>
          <SettingRow icon={Lock} label="قفل التطبيق" desc="حماية إضافية برمز سري" onClick={onOpenAppLock} color="pink" />
          <SettingRow icon={Shield} label="إدارة البيانات" desc="التحكم في تخزين بياناتك" onClick={onOpenDataManagement} color="pink" />
          <SettingRow icon={RefreshCw} label="إعادة ضبط التطبيق" desc="مسح جميع المحادثات والبيانات" onClick={() => setShowResetModal(true)} color="pink" />
        </Section>

        <Section title="المزيد" delay={0.5} icon={Sparkles}>
          <SettingRow icon={MessageCircle} label="تواصل مع المطور" desc="ملاحظات، اقتراحات، أو مشاكل" onClick={onOpenSupport} color="purple" />
          <SettingRow icon={Share2} label="شارك التطبيق" desc="دع أصدقاءك ينضمون" onClick={() => navigator.share?.({ title: 'LinkUp', url: window.location.origin }).catch(() => {})} color="blue" />
          <SettingRow icon={Sparkles} label="تكوين شراكة" desc="انضم كشريك رسمي" onClick={onOpenPartner} color="green" />
          {isAdmin && <SettingRow icon={Shield} label="لوحة الإدارة" desc="إدارة المستخدمين والمحتوى" onClick={onOpenAdmin} color="orange" />}
        </Section>

        {/* بطاقات الإجراءات السريعة بتصميم محسّن */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 200, damping: 20 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: 'من هو أثير؟', onClick: onOpenAtheer, gradient: 'from-purple-500 to-indigo-500' },
            { label: 'من نحن', onClick: onOpenAbout, gradient: 'from-blue-500 to-cyan-500' },
            { label: 'الخصوصية', onClick: onOpenPrivacy, gradient: 'from-gray-500 to-gray-600' },
          ].map((item) => (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.93 }}
              onClick={item.onClick}
              className="relative overflow-hidden rounded-2xl p-3 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <span className="relative text-xs font-bold text-gray-700 group-hover:text-purple-700 transition-colors">{item.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* نوافذ منبثقة محسّنة */}
      <SimpleModal open={showSizeModal} onClose={() => setShowSizeModal(false)} title="حجم الخط">
        <div className="space-y-2">
          {sizes.map(s => (
            <motion.button
              key={s.v}
              whileHover={{ scale: 1.02, backgroundColor: '#f5f3ff' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { onSelectFontSize?.(s.v); setShowSizeModal(false); }}
              className={`w-full p-4 rounded-xl text-right text-sm font-bold flex items-center justify-between transition-all ${
                fontSize === s.v 
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300 shadow-md' 
                  : 'bg-gray-50 text-gray-700 hover:bg-purple-50'
              }`}
            >
              {s.l}
              {fontSize === s.v && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-purple-500 text-white rounded-full p-1">
                  <Check className="w-4 h-4" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </SimpleModal>

      <SimpleModal open={showFontModal} onClose={() => setShowFontModal(false)} title="نوع الخط">
        <div className="space-y-2">
          {fonts.map(f => (
            <motion.button
              key={f.v}
              whileHover={{ scale: 1.02, backgroundColor: '#f5f3ff' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { onSelectFontFamily?.(f.v); setShowFontModal(false); }}
              className={`w-full p-4 rounded-xl text-right text-sm font-bold flex items-center justify-between transition-all ${
                fontFamily === f.v 
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300 shadow-md' 
                  : 'bg-gray-50 text-gray-700 hover:bg-purple-50'
              }`}
            >
              <span className="flex items-center gap-2">
                {f.l}
                {f.featured && <Crown className="w-4 h-4 text-yellow-500" />}
              </span>
              {fontFamily === f.v && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-purple-500 text-white rounded-full p-1">
                  <Check className="w-4 h-4" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </SimpleModal>

      <SimpleModal open={showResetModal} onClose={() => setShowResetModal(false)} title="تأكيد إعادة الضبط">
        <div className="space-y-5">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              هذا الإجراء لا يمكن التراجع عنه. اكتب كلمة <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">"حذف"</span> للتأكيد
            </p>
          </div>
          <input
            value={resetText}
            onChange={e => setResetText(e.target.value)}
            placeholder="اكتب كلمة حذف هنا..."
            className="w-full h-12 px-4 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 text-center text-lg font-medium"
            autoFocus
          />
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowResetModal(false)}
              className="flex-1 h-11 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 font-medium transition-all"
            >
              إلغاء
            </motion.button>
            <motion.button
              whileTap={resetText.trim() === 'حذف' ? { scale: 0.9 } : {}}
              onClick={handleResetApp}
              disabled={resetText.trim() !== 'حذف' || resetLoading}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-red-200 transition-all"
            >
              {resetLoading ? 'جارٍ...' : 'تأكيد الحذف'}
            </motion.button>
          </div>
        </div>
      </SimpleModal>
    </div>
  );
}