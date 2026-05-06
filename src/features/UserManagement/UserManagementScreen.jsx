import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Search, UserCheck, RefreshCw, Mail, Phone, Calendar } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, getDocs, onSnapshot, orderBy, limit } from 'firebase/firestore';

// ───────── شارة الحالة ─────────
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
    status === 'banned' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${status === 'banned' ? 'bg-red-500' : 'bg-emerald-500'}`} />
    {status === 'banned' ? 'محظور' : 'نشط'}
  </span>
);

// ───────── صف معلومات ─────────
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
    <Icon className="w-4 h-4 text-gray-500 shrink-0" />
    <div className="flex-1 text-right">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm font-bold text-gray-900 truncate">{value || '—'}</p>
    </div>
  </div>
);

export default function UserManagementScreen({ onBack }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ جلب من الخادم مباشرة، ثم مستمع حي
  useEffect(() => {
    // جلب أولي من الخادم
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
        const snap = await getDocs(q, { source: 'server' }); // تجاهل الكاش
        setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error('خطأ جلب الخادم:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // مستمع حي للتحديثات اللاحقة
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  // زر التحديث اليدوي
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q, { source: 'server' });
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 pb-24">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-5 pt-16 pb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">إدارة المستخدمين</h2>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-full"
            title="تحديث القائمة من الخادم"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="البحث بالاسم، البريد، أو المعرف..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pr-12 h-12 rounded-xl bg-white border-gray-200 shadow-sm focus-visible:ring-purple-200"
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pt-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 opacity-50">
            <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 font-bold text-lg">لا يوجد مستخدمين</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map(u => (
              <div key={u.id}
                onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                className={`bg-white rounded-2xl p-4 border shadow-sm cursor-pointer transition-all ${
                  selectedUser?.id === u.id ? 'border-purple-300 shadow-md' : 'border-gray-100 hover:border-purple-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold">
                      {(u.displayName || u.email || '?').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="font-bold text-gray-900 truncate">{u.displayName || u.email}</p>
                    <p className="text-xs text-gray-500">@{u.username || 'غير محدد'}</p>
                  </div>
                  <StatusBadge status={u.status} />
                </div>
                {selectedUser?.id === u.id && (
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                    <InfoRow icon={Mail} label="البريد الإلكتروني" value={u.email} />
                    <InfoRow icon={Phone} label="رقم الهاتف" value={u.phone || 'غير مسجل'} />
                    <InfoRow icon={Calendar} label="تاريخ الانضمام" value={u.createdAt?.toDate?.().toLocaleDateString('ar-SA') || '—'} />
                    <InfoRow icon={UserCheck} label="حالة الحساب" value={u.status === 'banned' ? 'محظور' : 'نشط'} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}