import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Check, 
  Settings, 
  Users, 
  Eye, 
  EyeOff
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
      label: 'جهات الاتصال',
      desc: 'إدارة القائمة',
      icon: Users,
      onClick: () => onNavigate?.('contacts'),
      gradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-200',
    },
    {
      label: 'الإعدادات',
      desc: 'تخصيص التطبيق',
      icon: Settings,
      onClick: () => onNavigate?.('settings'),
      gradient: 'from-purple-500 to-indigo-500',
      shadowColor: 'shadow-purple-200',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 120, damping: 14 },
    },
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-32 text-right"
      dir="rtl"
    >
      {/* خلفية ناعمة */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-blue-200/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-fuchsia-200/15 rounded-full blur-[140px]" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 border-b border-gray-200/30 px-5 py-3 text-center shadow-sm"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <motion.h1 
          className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 cursor-default"
          whileTap={{ scale: 0.95 }}
        >
          LinkUp
        </motion.h1>
      </motion.div>

      {/* المحتوى الرئيسي */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col items-center pt-12 px-5 relative z-10"
      >
        {/* الصورة الشخصية */}
        <motion.div variants={itemVariants} className="mb-6 relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-xl opacity-20 scale-110" />
            <Avatar className="w-28 h-28 border-4 border-white shadow-2xl ring-4 ring-purple-500/10 relative">
              <AvatarImage src={user?.photoURL} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-500 text-white text-4xl font-bold">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        </motion.div>

        {/* الاسم */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <motion.h2 
            className="text-2xl font-black text-gray-800 cursor-default"
            whileTap={{ scale: 0.96 }}
          >
            {displayName}
          </motion.h2>
        </motion.div>

        {/* بطاقة اسم المستخدم */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-md bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <motion.h3 
              className="text-sm font-bold text-gray-800 cursor-default"
              whileTap={{ scale: 0.95, color: '#7c3aed' }}
            >
              اسم المستخدم الخاص بك
            </motion.h3>

            {/* Toggle Switch مُصلح — يستخدم translateX بدلاً من right/left */}
            <motion.button
              onClick={() => setIdVisible(!idVisible)}
              whileTap={{ scale: 0.85 }}
              className="relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none overflow-hidden"
              style={{ backgroundColor: idVisible ? '#8b5cf6' : '#e5e7eb' }}
            >
              <motion.div
                className="absolute top-[2px] w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                style={{ right: '2px' }}
                animate={{ x: idVisible ? -20 : 0 }}
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <AnimatePresence mode="wait">
                  {idVisible ? (
                    <motion.div
                      key="eye"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      <EyeOff className="w-3 h-3 text-purple-600" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="eyeoff"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      <Eye className="w-3 h-3 text-gray-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.button>
          </div>

          {/* حقل الـ username */}
          <motion.div 
            className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-gray-200 flex items-center justify-between group transition-all hover:shadow-md"
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <motion.code 
              className="text-lg font-mono text-purple-700 font-bold truncate flex-1 text-right select-all dir-ltr cursor-default"
              whileTap={{ scale: 0.97, color: '#6d28d9' }}
            >
              @{idVisible ? userHandle : '••••••••'}
            </motion.code>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.75 }}
              onClick={(e) => {
                handleCopy();
                createRipple(e);
              }}
              disabled={!username || username === 'غير محدد'}
              className="relative mr-3 p-3 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md overflow-hidden"
            >
              {ripples.map(ripple => (
                <span
                  key={ripple.key}
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
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
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
            className="text-[11px] text-gray-500 mt-3 text-center font-medium cursor-default"
            whileTap={{ scale: 0.98 }}
          >
            شارك اسم المستخدم (@{username}) مع أصدقائك ليعثروا عليك بسهولة في جهات الاتصال.
          </motion.p>
        </motion.div>

        {/* الأزرار السريعة */}
        <motion.div
          variants={containerVariants}
          className="w-full max-w-md grid grid-cols-2 gap-4"
        >
          {quickActions.map((action) => (
            <motion.button
              key={action.label}
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: '0 16px 32px -8px rgba(0,0,0,0.15)' }}
              whileTap={{ scale: 0.9 }}
              onClick={action.onClick}
              className="relative overflow-hidden rounded-2xl p-5 bg-white border border-gray-100/80 shadow-sm hover:shadow-lg transition-all text-right group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-transparent to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500" />
              
              <div className="relative flex flex-col gap-3">
                <motion.div 
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg transition-all`}
                  whileHover={{ scale: 1.1, rotate: 3 }}
                  whileTap={{ scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <motion.p 
                    className="font-bold text-gray-800 text-sm cursor-default"
                    whileTap={{ scale: 0.95, x: 2 }}
                  >
                    {action.label}
                  </motion.p>
                  <motion.p 
                    className="text-xs text-gray-500 mt-0.5 cursor-default"
                    whileTap={{ scale: 0.97 }}
                  >
                    {action.desc}
                  </motion.p>
                </div>
              </div>
            </motion.button>
          ))}
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