import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Settings, Users, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { auth } from '../../firebase/config';

export default function MainMenuScreen({ onNavigate, username }) {
  const user = auth.currentUser;
  const [copied, setCopied] = useState(false);
  const [idVisible, setIdVisible] = useState(true);

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
      gradient: 'from-cyan-500 to-blue-600',
      shadowColor: 'shadow-cyan-200',
    },
    {
      label: 'الإعدادات',
      desc: 'تخصيص التطبيق',
      icon: Settings,
      onClick: () => onNavigate?.('settings'),
      gradient: 'from-violet-500 to-purple-600',
      shadowColor: 'shadow-violet-200',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-rose-50 pb-32 text-right overflow-hidden" dir="rtl">
      {/* زخارف خلفية ديناميكية */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
          className="absolute -top-32 -right-32 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -15, 15, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"
        />
      </div>

      {/* هيدر عصري بتأثير زجاجي مع أيقونة */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 backdrop-blur-xl bg-white/60 border-b border-white/40 px-5 pt-12 pb-4 text-center shadow-sm"
      >
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
            LinkUp
          </h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">مرحباً بك في عالمك الخاص</p>
      </motion.div>

      <div className="relative z-10 flex-1 flex flex-col px-5 py-6 space-y-8 max-w-lg mx-auto w-full">
        
        {/* بطاقة الملف الشخصي - تصميم Neumorphism - تم زيادة المسافة العلوية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 150, damping: 15 }}
          whileHover={{ y: -5 }}
          className="relative bg-white/70 backdrop-blur-md rounded-3xl p-6 pt-14 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5),0_20px_40px_-12px_rgba(0,0,0,0.1)] border border-white/50 mt-4"
        >
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
            >
              <Avatar className="w-24 h-24 border-4 border-white shadow-xl ring-4 ring-purple-500/10">
                <AvatarImage src={user?.photoURL} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-500 text-white text-3xl font-bold">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          </div>
          {/* تمت إزالة مؤشر النشاط (النجمة) */}
          <div className="mt-2 text-center">
            <h2 className="text-2xl font-bold text-gray-800">{displayName}</h2>
          </div>
        </motion.div>

        {/* بطاقة المعرف بتصميم مختلف */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 150, damping: 15 }}
          className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-600">اسم المستخدم</span>
            <button onClick={() => setIdVisible(!idVisible)} className="text-gray-400 hover:text-purple-500 transition-colors">
              {idVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-3 border border-gray-100">
            <code className="flex-1 text-lg font-mono text-purple-700 font-bold tracking-wider dir-ltr text-left">
              @{idVisible ? userHandle : '••••••••'}
            </code>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              disabled={!username || username === 'غير محدد'}
              className="mr-2 p-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 shadow-md disabled:opacity-50"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </motion.button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            شارك المعرف للتواصل السريع
          </p>
        </motion.div>

        {/* أزرار الاختصارات - تصميم أفقي بحجم كبير مع أيقونات متدرجة */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {quickActions.map((action, idx) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.1, type: 'spring', stiffness: 180, damping: 18 }}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={action.onClick}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${action.gradient} text-white shadow-lg ${action.shadowColor} transition-all`}
            >
              <action.icon className="w-8 h-8" />
              <div className="text-center">
                <p className="font-bold text-sm">{action.label}</p>
                <p className="text-[10px] opacity-80">{action.desc}</p>
              </div>
              {/* تأثير لمعان عند التحويم */}
              <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity rounded-2xl" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}