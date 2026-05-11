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
  const [activePress, setActivePress] = useState(null);
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
      if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('فشل النسخ:', err);
    }
  };

  const createRipple = useCallback((e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rippleId = Date.now() + Math.random();
    setRipples(prev => [...prev, { x, y, id: id + rippleId, key: rippleId }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.key !== rippleId));
    }, 700);
  }, []);

  const triggerHaptic = (pattern = [20]) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  const handlePressStart = (id) => {
    setActivePress(id);
    triggerHaptic([15]);
  };

  const handlePressEnd = () => {
    setTimeout(() => setActivePress(null), 150);
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
      glowColor: 'shadow-sky-500/30',
      textColor: 'group-hover:text-sky-600',
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      desc: 'تخصيص التطبيق',
      icon: Settings,
      onClick: () => onNavigate?.('settings'),
      color: 'from-violet-500 to-purple-600',
      lightColor: 'bg-violet-50',
      glowColor: 'shadow-violet-500/30',
      textColor: 'group-hover:text-violet-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.85 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 90, damping: 12 },
    },
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden bg-[#F5F7FA] pb-32 text-right selection:bg-purple-200 selection:text-purple-900"
      dir="rtl"
    >
      {/* ===== خلفية ناعمة ===== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-gradient-to-b from-purple-100/50 via-blue-50/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-10 right-[-100px] w-80 h-80 bg-sky-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-[-100px] w-[500px] h-[500px] bg-violet-100/30 rounded-full blur-3xl" />
      </div>

      {/* ===== Header ===== */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 border-b border-gray-100 px-5 py-4 shadow-sm"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center justify-center">
          <motion.div 
            className="flex items-center gap-2.5 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onPointerDown={() => triggerHaptic([10])}
          >
            <motion.div 
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20"
              whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
            >
              <Zap className="w-4.5 h-4.5 text-white" />
            </motion.div>
            <h1 className="text-xl font-black tracking-tight text-gray-900 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 transition-all duration-300">
              LinkUp
            </h1>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== المحتوى الرئيسي ===== */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col items-center pt-10 px-5 relative z-10"
      >
        {/* --- الصورة الشخصية --- */}
        <motion.div variants={itemVariants} className="mb-5 relative">
          <motion.div
            whileHover={{ scale: 1.08, y: -4 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            onPointerDown={() => triggerHaptic([20])}
            className="cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-xl opacity-30 scale-110 animate-pulse" />
            <Avatar className="w-32 h-32 border-[5px] border-white shadow-2xl shadow-gray-300/50 relative">
              <AvatarImage src={user?.photoURL} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 text-white text-5xl font-black">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 500 }}
            className="absolute -bottom-1 -left-1 w-8 h-8 bg-white rounded-full flex items-center justify-center border-[3px] border-white shadow-lg"
          >
            <motion.div 
              className="w-4 h-4 bg-emerald-400 rounded-full"
              animate={{ boxShadow: ['0 0 0px rgba(52,211,153,0)', '0 0 12px rgba(52,211,153,0.8)', '0 0 0px rgba(52,211,153,0)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>

        {/* --- الاسم بدون نجوم --- */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <motion.h2 
            className="text-3xl font-black text-gray-900 mb-1.5 cursor-default"
            whileHover={{ 
              scale: 1.05, 
              textShadow: '0 0 30px rgba(168,85,247,0.3)',
              transition: { type: 'spring', stiffness: 300 }
            }}
            whileTap={{ scale: 0.95 }}
            onPointerDown={() => triggerHaptic([15])}
          >
            {displayName}
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 text-gray-400 text-xs"
          >
            <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-medium">حساب نشط</span>
          </motion.div>
        </motion.div>

        {/* --- بطاقة اسم المستخدم --- */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-md relative mb-8"
        >
          <motion.div 
            className="bg-white rounded-3xl p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden relative"
            whileHover={{ y: -2, boxShadow: '0 20px 60px -12px rgba(0,0,0,0.15)' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500" />
            
            <div className="flex items-center justify-between mb-5">
              <motion.h3 
                className="text-sm font-black text-gray-800 flex items-center gap-2 cursor-default"
                whileHover={{ x: -3, color: '#7c3aed', transition: { type: 'spring' } }}
                whileTap={{ scale: 0.95 }}
                onPointerDown={() => triggerHaptic([10])}
              >
                <motion.span 
                  className="w-2.5 h-2.5 rounded-full bg-purple-500"
                  animate={{ boxShadow: ['0 0 0px rgba(168,85,247,0)', '0 0 10px rgba(168,85,247,0.8)', '0 0 0px rgba(168,85,247,0)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                اسم المستخدم الخاص بك
              </motion.h3>
              
              <motion.button
                whileHover={{ scale: 1.08, backgroundColor: 'rgba(168,85,247,0.08)' }}
                whileTap={{ scale: 0.82 }}
                onClick={() => {
                  setIdVisible(!idVisible);
                  triggerHaptic([20, 30]);
                }}
                onPointerDown={() => triggerHaptic([10])}
                className="text-xs text-gray-400 font-bold flex items-center gap-1.5 transition-all px-4 py-2 rounded-full hover:text-purple-600"
              >
                <AnimatePresence mode="wait">
                  {idVisible ? (
                    <motion.span
                      key="hide"
                      initial={{ opacity: 0, x: 10, rotate: -90 }}
                      animate={{ opacity: 1, x: 0, rotate: 0 }}
                      exit={{ opacity: 0, x: -10, rotate: 90 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="flex items-center gap-1.5"
                    >
                      <EyeOff className="w-4 h-4" />
                      <span>إخفاء</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="show"
                      initial={{ opacity: 0, x: -10, rotate: 90 }}
                      animate={{ opacity: 1, x: 0, rotate: 0 }}
                      exit={{ opacity: 0, x: 10, rotate: -90 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      <span>إظهار</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <motion.div 
              className="bg-gradient-to-r from-purple-50 via-violet-50/50 to-blue-50 rounded-2xl p-5 border-2 border-purple-100/60 flex items-center justify-between gap-4 relative overflow-hidden"
              whileHover={{ 
                scale: 1.02, 
                borderColor: 'rgba(168,85,247,0.4)',
                boxShadow: '0 0 30px rgba(168,85,247,0.1)'
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onPointerDown={() => triggerHaptic([15])}
            >
              <motion.code 
                className="text-2xl font-mono text-purple-700 font-black truncate flex-1 text-right select-all dir-ltr tracking-wider cursor-pointer"
                whileHover={{ 
                  scale: 1.03,
                  textShadow: '0 0 20px rgba(147,51,234,0.3)',
                  letterSpacing: '0.05em'
                }}
                whileTap={{ scale: 0.95 }}
              >
                @{idVisible ? userHandle : '••••••••'}
              </motion.code>

              <motion.button
                whileHover={{ 
                  scale: 1.15, 
                  y: -3,
                  boxShadow: '0 10px 30px -5px rgba(147,51,234,0.5)'
                }}
                whileTap={{ scale: 0.75 }}
                onClick={(e) => {
                  handleCopy();
                  createRipple(e, 'copy');
                }}
                disabled={!username || username === 'غير محدد'}
                onPointerDown={() => triggerHaptic([20])}
                className="relative p-3.5 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/30 overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {ripples.filter(r => r.id.includes('copy')).map(ripple => (
                  <span
                    key={ripple.key}
                    className="absolute rounded-full bg-white/40 animate-ripple pointer-events-none"
                    style={{
                      left: ripple.x,
                      top: ripple.y,
                      width: 24,
                      height: 24,
                      marginLeft: -12,
                      marginTop: -12,
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
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 300 }}
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
              transition={{ delay: 0.7 }}
              className="text-xs text-gray-400 mt-4 text-center font-bold leading-relaxed"
            >
              شارك اسم المستخدم{' '}
              <motion.span 
                className="text-purple-600 font-black inline-block"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                @{username}
              </motion.span>{' '}
              مع أصدقائك
              <br />
              ليعثروا عليك بسهولة في جهات الاتصال
            </motion.p>
          </motion.div>
        </motion.div>

        {/* --- الأزرار السريعة --- */}
        <motion.div
          variants={containerVariants}
          className="w-full max-w-md grid grid-cols-2 gap-4 relative z-10"
        >
          {quickActions.map((action, index) => (
            <motion.button
              key={action.id}
              variants={itemVariants}
              whileHover={{ 
                y: -6, 
                scale: 1.03,
                boxShadow: '0 20px 50px -12px rgba(0,0,0,0.2)'
              }}
              whileTap={{ scale: 0.88 }}
              onPointerDown={() => handlePressStart(action.id)}
              onPointerUp={handlePressEnd}
              onPointerLeave={handlePressEnd}
              onClick={(e) => {
                createRipple(e, action.id);
                action.onClick();
              }}
              className={`relative overflow-hidden rounded-3xl p-6 bg-white border-2 border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] text-right group transition-colors hover:border-gray-200 ${activePress === action.id ? 'scale-90 bg-gray-50' : ''}`}
            >
              {ripples.filter(r => r.id.includes(action.id) && !r.id.includes('copy')).map(ripple => (
                <span
                  key={ripple.key}
                  className="absolute rounded-full bg-gray-300/40 animate-ripple pointer-events-none"
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    width: 28,
                    height: 28,
                    marginLeft: -14,
                    marginTop: -14,
                  }}
                />
              ))}

              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
              
              <div className="relative flex flex-col gap-4">
                <motion.div 
                  className={`w-14 h-14 rounded-2xl ${action.lightColor} flex items-center justify-center`}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <motion.div 
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg ${action.glowColor}`}
                    whileHover={{ boxShadow: '0 0 25px rgba(147,51,234,0.4)' }}
                  >
                    <action.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </motion.div>
                </motion.div>
                
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <motion.p 
                      className={`font-black text-gray-900 text-base transition-colors duration-300 ${action.textColor}`}
                      whileHover={{ x: -4, letterSpacing: '0.02em' }}
                      whileTap={{ scale: 0.92 }}
                    >
                      {action.label}
                    </motion.p>
                    <motion.div
                      initial={{ x: 0, opacity: 0.3 }}
                      whileHover={{ x: -4, opacity: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  </div>
                  <motion.p 
                    className="text-xs text-gray-400 font-bold leading-relaxed"
                    whileHover={{ color: '#6b7280' }}
                  >
                    {action.desc}
                  </motion.p>
                </div>
              </div>

              <motion.span 
                className="absolute top-4 left-4 text-[10px] font-black text-gray-100"
                whileHover={{ scale: 1.2, color: 'rgba(156,163,175,0.3)' }}
              >
                0{index + 1}
              </motion.span>
            </motion.button>
          ))}
        </motion.div>

        {/* --- Footer --- */}
        <motion.div
          variants={itemVariants}
          className="mt-12 flex flex-col items-center gap-3"
        >
          <motion.div 
            className="w-10 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"
            animate={{ scaleX: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.p 
            className="text-[11px] text-gray-300 font-bold tracking-widest uppercase cursor-default"
            whileHover={{ color: '#9ca3af', scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
          >
            LinkUp
          </motion.p>
        </motion.div>
      </motion.div>

      {/* ===== أنيميشن CSS ===== */}
      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.6;
          }
          100% {
            transform: scale(5);
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 0.7s cubic-bezier(0, 0.2, 0.8, 1);
        }
      `}</style>
    </div>
  );
}