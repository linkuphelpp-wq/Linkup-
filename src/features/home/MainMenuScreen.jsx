import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Check, 
  Settings, 
  Users, 
  Eye, 
  EyeOff, 
  ChevronLeft,
  Fingerprint,
  Zap
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { auth } from '../../firebase/config';

export default function MainMenuScreen({ onNavigate, username }) {
  const user = auth.currentUser;
  const [copied, setCopied] = useState(false);
  const [idVisible, setIdVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [pressedButton, setPressedButton] = useState(null);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'مستخدم';
  const userHandle = username || 'غير محدد';

  const handleCopy = async () => {
    if (!username || username === 'غير محدد') return;
    try {
      await navigator.clipboard.writeText(username);
      setCopied(true);
      // Haptic feedback if available
      if (navigator.vibrate) navigator.vibrate(50);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('فشل النسخ:', err);
    }
  };

  // Ripple effect handler
  const createRipple = useCallback((e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { x, y, id: Date.now() + id };
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  }, []);

  const handlePress = (id) => {
    setPressedButton(id);
    if (navigator.vibrate) navigator.vibrate(20);
    setTimeout(() => setPressedButton(null), 150);
  };

  const quickActions = [
    {
      id: 'contacts',
      label: 'جهات الاتصال',
      desc: 'إدارة القائمة',
      icon: Users,
      onClick: () => onNavigate?.('contacts'),
      color: 'from-sky-500 to-blue-600',
      lightColor: 'bg-sky-50',
      iconColor: 'text-sky-500',
      shadow: 'shadow-sky-200/50',
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      desc: 'تخصيص التطبيق',
      icon: Settings,
      onClick: () => onNavigate?.('settings'),
      color: 'from-violet-500 to-purple-600',
      lightColor: 'bg-violet-50',
      iconColor: 'text-violet-500',
      shadow: 'shadow-violet-200/50',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12 },
    },
  };

  const slideUp = {
    hidden: { opacity: 0, y: 60, filter: 'blur(10px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 80, damping: 15 }
    }
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden bg-[#F8F9FC] pb-32 text-right selection:bg-purple-200 selection:text-purple-900"
      dir="rtl"
    >
      {/* ===== خلفية ناعمة ===== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-purple-100/40 via-blue-50/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-sky-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-0 w-96 h-96 bg-violet-100/20 rounded-full blur-3xl" />
      </div>

      {/* ===== Header ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 border-b border-gray-100/80 px-5 py-4 shadow-sm"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-black tracking-tight text-gray-900">
              LinkUp
            </h1>
          </div>
        </div>
      </motion.div>

      {/* ===== المحتوى الرئيسي ===== */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col items-center pt-8 px-5 relative z-10"
      >
        {/* --- الصورة الشخصية --- */}
        <motion.div variants={itemVariants} className="mb-4 relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Avatar className="w-28 h-28 border-[4px] border-white shadow-xl shadow-gray-200/50 ring-4 ring-purple-100 relative">
              <AvatarImage src={user?.photoURL} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 text-white text-4xl font-black">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          
          {/* شارة متصلة */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="absolute -bottom-1 -left-1 w-7 h-7 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-md"
          >
            <div className="w-3.5 h-3.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          </motion.div>
        </motion.div>

        {/* --- الاسم فقط بدون نجوم --- */}
        <motion.div variants={slideUp} className="text-center mb-8">
          <motion.h2 
            className="text-2xl font-black text-gray-900 mb-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {displayName}
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-1.5 text-gray-400 text-xs"
          >
            <Fingerprint className="w-3 h-3 text-purple-400" />
            <span>حساب نشط</span>
          </motion.div>
        </motion.div>

        {/* --- بطاقة اسم المستخدم --- */}
        <motion.div
          variants={slideUp}
          className="w-full max-w-md relative mb-6"
        >
          <div className="bg-white rounded-3xl p-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] border border-gray-100/80 overflow-hidden relative">
            {/* خط زخرفي علوي */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500" />
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.6)]" />
                اسم المستخدم الخاص بك
              </h3>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIdVisible(!idVisible)}
                className="text-xs text-gray-400 hover:text-purple-600 font-medium flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-full hover:bg-purple-50"
              >
                <AnimatePresence mode="wait">
                  {idVisible ? (
                    <motion.div
                      key="hide"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      className="flex items-center gap-1.5"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>إخفاء</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="show"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      className="flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>إظهار</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <motion.div 
              className="bg-gradient-to-r from-purple-50/80 via-violet-50/50 to-blue-50/80 rounded-2xl p-4 border border-purple-100/60 flex items-center justify-between gap-3 relative overflow-hidden"
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <code className="text-xl font-mono text-purple-700 font-black truncate flex-1 text-right select-all dir-ltr tracking-wide">
                @{idVisible ? userHandle : '••••••••'}
              </code>

              <motion.button
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.85 }}
                onClick={(e) => {
                  handleCopy();
                  createRipple(e, 'copy');
                }}
                disabled={!username || username === 'غير محدد'}
                className="relative p-3 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 active:shadow-inner transition-all disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
              >
                {/* Ripple effects */}
                {ripples.filter(r => r.id.toString().includes('copy')).map(ripple => (
                  <span
                    key={ripple.id}
                    className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
                    style={{
                      left: ripple.x,
                      top: ripple.y,
                      width: 20,
                      height: 20,
                      marginLeft: -10,
                      marginTop: -10,
                    }}
                  />
                ))}
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <Copy className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-[11px] text-gray-400 mt-3 text-center font-medium leading-relaxed"
            >
              شارك اسم المستخدم <span className="text-purple-600 font-bold">@{username}</span> مع أصدقائك
              <br />
              ليعثروا عليك بسهولة في جهات الاتصال
            </motion.p>
          </div>
        </motion.div>

        {/* --- الأزرار السريعة --- */}
        <motion.div
          variants={containerVariants}
          className="w-full max-w-md grid grid-cols-2 gap-3 relative z-10"
        >
          {quickActions.map((action, index) => (
            <motion.button
              key={action.id}
              variants={itemVariants}
              whileHover={{ 
                y: -4, 
                scale: 1.02,
                transition: { type: 'spring', stiffness: 400, damping: 17 }
              }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                handlePress(action.id);
                createRipple(e, action.id);
                action.onClick();
              }}
              className={`relative overflow-hidden rounded-2xl p-5 bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] transition-all duration-300 text-right group ${pressedButton === action.id ? 'scale-95' : ''}`}
            >
              {/* Ripple */}
              {ripples.filter(r => r.id.toString().includes(action.id)).map(ripple => (
                <span
                  key={ripple.id}
                  className="absolute rounded-full bg-gray-200/50 animate-ripple pointer-events-none"
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    width: 20,
                    height: 20,
                    marginLeft: -10,
                    marginTop: -10,
                  }}
                />
              ))}

              {/* Hover gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
              
              <div className="relative flex flex-col gap-3">
                <motion.div 
                  className={`w-12 h-12 rounded-xl ${action.lightColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 5 }}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md ${action.shadow}`}>
                    <action.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </motion.div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    <p className="font-black text-gray-800 text-sm group-hover:text-gray-900 transition-colors">
                      {action.label}
                    </p>
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-[-2px] transition-all" />
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                    {action.desc}
                  </p>
                </div>
              </div>

              {/* رقم زخرفي */}
              <span className="absolute top-3 left-3 text-[9px] font-black text-gray-100 group-hover:text-gray-200 transition-colors">
                0{index + 1}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* --- Footer --- */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col items-center gap-2"
        >
          <motion.div 
            className="w-8 h-1 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"
            animate={{ scaleX: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <p className="text-[10px] text-gray-300 font-medium tracking-wider">
            LinkUp
          </p>
        </motion.div>
      </motion.div>

      {/* ===== أنيميشن CSS ===== */}
      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 0.6s linear;
        }
      `}</style>
    </div>
  );
}