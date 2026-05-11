import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Settings, Users, Eye, EyeOff, Sparkles, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { auth } from '../../firebase/config';

export default function MainMenuScreen({ onNavigate, username }) {
  const user = auth.currentUser;
  const [copied, setCopied] = useState(false);
  const [idVisible, setIdVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

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

  const quickActions = [
    {
      label: 'جهات الاتصال',
      desc: 'إدارة القائمة',
      icon: Users,
      onClick: () => onNavigate?.('contacts'),
      gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
      glow: 'shadow-cyan-500/30',
      iconBg: 'bg-cyan-500/10',
    },
    {
      label: 'الإعدادات',
      desc: 'تخصيص التطبيق',
      icon: Settings,
      onClick: () => onNavigate?.('settings'),
      gradient: 'from-fuchsia-400 via-purple-500 to-violet-600',
      glow: 'shadow-purple-500/30',
      iconBg: 'bg-purple-500/10',
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
      className="min-h-screen flex flex-col relative overflow-hidden bg-[#0a0a0f] pb-32 text-right"
      dir="rtl"
    >
      {/* ===== خلفية متحركة ===== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMODAgMCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30" />
      </div>

      {/* ===== Header ===== */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0a0f]/60 border-b border-white/5 px-5 py-4 text-center shadow-2xl shadow-purple-900/5"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-blue-400">
            LINKUP
          </h1>
          <Sparkles className="w-5 h-5 text-blue-400" />
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
        <motion.div variants={itemVariants} className="mb-6 relative">
          {/* حلقة نبض خارجية */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-md opacity-40 animate-pulse scale-110" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-20 animate-ping scale-125" />
          
          <Avatar className="w-32 h-32 border-[3px] border-white/10 shadow-2xl shadow-purple-500/20 relative">
            <AvatarImage src={user?.photoURL} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 via-fuchsia-600 to-blue-600 text-white text-5xl font-black">
              {displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          {/* شارة متصلة */}
          <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-[#0a0a0f] rounded-full flex items-center justify-center border border-white/10">
            <div className="w-4 h-4 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.6)] animate-pulse" />
          </div>
        </motion.div>

        {/* --- الاسم --- */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h2 className="text-3xl font-black text-white mb-1 tracking-tight">
            {displayName}
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-gray-400 text-sm">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>حساب موثّق</span>
          </div>
        </motion.div>

        {/* --- بطاقة اسم المستخدم --- */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-md relative group mb-8"
        >
          {/* Glow خلفي */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-700" />
          
          <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-hidden">
            {/* تأثير ضوئي داخلي */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-sm font-bold text-white/90 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                اسم المستخدم الخاص بك
              </h3>
              <button
                onClick={() => setIdVisible(!idVisible)}
                className="text-xs text-gray-400 hover:text-purple-300 font-medium flex items-center gap-1.5 transition-all duration-300 hover:bg-white/5 px-3 py-1.5 rounded-full"
              >
                {idVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {idVisible ? 'إخفاء' : 'إظهار'}
              </button>
            </div>

            <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] rounded-2xl p-5 border border-white/10 flex items-center justify-between gap-4 relative z-10 group/input hover:border-purple-500/30 transition-all duration-500">
              <code className="text-2xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300 to-blue-300 font-black truncate flex-1 text-right select-all dir-ltr tracking-wider">
                @{idVisible ? userHandle : '••••••••'}
              </code>
              
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
                onClick={handleCopy}
                disabled={!username || username === 'غير محدد'}
                className="relative p-3.5 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none overflow-hidden group/btn"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Copy className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <p className="text-[11px] text-gray-500 mt-4 text-center font-medium leading-relaxed relative z-10">
              شارك اسم المستخدم <span className="text-purple-400 font-bold">@{username}</span> مع أصدقائك 
              <br />
              ليعثروا عليك بسهولة في جهات الاتصال
            </p>
          </div>
        </motion.div>

        {/* --- الأزرار السريعة --- */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-md grid grid-cols-2 gap-4 relative z-10"
        >
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={action.onClick}
              className="relative overflow-hidden rounded-3xl p-6 bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-500 text-right group shadow-xl shadow-black/20"
            >
              {/* Gradient hover background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              {/* Shine effect */}
              <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:animate-shine" />
              
              <div className="relative flex flex-col gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg ${action.glow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  <action.icon className="w-7 h-7 text-white drop-shadow-md" />
                </div>
                <div>
                  <p className="font-black text-white text-base mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-500 font-medium group-hover:text-gray-400 transition-colors">
                    {action.desc}
                  </p>
                </div>
              </div>

              {/* رقم الزخرفي */}
              <span className="absolute top-4 left-4 text-[10px] font-black text-white/5 group-hover:text-white/10 transition-colors">
                0{index + 1}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* --- Footer زخرفي --- */}
        <motion.div
          variants={itemVariants}
          className="mt-12 flex flex-col items-center gap-2 opacity-40"
        >
          <div className="w-12 h-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
          <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">
            LinkUp v1.0
          </p>
        </motion.div>
      </motion.div>

      {/* ===== أنيميشن CSS مخصص ===== */}
      <style jsx>{`
        @keyframes shine {
          100% {
            left: 125%;
          }
        }
        .animate-shine {
          animation: shine 1s;
        }
      `}</style>
    </div>
  );
}