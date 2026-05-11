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
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('فشل النسخ:', err);
    }
  };

  const createRipple = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rippleId = Date.now() + Math.random();
    setRipples(prev => [...prev, { x, y, key: rippleId }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.key !== rippleId));
    }, 600);
  }, []);

  const quickActions = [
    {
      id: 'contacts',
      label: 'جهات الاتصال',
      desc: 'إدارة القائمة',
      icon: Users,
      onClick: () => onNavigate?.('contacts'),
      gradient: 'from-sky-500 to-blue-600',
      bg: 'bg-sky-50',
      border: 'border-sky-100',
      text: 'text-sky-700',
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      desc: 'تخصيص التطبيق',
      icon: Settings,
      onClick: () => onNavigate?.('settings'),
      gradient: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
      text: 'text-violet-700',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden bg-[#F0F2F5] pb-32 text-right selection:bg-purple-200"
      dir="rtl"
    >
      {/* خلفية */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-purple-200/30 rounded-full blur-[100px]" />
        <div className="absolute top-40 -right-20 w-72 h-72 bg-blue-200/25 rounded-full blur-[80px]" />
        <div className="absolute bottom-20 -left-20 w-96 h-96 bg-violet-200/20 rounded-full blur-[90px]" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 border-b border-gray-200/50 px-5 py-4"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center justify-center">
          <motion.div 
            className="flex items-center gap-2.5 cursor-default"
            whileTap={{ scale: 0.92 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-md shadow-purple-500/20">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight">LinkUp</h1>
          </motion.div>
        </div>
      </motion.div>

      {/* المحتوى */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col items-center pt-10 px-5 relative z-10"
      >
        {/* الصورة */}
        <motion.div variants={itemVariants} className="mb-5 relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-2xl opacity-25 scale-110" />
            <Avatar className="w-28 h-28 border-[4px] border-white shadow-xl shadow-gray-300/40 relative">
              <AvatarImage src={user?.photoURL} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-4xl font-black">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          <div className="absolute -bottom-1 -left-1 w-7 h-7 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-md">
            <div className="w-3.5 h-3.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          </div>
        </motion.div>

        {/* الاسم */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.h2 
            className="text-2xl font-black text-gray-900 mb-1 cursor-default"
            whileTap={{ scale: 0.96 }}
          >
            {displayName}
          </motion.h2>
          <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs">
            <Fingerprint className="w-3 h-3 text-purple-400" />
            <span className="font-medium">حساب نشط</span>
          </div>
        </motion.div>

        {/* بطاقة اسم المستخدم — هيكلة جديدة */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-md mb-6"
        >
          <div className="bg-white rounded-3xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
            {/* شريط علوي */}
            <div className="h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500" />
            
            <div className="p-5">
              {/* العنوان + Toggle */}
              <div className="flex items-center justify-between mb-4">
                <motion.h3 
                  className="text-sm font-bold text-gray-800 cursor-default"
                  whileTap={{ scale: 0.95, color: '#7c3aed' }}
                >
                  اسم المستخدم الخاص بك
                </motion.h3>

                {/* Toggle Switch أنيق */}
                <motion.button
                  onClick={() => setIdVisible(!idVisible)}
                  className="relative w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none"
                  style={{ backgroundColor: idVisible ? '#8b5cf6' : '#e5e7eb' }}
                  whileTap={{ scale: 0.85 }}
                >
                  <motion.div
                    className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                    animate={{ right: idVisible ? 4 : 'auto', left: idVisible ? 'auto' : 4 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <AnimatePresence mode="wait">
                      {idVisible ? (
                        <motion.div
                          key="eye"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Eye className="w-2.5 h-2.5 text-purple-600" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="eyeoff"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <EyeOff className="w-2.5 h-2.5 text-gray-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.button>
              </div>

              {/* حقل الـ username — تصميم متكامل */}
              <div className="relative">
                <motion.div
                  className="bg-gray-50 rounded-2xl border-2 border-gray-100 overflow-hidden relative"
                  whileHover={{ borderColor: 'rgba(139,92,246,0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {/* خلفية متدرجة خفيفة */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 via-transparent to-blue-50/50" />
                  
                  <div className="relative flex items-center">
                    {/* الجزء النصي */}
                    <div className="flex-1 p-4 pr-5">
                      <motion.code 
                        className="text-xl font-mono text-gray-800 font-bold block text-right dir-ltr select-all cursor-default"
                        whileTap={{ scale: 0.97, color: '#7c3aed' }}
                      >
                        @{idVisible ? userHandle : '••••••••'}
                      </motion.code>
                    </div>

                    {/* فاصل */}
                    <div className="w-px h-10 bg-gray-200" />

                    {/* زر النسخ — متكامل داخل البطاقة */}
                    <motion.button
                      onClick={(e) => {
                        handleCopy();
                        createRipple(e);
                      }}
                      disabled={!username || username === 'غير محدد'}
                      whileHover={{ backgroundColor: 'rgba(139,92,246,0.08)' }}
                      whileTap={{ scale: 0.8 }}
                      className="relative p-4 flex items-center justify-center overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {ripples.map(ripple => (
                        <span
                          key={ripple.key}
                          className="absolute rounded-full bg-purple-400/30 animate-ripple pointer-events-none"
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
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                          >
                            <Check className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <Copy className="w-5 h-5 text-gray-400" strokeWidth={2} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </motion.div>

                {/* شريط جانبي ملون عند النجاح */}
                <AnimatePresence>
                  {copied && (
                    <motion.div
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.6)] origin-right"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* نص توضيحي */}
              <motion.p 
                className="text-xs text-gray-400 mt-4 text-center font-medium leading-relaxed cursor-default"
                whileTap={{ scale: 0.98, color: '#6b7280' }}
              >
                شارك اسم المستخدم{' '}
                <motion.span 
                  className="text-purple-600 font-bold inline-block"
                  whileTap={{ scale: 0.9 }}
                >
                  @{username}
                </motion.span>{' '}
                مع أصدقائك ليعثروا عليك بسهولة
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* الأزرار السريعة */}
        <motion.div
          variants={containerVariants}
          className="w-full max-w-md grid grid-cols-2 gap-3"
        >
          {quickActions.map((action) => (
            <motion.button
              key={action.id}
              variants={itemVariants}
              whileHover={{ y: -4, boxShadow: '0 16px 40px -12px rgba(0,0,0,0.15)' }}
              whileTap={{ scale: 0.9 }}
              onClick={action.onClick}
              className={`relative overflow-hidden rounded-2xl p-5 bg-white border ${action.border} shadow-sm text-right group transition-all`}
            >
              <div className={`absolute inset-0 ${action.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative flex flex-col gap-3">
                <motion.div 
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 3 }}
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <action.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </motion.div>
                
                <div>
                  <div className="flex items-center gap-1">
                    <motion.p 
                      className="font-bold text-gray-900 text-sm group-hover:text-gray-800 transition-colors"
                      whileTap={{ scale: 0.95, x: 2 }}
                    >
                      {action.label}
                    </motion.p>
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 group-hover:-translate-x-1 transition-all" />
                  </div>
                  <motion.p 
                    className="text-[11px] text-gray-400 mt-0.5 font-medium"
                    whileTap={{ scale: 0.97 }}
                  >
                    {action.desc}
                  </motion.p>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col items-center gap-2 opacity-40"
        >
          <div className="w-8 h-0.5 rounded-full bg-gradient-to-r from-purple-400 to-blue-400" />
          <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">LinkUp</p>
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}