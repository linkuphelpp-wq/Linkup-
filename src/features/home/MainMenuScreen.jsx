import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Check, 
  Settings, 
  Users, 
  Eye, 
  EyeOff,
  ShieldCheck,
  Link2,
  ArrowUpLeft
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
      accent: 'bg-sky-500',
      light: 'bg-sky-50',
      text: 'text-sky-600',
      ring: 'ring-sky-200',
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      desc: 'تخصيص التطبيق',
      icon: Settings,
      onClick: () => onNavigate?.('settings'),
      accent: 'bg-violet-500',
      light: 'bg-violet-50',
      text: 'text-violet-600',
      ring: 'ring-violet-200',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden bg-slate-50 pb-32 text-right selection:bg-purple-100"
      dir="rtl"
    >
      {/* خلفية هندسية ناعمة */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-[45%] bg-gradient-to-b from-purple-100/60 via-violet-50/30 to-transparent" />
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-100/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-15%] w-[50%] h-[50%] bg-purple-200/15 rounded-full blur-[100px]" />
        {/* نقاط زخرفية */}
        <div className="absolute top-32 left-8 w-2 h-2 bg-purple-300/40 rounded-full" />
        <div className="absolute top-48 right-12 w-1.5 h-1.5 bg-blue-300/40 rounded-full" />
        <div className="absolute top-64 left-16 w-1 h-1 bg-violet-300/50 rounded-full" />
      </div>

      {/* المحتوى */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col items-center pt-6 px-5 relative z-10"
      >
        {/* --- الهيدر العائم --- */}
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-md flex items-center justify-between mb-8"
        >
          <motion.div 
            className="flex items-center gap-2 cursor-default"
            whileTap={{ scale: 0.92 }}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black text-gray-900 tracking-tight">LinkUp</span>
          </motion.div>
          
          <motion.div
            whileTap={{ scale: 0.85 }}
            className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center shadow-sm cursor-default"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </motion.div>
        </motion.div>

        {/* --- بطاقة الهوية الرئيسية --- */}
        <motion.div variants={itemVariants} className="w-full max-w-md mb-6">
          <motion.div
            className="relative bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden"
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {/* شريط ملون علوي */}
            <div className="h-2 bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500" />
            
            <div className="p-6 pt-5">
              {/* الصورة والاسم — تخطيط أفقي */}
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="relative flex-shrink-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-400 rounded-2xl blur-lg opacity-20" />
                  <Avatar className="w-20 h-20 rounded-2xl border-[3px] border-white shadow-lg relative">
                    <AvatarImage src={user?.photoURL} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-3xl font-black rounded-2xl">
                      {displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                  </div>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <motion.h2 
                    className="text-xl font-black text-gray-900 mb-1 truncate cursor-default"
                    whileTap={{ scale: 0.96, x: -2 }}
                  >
                    {displayName}
                  </motion.h2>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <span className="font-medium">متصل الآن</span>
                  </div>
                </div>
              </div>

              {/* فاصل */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent mb-5" />

              {/* حقل الـ Username — تصميم مدمج */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <motion.span 
                    className="text-xs font-bold text-gray-400 uppercase tracking-wider cursor-default"
                    whileTap={{ scale: 0.9, color: '#7c3aed' }}
                  >
                    معرفك الفريد
                  </motion.span>

                  {/* Toggle Switch دائري صغير */}
                  <motion.button
                    onClick={() => setIdVisible(!idVisible)}
                    whileTap={{ scale: 0.75 }}
                    className="relative w-10 h-6 rounded-full transition-colors duration-300"
                    style={{ backgroundColor: idVisible ? '#8b5cf6' : '#e2e8f0' }}
                  >
                    <motion.div
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center"
                      animate={{ 
                        right: idVisible ? 2 : 'auto', 
                        left: idVisible ? 'auto' : 2 
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <AnimatePresence mode="wait">
                        {idVisible ? (
                          <motion.div
                            key="eye"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.1 }}
                          >
                            <Eye className="w-2.5 h-2.5 text-purple-600" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="eyeoff"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.1 }}
                          >
                            <EyeOff className="w-2.5 h-2.5 text-gray-400" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.button>
                </div>

                {/* حقل النص المتكامل */}
                <div className="relative">
                  <motion.div
                    className="bg-slate-50 rounded-2xl border-2 border-slate-100 overflow-hidden relative group"
                    whileHover={{ borderColor: 'rgba(139,92,246,0.25)' }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <div className="flex items-center">
                      {/* الأيقونة */}
                      <div className="pl-4 pr-1 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                          <span className="text-purple-600 font-black text-sm">@</span>
                        </div>
                      </div>

                      {/* النص */}
                      <div className="flex-1 py-4">
                        <motion.code 
                          className="text-lg font-mono text-gray-800 font-bold block text-right dir-ltr select-all cursor-default"
                          whileTap={{ scale: 0.97, color: '#7c3aed' }}
                        >
                          {idVisible ? userHandle : '••••••••'}
                        </motion.code>
                      </div>

                      {/* زر النسخ — مدمج أنيق */}
                      <motion.button
                        onClick={(e) => {
                          handleCopy();
                          createRipple(e);
                        }}
                        disabled={!username || username === 'غير محدد'}
                        whileHover={{ backgroundColor: 'rgba(139,92,246,0.06)' }}
                        whileTap={{ scale: 0.75 }}
                        className="relative p-4 flex items-center justify-center overflow-hidden disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        {ripples.map(ripple => (
                          <span
                            key={ripple.key}
                            className="absolute rounded-full bg-purple-400/25 animate-ripple pointer-events-none"
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
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 45 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            >
                              <Check className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="copy"
                              initial={{ scale: 0, y: 5 }}
                              animate={{ scale: 1, y: 0 }}
                              exit={{ scale: 0, y: -5 }}
                              transition={{ type: 'spring', stiffness: 400 }}
                            >
                              <Copy className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" strokeWidth={1.5} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* شريط جانبي نجاح */}
                  <AnimatePresence>
                    {copied && (
                      <motion.div
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        exit={{ scaleY: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-400 rounded-full origin-top"
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* نص توضيحي */}
                <motion.p 
                  className="text-[11px] text-gray-400 text-center font-medium leading-relaxed cursor-default"
                  whileTap={{ scale: 0.98 }}
                >
                  شارك معرفك مع الأصدقاء للتواصل بسهولة
                </motion.p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* --- الأزرار السريعة — تصميم أفقي --- */}
        <motion.div
          variants={containerVariants}
          className="w-full max-w-md space-y-3"
        >
          {quickActions.map((action) => (
            <motion.button
              key={action.id}
              variants={itemVariants}
              whileHover={{ x: -4, boxShadow: '0 12px 40px -12px rgba(0,0,0,0.12)' }}
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              className={`w-full relative overflow-hidden rounded-2xl p-4 bg-white border border-gray-100 shadow-sm text-right group transition-all`}
            >
              <div className={`absolute inset-0 ${action.light} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative flex items-center gap-4">
                <motion.div 
                  className={`w-12 h-12 rounded-xl ${action.accent} flex items-center justify-center shadow-lg flex-shrink-0`}
                  whileHover={{ scale: 1.1, rotate: 4 }}
                  whileTap={{ scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <action.icon className="w-5 h-5 text-white" strokeWidth={2} />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <motion.p 
                      className="font-bold text-gray-900 text-base"
                      whileTap={{ scale: 0.95, x: 2 }}
                    >
                      {action.label}
                    </motion.p>
                    <motion.div
                      whileHover={{ x: -3 }}
                      className="text-gray-300 group-hover:text-gray-500 transition-colors"
                    >
                      <ArrowUpLeft className="w-4 h-4 rotate-180" />
                    </motion.div>
                  </div>
                  <motion.p 
                    className="text-xs text-gray-400 mt-0.5 font-medium"
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
          className="mt-10 flex items-center gap-2 opacity-30"
        >
          <div className="w-6 h-px bg-gray-400" />
          <p className="text-[10px] text-gray-400 font-bold tracking-widest">LINKUP</p>
          <div className="w-6 h-px bg-gray-400" />
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(5);
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