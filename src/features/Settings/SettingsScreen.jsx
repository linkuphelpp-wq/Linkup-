import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Palette, Mic, Speaker, Lock, RefreshCw,
  MessageCircle, Share2, Sparkles, ChevronRight, Check, Crown,
  AlertTriangle, X, TabletSmartphone, User, ChevronLeft
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, getDocs, writeBatch, doc, deleteDoc } from 'firebase/firestore';

// ───────── مكون السطر الأمثل ─────────
const SettingRow = ({ icon: Icon, label, desc, onClick, toggle, isToggled, onToggle }) => (
  <motion.div
    whileHover={{ scale: 1.01, backgroundColor: '#f9fafb' }}
    whileTap={{ scale: 0.98 }}
    onClick={toggle ? undefined : onClick}
    className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100/80 shadow-sm cursor-pointer transition-all group"
  >
    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0 group-hover:bg-purple-100 transition-colors">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0 text-right">
      <p className="text-sm font-bold text-gray-900">{label}</p>
      {desc && <p className="text-xs text-gray-500 mt-0.5 truncate">{desc}</p>}
    </div>
    {toggle ? (
      <button
        onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
        className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${isToggled ? 'bg-purple-600' : 'bg-gray-300'}`}
      >
        <motion.span
          animate={{ x: isToggled ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
        />
      </button>
    ) : (
      <ChevronLeft className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-purple-500 transition-colors" />
    )}
  </motion.div>
);

// ───────── مكون النافذة المنبثقة المحسّن ─────────
const SimpleModal = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ───────── القسم الواحد (مع حركة ظهور) ─────────
const Section = ({ title, children, delay = 0 }) => (
  <motion.section
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, type: 'spring', stiffness: 200, damping: 20 }}
    className="space-y-3"
  >
    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">{title}</h3>
    {children}
  </motion.section>
);

// ───────── المكون الرئيسي (شاشة الإعدادات الجديدة) ─────────
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
      document.documentElement.classList.add('compact-ui');
    } else {
      document.documentElement.classList.remove('compact-ui');
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* هيدر عصري مع تأثير زجاجي */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-gray-200/60 px-5 pt-16 pb-4 text-center"
      >
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          خصّص <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">تجربتك</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">تحكم كامل في تطبيقك كما تحب</p>
      </motion.div>

      {/* المحتوى الرئيسي (مقسّم لأقسام متحركة) */}
      <div className="px-5 py-6 space-y-8">
        <Section title="الحساب" delay={0.1}>
          <SettingRow icon={User} label="الملف الشخصي" desc="تعديل اسمك وصورتك" onClick={onOpenProfile} />
        </Section>

        <Section title="المظهر" delay={0.2}>
          <SettingRow icon={Palette} label="حجم الخط" desc={sizes.find(s => s.v === fontSize)?.l} onClick={() => setShowSizeModal(true)} />
          <SettingRow icon={Palette} label="نوع الخط" desc={fonts.find(f => f.v === fontFamily)?.l} onClick={() => setShowFontModal(true)} />
          <SettingRow icon={TabletSmartphone} label="تصغير الأبعاد" desc="مناسب للشاشات الصغيرة" toggle isToggled={compactMode} onToggle={() => setCompactMode(!compactMode)} />
        </Section>

        <Section title="المكالمات" delay={0.3}>
          <SettingRow icon={Mic} label="كتم الميكروفون تلقائياً" toggle isToggled={muteMicOnJoin} onToggle={onToggleMuteMic} />
          <SettingRow icon={Speaker} label="مكبر الصوت افتراضياً" toggle isToggled={speakerDefault} onToggle={onToggleSpeaker} />
        </Section>

        <Section title="الخصوصية والأمان" delay={0.4}>
          <SettingRow icon={Lock} label="قفل التطبيق" desc="حماية إضافية برمز سري" onClick={onOpenAppLock} />
          <SettingRow icon={Shield} label="إدارة البيانات" desc="التحكم في تخزين بياناتك" onClick={onOpenDataManagement} />
          <SettingRow icon={RefreshCw} label="إعادة ضبط التطبيق" desc="مسح جميع المحادثات والبيانات" onClick={() => setShowResetModal(true)} />
        </Section>

        <Section title="المزيد" delay={0.5}>
          <SettingRow icon={MessageCircle} label="تواصل مع المطور" desc="ملاحظات، اقتراحات، أو مشاكل" onClick={onOpenSupport} />
          <SettingRow icon={Share2} label="شارك التطبيق" desc="دع أصدقاءك ينضمون" onClick={() => navigator.share?.({ title: 'LinkUp', url: window.location.origin }).catch(() => {})} />
          <SettingRow icon={Sparkles} label="تكوين شراكة" desc="انضم كشريك رسمي" onClick={onOpenPartner} />
          {isAdmin && <SettingRow icon={Shield} label="لوحة الإدارة" desc="إدارة المستخدمين والمحتوى" onClick={onOpenAdmin} />}
        </Section>

        {/* بطاقات الإجراءات السريعة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
          className="grid grid-cols-3 gap-3 pt-2"
        >
          {[
            { label: 'من هو أثير؟', onClick: onOpenAtheer, color: 'purple' },
            { label: 'من نحن', onClick: onOpenAbout, color: 'blue' },
            { label: 'الخصوصية', onClick: onOpenPrivacy, color: 'gray' },
          ].map((item) => (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center p-3 rounded-xl shadow-sm border border-gray-100 bg-white hover:bg-gray-50 transition-all`}
            >
              <span className={`text-xs font-bold text-${item.color}-700`}>{item.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* نوافذ منبثقة (محسّنة) */}
      <SimpleModal open={showSizeModal} onClose={() => setShowSizeModal(false)} title="حجم الخط">
        <div className="space-y-2">
          {sizes.map(s => (
            <motion.button
              key={s.v}
              whileTap={{ scale: 0.97 }}
              onClick={() => { onSelectFontSize?.(s.v); setShowSizeModal(false); }}
              className={`w-full p-3 rounded-lg text-right text-sm font-bold flex items-center justify-between ${fontSize === s.v ? 'bg-purple-100 text-purple-700 border-2 border-purple-300' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
            >
              {s.l} {fontSize === s.v && <Check className="w-4 h-4" />}
            </motion.button>
          ))}
        </div>
      </SimpleModal>

      <SimpleModal open={showFontModal} onClose={() => setShowFontModal(false)} title="نوع الخط">
        <div className="space-y-2">
          {fonts.map(f => (
            <motion.button
              key={f.v}
              whileTap={{ scale: 0.97 }}
              onClick={() => { onSelectFontFamily?.(f.v); setShowFontModal(false); }}
              className={`w-full p-3 rounded-lg text-right text-sm font-bold flex items-center justify-between ${fontFamily === f.v ? 'bg-purple-100 text-purple-700 border-2 border-purple-300' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
            >
              <span className="flex items-center gap-2">{f.l} {f.featured && <Crown className="w-3 h-3 text-yellow-500" />}</span>
              {fontFamily === f.v && <Check className="w-4 h-4" />}
            </motion.button>
          ))}
        </div>
      </SimpleModal>

      <SimpleModal open={showResetModal} onClose={() => setShowResetModal(false)} title="تأكيد إعادة الضبط">
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <p className="text-sm text-gray-600 text-center">
              اكتب كلمة <span className="font-bold text-red-600">"حذف"</span> للتأكيد
            </p>
          </div>
          <input
            value={resetText}
            onChange={e => setResetText(e.target.value)}
            placeholder="اكتب هنا..."
            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-200 text-center text-lg"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={() => setShowResetModal(false)}
              className="flex-1 h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 font-medium transition-colors"
            >
              إلغاء
            </button>
            <motion.button
              whileTap={resetText.trim() === 'حذف' ? { scale: 0.95 } : {}}
              onClick={handleResetApp}
              disabled={resetText.trim() !== 'حذف' || resetLoading}
              className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-200 transition-all"
            >
              {resetLoading ? 'جارٍ...' : 'تأكيد'}
            </motion.button>
          </div>
        </div>
      </SimpleModal>
    </div>
  );
}