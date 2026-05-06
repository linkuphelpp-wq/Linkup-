import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Users, Grid3x3, List, MoreVertical, Star, UserPlus, X, ExternalLink, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db, auth } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

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

// 🎨 بطاقة مجموعة بتصميم واتسابي – مع آخر رسالة حية
const GroupCard = ({ group, isFavorite, onToggleFavorite, onClick }) => {
  const [lastMsg, setLastMsg] = useState(null);
  const [membersData, setMembersData] = useState([]);
  const memberCount = group.members?.length || 0;

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

  useEffect(() => {
    if (!group.members) return;
    Promise.all(group.members.slice(0, 3).map(async (uid) => {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) return { uid, name: snap.data().displayName || uid.charAt(0).toUpperCase() };
      return { uid, name: uid.charAt(0).toUpperCase() };
    })).then(arr => setMembersData(arr));
  }, [group.members]);

  const gradient = 'from-purple-500 to-indigo-500';
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.98] cursor-pointer" onClick={() => onClick?.()}>
      <div className="relative">
        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
          <Users className="w-6 h-6 text-white" />
        </div>
        {isFavorite && <Star className="absolute -top-1 -right-1 w-5 h-5 text-yellow-500 fill-yellow-500" />}
      </div>
      <div className="flex-1 min-w-0 text-right">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 truncate">{group.name || 'مجموعة'}</h3>
          <span className="text-xs text-gray-400">{memberCount} أعضاء</span>
        </div>
        <p className="text-xs text-gray-500 mt-1 truncate">
          {lastMsg?.text || 'ابدأ المحادثة'}
        </p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(group.id); }} className="p-2 rounded-full hover:bg-gray-100">
        <Star className={`w-4 h-4 ${isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
      </button>
    </div>
  );
};

export default function GroupsScreen({ onBack, onOpenCreateGroup, onOpenGroup }) {
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
    <div className="min-h-screen flex flex-col bg-slate-50/50 pb-24">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-5">
          <LinkUpLogo />
          <button onClick={onOpenCreateGroup} className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-4">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">المجموعات</h1>
          <p className="text-sm text-gray-500 mt-1">تعاون وتواصل مع فرقك بسهولة</p>
        </div>
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input placeholder="ابحث عن مجموعة..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-12 pr-12 pl-4 rounded-2xl bg-white border-gray-200 focus-visible:ring-purple-500/40 text-sm placeholder:text-gray-400 shadow-sm" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pt-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Users className="w-9 h-9 text-purple-600/70" />
            </div>
            <p className="text-gray-800 font-bold text-lg">لا توجد مجموعات</p>
            <p className="text-sm text-gray-500 mt-1.5">ابدأ بإنشاء مجموعتك الأولى</p>
          </div>
        ) : (
          filtered.map(g => (
            <GroupCard
              key={g.id}
              group={g}
              isFavorite={favorites.includes(g.id)}
              onToggleFavorite={toggleFavorite}
              onClick={() => onOpenGroup?.(g)}
            />
          ))
        )}
      </main>

      {/* زر إنشاء مجموعة (يظهر فقط إذا لم تكن هناك مجموعات) */}
      {groups.length === 0 && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50 px-2">
          <button onClick={onOpenCreateGroup} className="w-full bg-white border-2 border-purple-100 rounded-2xl p-4 flex items-center justify-between shadow-lg hover:shadow-xl hover:border-purple-300 transition-all active:scale-[0.98] group">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserPlus className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 text-sm">إنشاء مجموعة جديدة</p>
                <p className="text-[10px] text-gray-500">ادعُ أصدقاءك وابدأ النقاش</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl px-4 py-2 flex items-center gap-1.5 shadow-md shadow-purple-500/20">
              <span className="text-xs font-bold">إنشاء</span><Plus className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}