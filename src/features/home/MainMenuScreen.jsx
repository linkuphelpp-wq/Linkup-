import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Settings, Users, Eye, EyeOff, User, Zap } from 'lucide-react';
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

  // القائمة السريعة
  const quickActions = [
    {
      label: 'جهات الاتصال',
      desc: 'إدارة القائمة',
      icon: Users,
      onClick: () => onNavigate?.('contacts'),
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'الإعدادات',
      desc: 'تخصيص التطبيق',
      icon: Settings,
      onClick: () => onNavigate?.('settings'),
      gradient: 'from-purple-500 to-indigo-500',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-32 text-right" dir="rtl">
      {/* هيدر زجاجي عصري */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 bg-white/80 backdrop-blur-2xl border-b border-gray-200/40 px-5 pt-14 pb-5 text-center shadow-sm"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-purple-600" />
          <h1 className="text-xl font-black text-gray-800 tracking-tight">القائمة الرئيسية</h1>
        </div>
        <p className="text-sm text-gray-500">مرحباً بك في عالمك الخاص</p>
      </motion.div>

      {/* المحتوى الرئيسي */}
      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto w-full">
        
        {/* بطاقة الملف الشخصي */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
          className="relative overflow-hidden rounded-3xl bg-white border border-gray-100/80 shadow-lg p-6"
        >
          {/* خلفية زخرفية */}
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-500/5 to-blue-500/5" />
          
          <div className="relative flex flex-col items-center">
            {/* الصورة الرمزية */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 16 }}
              className="mb-4"
            >
              <Avatar className="w-24 h-24 border-4 border-white shadow-xl ring-4 ring-purple-500/10">
                <AvatarImage src={user?.photoURL} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-500 text-white text-3xl font-bold">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            {/* الاسم */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-2xl font-black text-gray-900"
            >
              {displayName}
            </motion.h2>
          </div>
        </motion.div>

        {/* بطاقة المعرف */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
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

        {/* أزرار الاختصارات السريعة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 200, damping: 20 }}
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