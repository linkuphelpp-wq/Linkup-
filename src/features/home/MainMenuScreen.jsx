import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Settings, Users, Eye, EyeOff, Sparkles, Zap } from 'lucide-react';
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
      gradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-200',
      lightBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'الإعدادات',
      desc: 'تخصيص التطبيق',
      icon: Settings,
      onClick: () => onNavigate?.('settings'),
      gradient: 'from-purple-500 to-indigo-500',
      shadowColor: 'shadow-purple-200',
      lightBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-32 text-right overflow-hidden" dir="rtl">
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

      {/* هيدر زجاجي عصري */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-gray-200/60 px-5 pt-12 pb-4 text-center shadow-sm"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
      >
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-6 h-6 text-purple-500" />
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
            LinkUp
          </h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">مرحباً بك في عالمك الخاص</p>
      </motion.div>

      <div className="relative z-10 flex-1 flex flex-col px-4 py-8 space-y-8 max-w-lg mx-auto w-full">
        
        {/* بطاقة الملف الشخصي - بنفس تصميم الإعدادات */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 20 }}
          className="relative bg-white rounded-3xl shadow-sm border border-gray-100/80 overflow-hidden"
        >
          {/* شريط علوي مزخرف */}
          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-purple-500/5 to-blue-500/5" />
          
          <div className="relative flex flex-col items-center pt-16 pb-8 px-6">
            {/* الأيقونة - الآن بعيدة تماماً عن الشريط العلوي */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Avatar className="w-28 h-28 border-4 border-white shadow-xl ring-4 ring-purple-500/10 mx-auto">
                  <AvatarImage src={user?.photoURL} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-500 text-white text-4xl font-bold">
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </div>

            {/* الاسم مع تأثير ظهور متأخر */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center mt-6"
            >
              <h2 className="text-2xl font-black text-gray-900">{displayName}</h2>
            </motion.div>
          </div>
        </motion.div>

        {/* بطاقة المعرف - تصميم متناسق */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">اسم المستخدم الخاص بك</h3>
            <button
              onClick={() => setIdVisible(!idVisible)}
              className="text-xs text-gray-500 hover:text-purple-600 font-medium flex items-center gap-1 transition-colors"
            >
              {idVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {idVisible ? 'إخفاء' : 'إظهار'}
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-gray-200 flex items-center justify-between group transition-all hover:shadow-md">
            <code className="text-lg font-mono text-purple-700 font-bold truncate flex-1 text-right select-all dir-ltr">
              @{idVisible ? userHandle : '••••••••'}
            </code>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              disabled={!username || username === 'غير محدد'}
              className="mr-3 p-3 rounded-xl bg-purple-500 text-white hover:bg-purple-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </motion.button>
          </div>
          <p className="text-[11px] text-gray-500 mt-3 text-center font-medium">
            شارك اسم المستخدم (@{username}) مع أصدقائك ليعثروا عليك بسهولة في جهات الاتصال.
          </p>
        </motion.div>

        {/* أزرار الاختصارات السريعة - بتصميم الإعدادات */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
          className="grid grid-cols-2 gap-4"
        >
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              whileHover={{ y: -5, boxShadow: '0 16px 32px -8px rgba(0,0,0,0.15)' }}
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              className="relative overflow-hidden rounded-2xl p-5 bg-white border border-gray-100/80 shadow-sm hover:shadow-lg transition-all text-right group"
            >
              {/* طبقة التأثير الخلفي عند التحويم */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-transparent to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500" />
              
              <div className="relative flex flex-col gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-110`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{action.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}