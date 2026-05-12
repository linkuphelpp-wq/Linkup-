
code = '''import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Palette, Mic, Speaker, Lock, RefreshCw,
  MessageCircle, Share2, Sparkles, Check, Crown,
  AlertTriangle, X, TabletSmartphone, User, ChevronRight, ArrowLeft, Globe,
  Zap, Type, ShieldCheck, Trash2, Volume2, HelpCircle
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';

/* ================================================================
   DESIGN SYSTEM
   ================================================================ */

const colorThemes = {
  purple: {
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    activeBg: 'bg-violet-600',
    text: 'text-violet-700',
  },
  blue: {
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    activeBg: 'bg-blue-600',
    text: 'text-blue-700',
  },
  emerald: {
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    activeBg: 'bg-emerald-600',
    text: 'text-emerald-700',
  },
  amber: {
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    activeBg: 'bg-amber-600',
    text: 'text-amber-700',
  },
  rose: {
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    activeBg: 'bg-rose-600',
    text: 'text-rose-700',
  },
  slate: {
    iconBg: 'bg-gradient-to-br from-slate-500 to-slate-700',
    activeBg: 'bg-slate-600',
    text: 'text-slate-700',
  },
};

/* ================================================================
   ANIMATION VARIANTS
   ================================================================ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 450, damping: 28 }
  }
};

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 450, damping: 32 }
  },
  exit: { opacity: 0, scale: 0.94, y: 30, transition: { duration: 0.18 } }
};

/* ================================================================
   SUB-COMPONENTS
   ================================================================ */

const IconWrapper = ({ icon: Icon, theme = 'purple', size = 'md' }) => {
  const sizeClasses = { sm: 'w-9 h-9', md: 'w-10 h-10', lg: 'w-11 h-11' };
  const iconSizes = { sm: 'w-[18px] h-[18px]', md: 'w-5 h-5', lg: 'w-6 h-6' };
  const themeSet = colorThemes[theme] || colorThemes.purple;

  return (
    <div className={`${sizeClasses[size]} ${themeSet.iconBg} rounded-xl flex items-center justify-center text-white shadow-md shrink-0`}>
      <Icon className={iconSizes[size]} strokeWidth={2} />
    </div>
  );
};

/*
  ═══════════════════════════════════════════════════════════════
  TOGGLE SWITCH — FIXED FOR RTL
  ═══════════════════════════════════════════════════════════════
  المشكلة: في RTL، framer-motion x يتعارض مع اتجاه الصفحة
  الحل: عزل التوجل بـ dir="ltr" داخليًا + أبعاد دقيقة
  
  أبعاد الحاوية:  52px × 28px
  أبعاد الدائرة:  22px × 22px
  الهامش العمودي: (28 - 22) / 2 = 3px
  الهامش الأفقي:  3px
  مسار الحركة:    52 - 3 - 22 - 3 = 24px
  
  مغلق:  left = 3px,  x = 0  → الدائرة على اليسار
  مفتوح: left = 3px,  x = 24 → الدائرة على اليمين
  ═══════════════════════════════════════════════════════════════
*/
const ToggleSwitch = ({ isToggled, onToggle, theme = 'purple', disabled = false }) => {
  const themeSet = colorThemes[theme] || colorThemes.purple;

  return (
    <button
      dir="ltr"
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
      disabled={disabled}
      className={`
        relative w-[52px] h-7 rounded-full shrink-0 overflow-hidden
        transition-colors duration-300 ease-out
        ${isToggled ? themeSet.activeBg : 'bg-stone-300'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
      `}
      aria-label={isToggled ? 'تفعيل' : 'إيقاف'}
      aria-pressed={isToggled}
    >
      <motion.span
        initial={false}
        animate={{ x: isToggled ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute left-[3px] top-[3px] block w-[22px] h-[22px] bg-white rounded-full shadow-sm"
      />
    </button>
  );
};

const SettingRow = ({
  icon: Icon,
  label,
  desc,
  onClick,
  toggle,
  isToggled,
  onToggle,
  theme = 'purple',
  badge,
  disabled = false,
}) => {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={disabled ? {} : { y: -2, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.08)' }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={disabled ? undefined : onClick}
      className={`
        group relative overflow-hidden rounded-2xl bg-white border border-stone-200/80 
        transition-all duration-300 p-4
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-stone-300 shadow-sm hover:shadow-md'}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-stone-50/60 group-hover:to-stone-100/30 transition-all duration-500" />
      <div className="relative flex items-center gap-3.5">
        <IconWrapper icon={Icon} theme={theme} />
        <div className="flex-1 min-w-0 text-right">
          <div className="flex items-center gap-2 justify-end flex-wrap">
            <p className="text-[15px] font-bold text-stone-800">{label}</p>
            {badge && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                {badge}
              </span>
            )}
          </div>
          {desc && <p className="text-[13px] text-stone-500 mt-0.5 leading-relaxed">{desc}</p>}
        </div>
        {toggle ? (
          <ToggleSwitch isToggled={isToggled} onToggle={onToggle} theme={theme} disabled={disabled} />
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            {disabled && <span className="text-[11px] text-stone-400 font-medium">قريباً</span>}
            <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-stone-600 group-hover:-translate-x-1 transition-all duration-300" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const SectionHeader = ({ title, icon: Icon }) => (
  <motion.div variants={itemVariants} className="flex items-center gap-3 px-1 mb-3 mt-1">
    {Icon && (
      <div className="p-1.5 rounded-lg bg-stone-100 text-stone-500">
        <Icon className="w-4 h-4" strokeWidth={2.5} />
      </div>
    )}
    <h3 className="text-[11px] font-extrabold text-stone-500 uppercase tracking-[0.15em]">{title}</h3>
    <div className="flex-1 h-px bg-stone-200/60" />
  </motion.div>
);

const SimpleModal = ({ open, onClose, title, children, maxWidth = 'sm', icon: Icon }) => {
  const maxWidthClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={modalOverlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/25 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`bg-white rounded-[28px] w-full ${maxWidthClasses[maxWidth]} shadow-2xl shadow-stone-900/8 border border-stone-100 overflow-hidden`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="p-2 rounded-xl bg-stone-100 text-stone-600">
                    <Icon className="w-5 h-5" />
                  </div>
                )}
                <h3 className="text-lg font-bold text-stone-800">{title}</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: '#fef2f2' }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SelectionItem = ({ label, desc, isSelected, onClick, icon, featured }) => (
  <motion.button
    whileHover={{ scale: 1.01, backgroundColor: isSelected ? '#f5f3ff' : '#fafaf9' }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`w-full p-4 rounded-2xl text-right flex items-center justify-between transition-all duration-200 border-2 ${
      isSelected
        ? 'bg-violet-50 border-violet-300 shadow-md shadow-violet-100'
        : 'bg-stone-50 border-transparent hover:border-stone-200'
    }`}
  >
    <div className="flex items-center gap-3">
      {isSelected ? (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="bg-violet-600 text-white rounded-full p-1 shadow-md shadow-violet-300"
        >
          <Check className="w-4 h-4" strokeWidth={3} />
        </motion.div>
      ) : (
        <div className="w-6 h-6 rounded-full border-2 border-stone-300 shrink-0" />
      )}
      <div className="text-right">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${isSelected ? 'text-violet-800' : 'text-stone-700'}`}>{label}</span>
          {featured && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
              <Crown className="w-3 h-3" /> مميز
            </span>
          )}
        </div>
        {desc && <p className="text-xs text-stone-500 mt-0.5">{desc}</p>}
      </div>
    </div>
    {icon && <span className="text-2xl shrink-0">{icon}</span>}
  </motion.button>
);

const DangerButton = ({ onClick, disabled, loading, children }) => (
  <motion.button
    whileTap={!disabled ? { scale: 0.96 } : {}}
    onClick={onClick}
    disabled={disabled || loading}
    className={`flex-1 h-12 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${
      disabled || loading
        ? 'bg-stone-300 cursor-not-allowed shadow-none'
        : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-200 hover:shadow-red-300'
    }`}
  >
    {loading ? (
      <span className="flex items-center justify-center gap-2">
        <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <RefreshCw className="w-4 h-4" />
        </motion.span>
        جارٍ المعالجة...
      </span>
    ) : children}
  </motion.button>
);

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export default function SettingsScreen({
  onOpenAtheer, onOpenAbout, onOpenPrivacy, onOpenDataManagement, onOpenAppLock, onOpenProfile,
  onOpenSupport, muteMicOnJoin, speakerDefault, onToggleMuteMic, onToggleSpeaker,
  fontSize, fontFamily, onSelectFontSize, onSelectFontFamily, isAdmin, onOpenAdmin, onOpenPartner, onBack
}) {
  const [showFontModal, setShowFontModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [resetText, setResetText] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('compactMode') === 'true');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    localStorage.setItem('compactMode', compactMode);
    document.documentElement.style.fontSize = compactMode ? '14px' : '';
  }, [compactMode]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sizes = [
    { v: 'small', l: 'صغير', desc: 'مريح للقراءة الطويلة' },
    { v: 'medium', l: 'متوسط', desc: 'الحجم الموصى به' },
    { v: 'large', l: 'كبير', desc: 'وضوح إضافي' },
    { v: 'xlarge', l: 'كبير جداً', desc: 'لضعف البصر' }
  ];

  const fonts = [
    { v: 'tajawal', l: 'Tajawal', desc: 'الخط الافتراضي الأنيق والمتناسق' },
    { v: 'cairo', l: 'Cairo', desc: 'خط عصري وواضح للقراءة' },
    { v: 'rubik', l: 'Rubik', desc: 'خط سميك ومقروء بشكل ممتاز' },
    { v: 'ibm-plex', l: 'IBM Plex Arabic', desc: 'خط احترافي للمطورين', featured: true }
  ];

  const languages = [
    { v: 'ar', l: 'العربية', flag: '🇸🇦', desc: 'الواجهة باللغة العربية' },
    { v: 'en', l: 'English', flag: '🇬🇧', desc: 'English interface' }
  ];

  const handleResetApp = useCallback(async () => {
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
  }, [resetText]);

  const headerOpacity = Math.min(scrollY / 80, 1);

  return (
    <div className="min-h-screen bg-stone-50 pb-32 text-right" dir="rtl">
      {/* Floating Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-30 transition-all duration-300"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${0.85 + headerOpacity * 0.1})`,
          backdropFilter: `blur(${12 + headerOpacity * 4}px)`,
          boxShadow: headerOpacity > 0.5 ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
        }}
      >
        <div className="max-w-lg mx-auto px-5 pt-12 pb-4 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-600 hover:text-stone-900 hover:border-stone-300 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="text-center">
            <h1 className="text-xl font-black text-stone-900 tracking-tight">الإعدادات</h1>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">تحكم كامل في تجربتك</p>
          </div>
          <div className="w-10" />
        </div>
      </motion.header>

      <div className="h-28" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 space-y-6 max-w-lg mx-auto"
      >
        {/* Profile */}
        <motion.div variants={itemVariants}>
          <SettingRow
            icon={User}
            label="الملف الشخصي"
            desc="تعديل اسمك، صورتك، والمعلومات الشخصية"
            onClick={onOpenProfile}
            theme="purple"
          />
        </motion.div>

        {/* Appearance */}
        <div>
          <SectionHeader title="المظهر والعرض" icon={Palette} />
          <div className="space-y-2.5">
            <SettingRow icon={Globe} label="لغة التطبيق" desc={languages.find(l => l.v === 'ar')?.l} onClick={() => setShowLanguageModal(true)} theme="blue" />
            <SettingRow icon={Type} label="حجم الخط" desc={sizes.find(s => s.v === fontSize)?.l || 'متوسط'} onClick={() => setShowSizeModal(true)} theme="blue" />
            <SettingRow icon={Palette} label="نوع الخط" desc={fonts.find(f => f.v === fontFamily)?.l || 'Tajawal'} onClick={() => setShowFontModal(true)} theme="blue" />
            <SettingRow icon={TabletSmartphone} label="وضع الشاشات الصغيرة" desc="تصغير الأبعاد لشاشات أصغر" toggle isToggled={compactMode} onToggle={() => setCompactMode(!compactMode)} theme="emerald" />
          </div>
        </div>

        {/* Calls */}
        <div>
          <SectionHeader title="المكالمات والصوت" icon={Volume2} />
          <div className="space-y-2.5">
            <SettingRow icon={Mic} label="كتم الميكروفون تلقائياً" desc="عند الانضمام للمكالمات" toggle isToggled={muteMicOnJoin} onToggle={onToggleMuteMic} theme="amber" />
            <SettingRow icon={Speaker} label="مكبر الصوت افتراضياً" desc="تفعيل السماعة الخارجية تلقائياً" toggle isToggled={speakerDefault} onToggle={onToggleSpeaker} theme="amber" />
          </div>
        </div>

        {/* Privacy */}
        <div>
          <SectionHeader title="الخصوصية والأمان" icon={ShieldCheck} />
          <div className="space-y-2.5">
            <SettingRow icon={Lock} label="قفل التطبيق" desc="حماية إضافية برمز سري أو بصمة" onClick={onOpenAppLock} theme="rose" />
            <SettingRow icon={RefreshCw} label="إدارة البيانات" desc="التحكم في التخزين والذاكرة المؤقتة" onClick={onOpenDataManagement} theme="rose" />
            <SettingRow icon={Trash2} label="إعادة ضبط التطبيق" desc="مسح جميع المحادثات والبيانات نهائياً" onClick={() => setShowResetModal(true)} theme="rose" />
          </div>
        </div>

        {/* More */}
        <div>
          <SectionHeader title="المزيد" icon={Sparkles} />
          <div className="space-y-2.5">
            <SettingRow icon={HelpCircle} label="تواصل مع المطور" desc="ملاحظات، اقتراحات، أو الإبلاغ عن مشكلة" onClick={onOpenSupport} theme="purple" />
            <SettingRow icon={Share2} label="شارك التطبيق" desc="دع أصدقاءك ينضمون إلى LinkUp" onClick={() => navigator.share?.({ title: 'LinkUp', url: window.location.origin }).catch(() => {})} theme="blue" />
            <SettingRow icon={Zap} label="تكوين شراكة" desc="انضم كشريك رسمي للتطبيق" onClick={onOpenPartner} theme="emerald" />
            {isAdmin && <SettingRow icon={Shield} label="لوحة الإدارة" desc="إدارة المستخدمين والمحتوى والإحصائيات" onClick={onOpenAdmin} theme="amber" badge="مسؤول" />}
          </div>
        </div>

        {/* Info Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2.5 mt-6">
          {[
            { label: 'من هو أثير؟', onClick: onOpenAtheer, theme: 'purple', icon: Sparkles },
            { label: 'من نحن', onClick: onOpenAbout, theme: 'blue', icon: Globe },
            { label: 'الخصوصية', onClick: onOpenPrivacy, theme: 'slate', icon: Shield },
          ].map((item) => (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={item.onClick}
              className="relative overflow-hidden rounded-2xl p-4 bg-white border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 group text-center"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${colorThemes[item.theme].iconBg.replace('bg-gradient-to-br ', '')} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300`} />
              <item.icon className={`w-5 h-5 mx-auto mb-2 text-stone-400 group-hover:${colorThemes[item.theme].text} transition-colors`} />
              <span className="relative text-xs font-bold text-stone-700 group-hover:text-stone-900 transition-colors block">{item.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="text-center py-6">
          <p className="text-[11px] text-stone-400 font-medium">LinkUp v2.0 · صُنع بإتقان</p>
        </motion.div>
      </motion.div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-2xl border-t border-stone-200/60 px-6 py-3 flex items-center justify-between shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={onBack} className="p-2.5 rounded-xl hover:bg-stone-100 active:bg-stone-200 transition-colors">
          <ArrowLeft className="w-6 h-6 text-stone-700" />
        </motion.button>
        <span className="text-sm font-semibold text-stone-500">القائمة الرئيسية</span>
        {isAdmin ? (
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={onOpenAdmin} className="p-2.5 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-700 transition-colors">
            <Shield className="w-6 h-6" />
          </motion.button>
        ) : <div className="w-11" />}
      </div>

      {/* Modals */}
      <SimpleModal open={showLanguageModal} onClose={() => setShowLanguageModal(false)} title="لغة التطبيق" icon={Globe}>
        <div className="space-y-2.5">
          {languages.map(lang => <SelectionItem key={lang.v} label={lang.l} desc={lang.desc} icon={lang.flag} isSelected={lang.v === 'ar'} onClick={() => setShowLanguageModal(false)} />)}
        </div>
      </SimpleModal>

      <SimpleModal open={showSizeModal} onClose={() => setShowSizeModal(false)} title="حجم الخط" icon={Type}>
        <div className="space-y-2.5">
          {sizes.map(s => <SelectionItem key={s.v} label={s.l} desc={s.desc} isSelected={fontSize === s.v} onClick={() => { onSelectFontSize?.(s.v); setShowSizeModal(false); }} />)}
        </div>
      </SimpleModal>

      <SimpleModal open={showFontModal} onClose={() => setShowFontModal(false)} title="نوع الخط" icon={Palette}>
        <div className="space-y-2.5">
          {fonts.map(f => <SelectionItem key={f.v} label={f.l} desc={f.desc} isSelected={fontFamily === f.v} featured={f.featured} onClick={() => { onSelectFontFamily?.(f.v); setShowFontModal(false); }} />)}
        </div>
      </SimpleModal>

      <SimpleModal open={showResetModal} onClose={() => { setShowResetModal(false); setResetText(''); }} title="تأكيد إعادة الضبط" icon={AlertTriangle} maxWidth="md">
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center border-4 border-red-100">
              <AlertTriangle className="w-10 h-10 text-red-500" strokeWidth={2} />
            </motion.div>
            <div className="text-center">
              <p className="text-base font-bold text-stone-800 mb-1">هذا الإجراء لا يمكن التراجع عنه</p>
              <p className="text-sm text-stone-500 leading-relaxed max-w-xs mx-auto">سيتم حذف جميع محادثاتك وبياناتك المحلية بشكل نهائي. اكتب كلمة "حذف" للتأكيد.</p>
            </div>
          </div>
          <div className="relative">
            <input value={resetText} onChange={e => setResetText(e.target.value)} placeholder='اكتب "حذف" هنا للتأكيد...' className="w-full h-14 px-5 rounded-2xl bg-stone-50 border-2 border-stone-200 focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 text-center text-lg font-bold text-stone-800 placeholder:font-normal placeholder:text-stone-400 transition-all" autoFocus dir="rtl" />
            {resetText.trim() === 'حذف' && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute left-4 top-1/2 -translate-y-1/2">
                <Check className="w-6 h-6 text-red-500" strokeWidth={3} />
              </motion.div>
            )}
          </div>
          <div className="flex gap-3">
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => { setShowResetModal(false); setResetText(''); }} className="flex-1 h-12 rounded-xl border-2 border-stone-200 bg-white hover:bg-stone-50 font-bold text-stone-700 transition-all">إلغاء</motion.button>
            <DangerButton onClick={handleResetApp} disabled={resetText.trim() !== 'حذف'} loading={resetLoading}>تأكيد الحذف</DangerButton>
          </div>
        </div>
      </SimpleModal>
    </div>
  );
}