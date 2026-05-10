import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Users, Star, UserPlus, Zap, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db, auth } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { useLanguage } from '../../context/LanguageContext';

const LinkUpLogo = () => (
  <div className="flex items-center gap-2.5">
    <div className="relative w-9 h-9">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl rotate-6 opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl -rotate-6 opacity-20"></div>
      <div className="absolute inset-0 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
        <Users className="w-5 h-5 text-purple-600" />
      </div>
    </div>
    <span className="text-2xl font-black tracking-tight text-gray-900">
      Link<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">Up</span>
    </span>
  </div>
);

const GroupCard = ({ group, isFavorite, onToggleFavorite, onClick, index = 0, t }) => {
  const [lastMsg, setLastMsg] = useState(null);
  const memberCount = group.members?.length || 0;
  const gradients = [
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-red-500',
  ];
  const gradient = gradients[index % gradients.length];

  useEffect(() => {
    if (!group.id) return;
    const colRef = collection(db, 'groups', group.id, 'messages');
    const q = query(colRef, orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const latest = snap.docs[0].data();
        setLastMsg(latest);
      }
    });
    return () => unsub();
  }, [group.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ y: -4, boxShadow: '0 16px 32px -8px rgba(0,0,0,0.15)' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.()}
      className="relative overflow-hidden rounded-2xl bg-white border border-gray-100/80 shadow-sm hover:shadow-lg transition-all cursor-pointer p-4"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-transparent to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500" />
      
      <div className="relative flex items-center gap-4">
        <div className="relative shrink-0">
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
            <Users className="w-6 h-6 text-white" />
          </div>
          {isFavorite && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1"
            >
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 drop-shadow-md" />
            </motion.div>
          )}
        </div>

        <div className="flex-1 min-w-0 text-right">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 truncate">{group.name || t('groups.defaultName')}</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{memberCount} {t('groups.membersCount')}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {lastMsg?.text || t('groups.startChat')}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(group.id); }}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors shrink-0"
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default function GroupsScreen({ onBack, onOpenCreateGroup, onOpenGroup }) {
  const { t } = useLanguage();
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('group_favorites') || '[]'); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem('group_favorites', JSON.stringify(favorites)); }, [favorites]);

  const toggleFavorite = (groupId) => {
    setFavorites(prev => prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]);
  };

  useEffect(() => {
    const q = query(collection(db, 'groups'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setGroups(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const filtered = groups.filter(g => g.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-24 text-right" dir="rtl">
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-5 pt-12 pb-4 shadow-sm"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
      >
        <div className="flex items-center justify-between mb-5">
          <LinkUpLogo />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onOpenCreateGroup}
            className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-purple-500" />
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('groups.title')}</h1>
          </div>
          <p className="text-sm text-gray-500">{t('groups.subtitle')}</p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input placeholder={t('groups.search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-12 pr-12 pl-4 rounded-2xl bg-white border-gray-200 focus-visible:ring-2 focus-visible:ring-purple-500/40 text-sm placeholder:text-gray-400 shadow-sm" />
        </motion.div>
      </motion.header>

      <main className="flex-1 overflow-y-auto px-5 pt-4 space-y-3">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Users className="w-9 h-9 text-purple-600/70" />
            </div>
            <p className="text-gray-800 font-bold text-lg">{t('groups.noGroups')}</p>
            <p className="text-sm text-gray-500 mt-1.5">{t('groups.createFirst')}</p>
          </motion.div>
        ) : (
          filtered.map((g, index) => (
            <GroupCard
              key={g.id}
              group={g}
              isFavorite={favorites.includes(g.id)}
              onToggleFavorite={toggleFavorite}
              onClick={() => onOpenGroup?.(g)}
              index={index}
              t={t}
            />
          ))
        )}
      </main>

      <AnimatePresence>
        {groups.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50 px-2"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenCreateGroup}
              className="w-full bg-white border-2 border-purple-100 rounded-2xl p-4 flex items-center justify-between shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UserPlus className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">{t('groups.createGroup')}</p>
                  <p className="text-[10px] text-gray-500">{t('groups.inviteFriends')}</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl px-4 py-2 flex items-center gap-1.5 shadow-md shadow-purple-500/20">
                <span className="text-xs font-bold">{t('groups.create')}</span><Plus className="w-4 h-4" />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}