import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Palette, Mic, Speaker, Lock, RefreshCw,
  MessageCircle, Share2, Sparkles, Check, Crown,
  AlertTriangle, X, TabletSmartphone, User, ChevronRight, ArrowLeft, Globe
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';

const SettingRow = ({ icon: Icon, label, desc, onClick, toggle, isToggled, onToggle, color = 'purple' }) => {
  const colorsMap = {
    purple: 'from-purple-500 to-indigo-500 bg-purple-50 text-purple-600',
    blue: 'from-blue-500 to-cyan-500 bg-blue-50 text-blue-600',
    green: 'from-emerald-500 to-teal-500 bg-emerald-50 text-emerald-600',
    orange: 'from-orange-500 to-red-500 bg-orange-50 text-orange-600',
    pink: 'from-pink-500 to-rose-500 bg-pink-50 text-pink-600',
  };
  const colorSet = colorsMap[color] || colorsMap.purple;
  const parts = colorSet.split(' ');
  const gradientFrom = parts[0] + ' ' + parts[1];
  const gradientTo = parts[2] + ' ' + parts[3];
  const bgClass = parts[4];
  const textClass = parts[5];

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 12px 40px -12px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.96 }}
      onClick={toggle ? undefined : onClick}
      className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 cursor-pointer transition-all shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.15)] p-4"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-transparent to-blue-500/0 group-hover:from-purple-500/[0.03] group-hover:to-blue-500/[0.03] transition-all duration-500" />
      <div className="relative flex items-center gap-4">
        <motion.div 
          className={`p-3 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white shadow-md group-hover:shadow-lg transition-all`}
          whileHover={{ scale: 1.12, rotate: 3 }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Icon className="w-5 h-5" strokeWidth={2.5} />
        </motion.div>
        <div className="flex-1 min-w-0 text-right">
          <motion.p 
            className="text-sm font-black text-gray-800 cursor-default"
            whileTap={{ scale: 0.95, x: 2 }}
          >
            {label}
          </motion.p>
          {desc && (
            <motion.p 
              className="text-xs text-gray-400 mt-0.5 truncate font-medium cursor-default"
              whileTap={{ scale: 0.97 }}
            >
              {desc}
            </motion.p>
          )}
        </div>
        {toggle ? (
          <motion.button
            onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
            whileTap={{ scale: 0.85 }}
            className={`relative w-12 h-7 rounded-full transition-colors duration-300 shrink-0 overflow-hidden ${isToggled ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-md shadow-purple-500/25' : 'bg-gray-200'}`}
          >
            <motion.div
              className="absolute top-[2px] bottom-[2px] w-5 bg-white rounded-full shadow-md flex items-center justify-center"
              animate={{ 
                insetInlineStart: isToggled ? 'auto' : '2px',
                insetInlineEnd: isToggled ? '2px' : 'auto',
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <AnimatePresence mode="wait">
                {isToggled ? (
                  <motion.div
                    key="on"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="off"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.button>
        ) : (
          <motion.div
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.8 }}
          >
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 group-hover:-translate-x-1 transition-all" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const SimpleModal = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl shadow-purple-500/5 border border-gray-100"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <motion.h3 
              className="text-lg font-black text-gray-900 cursor-default"
              whileTap={{ scale: 0.95 }}
            >
              {title}
            </motion.h3>
            <motion.button 
              onClick={onClose} 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.8 }}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Section = ({ title, children, delay = 0, icon: Icon }) => (
  <motion.section
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, type: 'spring', stiffness: 120, damping: 15 }}
    className="space-y-3"
  >
    <div className="flex items-center gap-2 px-1 mb-1">
      {Icon && (
        <motion.div
          whileHover={{ scale: 1.2, rotate: 10 }}
          whileTap={{ scale: 0.8 }}
        >
          <Icon className="w-4 h-4 text-purple-400" strokeWidth={2.5} />
        </motion.div>
      )}
      <motion.h3 
        className="text-xs font-black text-gray-400 uppercase tracking-widest cursor-default"
        whileTap={{ scale: 0.95, color: '#7c3aed' }}
      >
        {title}
      </motion.h3>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-100" />
    </div>
    <div className="space-y-3">{children}</div>
  </motion.section>
);

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
    { v: 'tajawal', l: 'Tajawal', desc: 'الخط الافتراضي الأنيق' },
    { v: 'cairo', l: 'Cairo', desc: 'خط عصري وواضح' },
    { v: 'rubik', l: 'Rubik', desc: 'خط سميك ومقروء' },
    { v: 'ibm-plex', l: 'IBM Plex', desc: 'خط احترافي', featured: true }
  ];

  const languages = [
    { v: 'ar', l: 'العربية', flag: '🇸🇦' },
    { v: 'en', l: 'English', flag: '🇬🇧' }
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 120, damping: 14 },
    },
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#F8F9FC] pb-32 text-right selection:bg-purple-200" dir="rtl">
      {/* خلفية ناعمة */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-100/40 rounded-full blur-[120px]" />
        <div className="absolute top-40 right-[-100px] w-72 h-72 bg-blue-100/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-[-100px] w-96 h-96 bg-violet-100/20 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 border-b border-gray-200/40 px-5 py-4 text-center shadow-sm"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <motion.h1 
          className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 cursor-default"
          whileTap={{ scale: 0.95 }}
        >
          الإعدادات
        </motion.h1>
        <motion.p 
          className="text-xs text-gray-400 mt-1 font-medium cursor-default"
          whileTap={{ scale: 0.98 }}
        >
          تحكم كامل في تطبيقك
        </motion.p>
      </motion.div>

      {/* المحتوى */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-4 py-6 space-y-8 max-w-lg mx-auto relative z-10"
      >
        <Section title="الحساب" delay={0.1} icon={User}>
          <SettingRow icon={User} label="الملف الشخصي" desc="تعديل اسمك وصورتك" onClick={onOpenProfile} color="purple" />
        </Section>

        <Section title="المظهر" delay={0.2} icon={Palette}>
          <SettingRow icon={Globe} label="لغة التطبيق" desc="اختر لغة الواجهة" onClick={() => setShowLanguageModal(true)} color="blue" />
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

        {/* أزرار أسفلية */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-3 pt-2"
        >
          {[
            { label: 'من هو أثير؟', onClick: onOpenAtheer, gradient: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50' },
            { label: 'من نحن', onClick: onOpenAbout, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
            { label: 'الخصوصية', onClick: onOpenPrivacy, gradient: 'from-gray-500 to-gray-600', bg: 'bg-gray-50' },
          ].map((item) => (
            <motion.button
              key={item.label}
              whileHover={{ y: -4, scale: 1.03, boxShadow: '0 12px 30px -8px rgba(0,0,0,0.12)' }}
              whileTap={{ scale: 0.88 }}
              onClick={item.onClick}
              className={`relative overflow-hidden rounded-2xl py-4 px-2 ${item.bg} border border-gray-100/80 shadow-sm transition-all group`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500`} />
              <motion.span 
                className="relative text-xs font-black text-gray-700 group-hover:text-gray-900 transition-colors cursor-default block"
                whileTap={{ scale: 0.9 }}
              >
                {item.label}
              </motion.span>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-2xl border-t border-gray-200/50 px-5 py-3 flex items-center justify-between shadow-lg"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <motion.button 
          onClick={onBack} 
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.8 }}
          className="p-2.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </motion.button>
        <motion.span 
          className="text-sm font-bold text-gray-400 cursor-default"
          whileTap={{ scale: 0.95 }}
        >
          القائمة
        </motion.span>
        {isAdmin ? (
          <motion.button 
            onClick={onOpenAdmin} 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            className="p-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-600 transition-all"
          >
            <Shield className="w-5 h-5" />
          </motion.button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Modals */}
      <SimpleModal open={showLanguageModal} onClose={() => setShowLanguageModal(false)} title="لغة التطبيق">
        <div className="space-y-2">
          {languages.map(lang => (
            <motion.button
              key={lang.v}
              whileHover={{ scale: 1.02, x: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowLanguageModal(false); }}
              className="w-full p-4 rounded-2xl text-right text-sm font-bold flex items-center justify-between transition-all bg-gray-50 text-gray-700 hover:bg-purple-50 border border-transparent hover:border-purple-100"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <motion.span whileTap={{ scale: 0.95 }} className="cursor-default">{lang.l}</motion.span>
              </span>
            </motion.button>
          ))}
        </div>
      </SimpleModal>

      <SimpleModal open={showSizeModal} onClose={() => setShowSizeModal(false)} title="حجم الخط">
        <div className="space-y-2">
          {sizes.map(s => (
            <motion.button
              key={s.v}
              whileHover={{ scale: 1.02, x: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { onSelectFontSize?.(s.v); setShowSizeModal(false); }}
              className={`w-full p-4 rounded-2xl text-right text-sm font-bold flex items-center justify-between transition-all border-2 ${
                fontSize === s.v ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-md' : 'bg-gray-50 text-gray-700 border-transparent hover:bg-purple-50 hover:border-purple-100'
              }`}
            >
              <motion.span whileTap={{ scale: 0.95 }} className="cursor-default">{s.l}</motion.span>
              {fontSize === s.v && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full p-1">
                  <Check className="w-3.5 h-3.5" />
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
              whileHover={{ scale: 1.02, x: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { onSelectFontFamily?.(f.v); setShowFontModal(false); }}
              className={`w-full p-4 rounded-2xl text-right text-sm font-bold flex items-center justify-between transition-all border-2 ${
                fontFamily === f.v ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-md' : 'bg-gray-50 text-gray-700 border-transparent hover:bg-purple-50 hover:border-purple-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <motion.span whileTap={{ scale: 0.95 }} className="cursor-default">{f.l}</motion.span>
                {f.featured && <Crown className="w-4 h-4 text-yellow-500" />}
              </span>
              {fontFamily === f.v && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full p-1">
                  <Check className="w-3.5 h-3.5" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </SimpleModal>

      <SimpleModal open={showResetModal} onClose={() => setShowResetModal(false)} title="تأكيد إعادة الضبط">
        <div className="space-y-5">
          <div className="flex flex-col items-center gap-3">
            <motion.div 
              className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center"
              whileTap={{ scale: 0.9, rotate: 10 }}
            >
              <AlertTriangle className="w-8 h-8 text-red-500" strokeWidth={2} />
            </motion.div>
            <motion.p 
              className="text-sm text-gray-500 text-center leading-relaxed font-medium cursor-default"
              whileTap={{ scale: 0.98 }}
            >
              هذا الإجراء لا يمكن التراجع عنه. اكتب كلمة "حذف" للتأكيد
            </motion.p>
          </div>
          <motion.input
            value={resetText}
            onChange={e => setResetText(e.target.value)}
            placeholder='اكتب كلمة حذف هنا...'
            whileFocus={{ scale: 1.01 }}
            className="w-full h-12 px-4 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 text-center text-base font-bold transition-all"
            autoFocus
          />
          <div className="flex gap-3">
            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.9 }} 
              onClick={() => setShowResetModal(false)} 
              className="flex-1 h-11 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 font-bold text-gray-700 transition-all"
            >
              إلغاء
            </motion.button>
            <motion.button
              whileHover={resetText.trim() === 'حذف' ? { scale: 1.02 } : {}}
              whileTap={resetText.trim() === 'حذف' ? { scale: 0.85 } : {}}
              onClick={handleResetApp}
              disabled={resetText.trim() !== 'حذف' || resetLoading}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-black disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-200 transition-all"
            >
              {resetLoading ? 'جارٍ...' : 'تأكيد الحذف'}
            </motion.button>
          </div>
        </div>
      </SimpleModal>
    </div>
  );
}