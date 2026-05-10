import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, User, Calendar, Clock, Shield, Users, X, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function UserDetailModal({ user, onClose }) {
  const { t } = useLanguage();

  if (!user) return null;

  const isBanned = user.status === 'banned';

  const details = [
    { icon: Mail, label: t('admin.email'), value: user.email },
    { icon: User, label: t('admin.username'), value: `@${user.username || t('admin.unknown')}` },
    { icon: Calendar, label: t('admin.joinDate'), value: user.createdAt?.toDate?.()?.toLocaleDateString('ar-SA') || '—' },
    { icon: Clock, label: t('admin.lastSeen'), value: user.lastSeen?.toDate?.()?.toLocaleString('ar-SA') || '—' },
    { icon: Shield, label: t('admin.accountStatus'), value: isBanned ? t('admin.banned') : t('admin.active'), color: isBanned ? 'text-red-600' : 'text-emerald-600' },
    { icon: Users, label: t('admin.contacts'), value: user.contacts?.length || 0 },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="bg-white rounded-3xl p-0 w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className={`h-1.5 w-full ${isBanned ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`} />
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h2 className="text-xl font-bold text-gray-900">{t('admin.userDetails')}</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              >
                <Avatar className="w-24 h-24 border-4 border-white shadow-xl ring-4 ring-purple-500/10">
                  <AvatarFallback className={`text-3xl font-bold ${isBanned ? 'bg-gradient-to-br from-red-500 to-rose-500' : 'bg-gradient-to-br from-purple-500 to-blue-500'} text-white`}>
                    {user.email?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-bold text-gray-900 mt-3 text-lg"
              >
                {user.displayName || user.email?.split('@')[0]}
              </motion.p>
              
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
                className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  isBanned ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isBanned ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
                {isBanned ? t('admin.banned') : t('admin.active')}
              </motion.span>
            </div>

            <div className="space-y-2">
              {details.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className={`p-2 rounded-lg ${isBanned && item.label === t('admin.accountStatus') ? 'bg-red-100 text-red-600' : 'bg-purple-50 text-purple-600'}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-right min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium">{item.label}</p>
                    <p className={`text-sm font-bold truncate ${item.color || 'text-gray-800'}`}>
                      {item.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="w-full mt-4 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold shadow-md shadow-purple-500/20 hover:shadow-lg transition-all"
            >
              {t('common.close')}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}