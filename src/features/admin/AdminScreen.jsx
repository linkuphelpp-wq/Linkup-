import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, Trash2, CheckCircle, XCircle, AlertTriangle, Download, Bell, Key, 
  Users, Shield, Zap, UserPlus, ArrowLeft, Copy, Check
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { 
  collection, query, getDocs, onSnapshot, doc, updateDoc, deleteDoc, 
  writeBatch, orderBy, limit, addDoc, serverTimestamp, setDoc, where 
} from 'firebase/firestore';

// ───────── بطاقة إحصائية ─────────
const StatCard = ({ icon: Icon, label, value, color, trend }) => (
  <div className="group relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
    <div className={`absolute top-0 left-0 w-1 h-full ${color} rounded-r-full opacity-60 group-hover:opacity-100 transition-opacity`} />
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} text-white shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">{trend}</span>}
    </div>
    <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
    <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
  </div>
);

// ───────── شارة الحالة ─────────
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
    status === 'banned' 
      ? 'bg-red-50 text-red-600 border-red-100' 
      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${status === 'banned' ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
    {status === 'banned' ? 'محظور' : 'نشط'}
  </span>
);

export default function AdminScreen({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [showWarning, setShowWarning] = useState(null);
  const [warningText, setWarningText] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [copied, setCopied] = useState(false);

  const adminId = auth.currentUser?.uid;

  const stats = {
    total: users?.length || 0,
    active: (users || []).filter(u => u.status !== 'banned').length,
    banned: (users || []).filter(u => u.status === 'banned').length,
    newToday: (users || []).filter(u => {
      const created = u.createdAt?.toDate?.();
      return created && (Date.now() - created.getTime() < 24*60*60*1000);
    }).length
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const logAction = async (action, targetUserId, details = '') => {
    if (!adminId) return;
    try { await addDoc(collection(db, 'admin_logs'), { action, adminId, targetUserId, details, timestamp: serverTimestamp() }); } 
    catch(e) { console.error('log error', e); }
  };

  // ✅ جلب المستخدمين من الخادم مباشرة مع مستمع حي
  useEffect(() => {
    const fetchServer = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
        const snap = await getDocs(q, { source: 'server' }); // تجاهل الكاش تماماً
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchServer();

    // مستمع حي للتغييرات اللاحقة
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsubscribe();
  }, []);

  // ✅ دالة تحديث القائمة من الخادم عند الحاجة
  const refreshUsers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
      const snap = await getDocs(q, { source: 'server' });
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };

  const toggleBan = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'banned' ? 'online' : 'banned';
    setActionLoading(userId);
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      await logAction(newStatus === 'banned' ? 'ban_user' : 'unban_user', userId);
      showToast(newStatus === 'banned' ? 'تم حظر المستخدم' : 'تم فك الحظر');
      refreshUsers();
    } catch (e) { showToast('فشل في تحديث الحالة', 'error'); }
    finally { setActionLoading(null); }
  };

  const deleteUser = async (userId, username) => {
    if (!confirm(`حذف نهائي لـ ${username || userId}؟ لا يمكن التراجع.`)) return;
    setActionLoading(userId);
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'users', userId));
      if (username) batch.delete(doc(db, 'usernames', username));
      const chatsQuery = query(collection(db, 'chats'), where('participants', 'array-contains', userId));
      const chatsSnap = await getDocs(chatsQuery);
      chatsSnap.forEach(chatDoc => batch.delete(doc(db, 'chats', chatDoc.id)));
      await batch.commit();
      await logAction('delete_user', userId, `username: ${username}`);
      showToast('تم الحذف بنجاح');
      refreshUsers();
    } catch (e) { showToast('خطأ في الحذف', 'error'); }
    finally { setActionLoading(null); }
  };

  const sendWarning = async (userId) => {
    if (!warningText.trim()) return;
    setActionLoading(`warn-${userId}`);
    try {
      await updateDoc(doc(db, 'users', userId), { warning: { message: warningText.trim(), timestamp: new Date() } });
      await logAction('warn_user', userId, warningText.trim());
      showToast('تم إرسال التحذير');
      setShowWarning(null); setWarningText(''); refreshUsers();
    } catch (e) { showToast('فشل الإرسال', 'error'); }
    finally { setActionLoading(null); }
  };

  const sendBroadcast = async () => {
    if (!broadcastText.trim()) return;
    setActionLoading('broadcast');
    try {
      await addDoc(collection(db, 'notifications'), { message: broadcastText.trim(), timestamp: serverTimestamp() });
      await logAction('broadcast', null, broadcastText.trim());
      showToast('تم إرسال الإشعار العام');
      setBroadcastText(''); setShowBroadcast(false);
    } catch(e) { showToast('فشل الإرسال', 'error'); }
    finally { setActionLoading(null); }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateInviteKey = async () => {
    setActionLoading('key');
    try {
      const key = 'ADM-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      await setDoc(doc(db, 'adminInvites', key), { 
        used: false, 
        createdAt: serverTimestamp(), 
        createdBy: auth.currentUser?.uid 
      });
      setGeneratedKey(key);
      await copyToClipboard(key);
      showToast(`✅ تم إنشاء ونسخ المفتاح: ${key}`);
    } catch (e) { 
      console.error('generateKey error', e);
      showToast('فشل إنشاء المفتاح', 'error'); 
    } finally { 
      setActionLoading(null); 
    }
  };

  const exportCSV = () => {
    let csv = 'email,username,status,createdAt\n';
    (users || []).forEach(u => { csv += `${u.email},${u.username || ''},${u.status},${u.createdAt?.toDate?.()?.toISOString() || ''}\n`; });
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`; link.click();
    showToast('تم التصدير');
  };

  const filteredUsers = (users || []).filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] pb-24 relative">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm" style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button onClick={onBack} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95 shrink-0">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight">لوحة الإدارة</h1>
                <p className="text-xs text-gray-500 font-medium mt-0.5">مراقبة وتحكم كامل</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap justify-end sm:justify-start w-full sm:w-auto">
              <Button onClick={generateInviteKey} disabled={actionLoading === 'key'} size="sm" className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs px-3 py-2 shadow-md shadow-emerald-500/20 transition-all active:scale-95 shrink-0">
                <Key className="w-3.5 h-3.5 ml-1.5" /> مفتاح
              </Button>
              <Button onClick={() => setShowBroadcast(true)} size="sm" variant="outline" className="rounded-xl text-xs px-3 py-2 border-gray-200 hover:bg-gray-50 transition-all active:scale-95 shrink-0">
                <Bell className="w-3.5 h-3.5 ml-1.5" /> إشعار
              </Button>
              <Button onClick={exportCSV} size="sm" variant="outline" className="rounded-xl text-xs px-3 py-2 border-gray-200 hover:bg-gray-50 transition-all active:scale-95 shrink-0">
                <Download className="w-3.5 h-3.5 ml-1.5" /> تصدير
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <StatCard icon={Users} label="إجمالي المستخدمين" value={stats.total} color="from-blue-500 to-cyan-500" />
          <StatCard icon={Zap} label="نشط الآن" value={stats.active} color="from-emerald-500 to-teal-500" trend={`${stats.total ? Math.round((stats.active/stats.total)*100) : 0}%`} />
          <StatCard icon={Shield} label="محظورين" value={stats.banned} color="from-red-500 to-rose-500" />
          <StatCard icon={UserPlus} label="انضموا اليوم" value={stats.newToday} color="from-purple-500 to-indigo-500" />
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="relative flex-1 w-full group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
            <Input placeholder="بحث بالبريد أو المعرف..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pr-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-purple-200 focus:bg-white transition-all" />
          </div>
          <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-full shrink-0">
            عرض {filteredUsers.length} / {stats.total}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">جاري تحميل البيانات...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users className="w-14 h-14 mx-auto mb-3 opacity-40" />
              <p className="font-medium">لا يوجد نتائج مطابقة</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredUsers.map((u) => (
                <div key={u.id} className="p-4 hover:bg-purple-50/30 transition-colors duration-200 group/row">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm shrink-0 group-hover/row:scale-105 transition-transform duration-300">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold text-sm">{u.email?.charAt(0)?.toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 text-right flex-1">
                        <p className="font-bold text-gray-900 truncate text-sm group-hover/row:text-purple-700 transition-colors">{u.email}</p>
                        <p className="text-xs text-gray-500 mt-0.5 font-mono">@{u.username || 'غير محدد'}</p>
                      </div>
                      <StatusBadge status={u.status} />
                    </div>
                    
                    <div className="flex items-center gap-2 justify-end opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 md:opacity-100">
                      {showWarning === u.id ? (
                        <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 shadow-lg border border-gray-200 w-full md:w-auto animate-in zoom-in-95 duration-200">
                          <Input autoFocus value={warningText} onChange={e => setWarningText(e.target.value)} placeholder="نص التحذير..." className="h-8 text-xs rounded-lg bg-gray-50 border-gray-200" />
                          <Button size="sm" onClick={() => sendWarning(u.id)} disabled={!warningText.trim()} className="h-8 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold">إرسال</Button>
                          <Button size="sm" variant="ghost" onClick={() => setShowWarning(null)} className="h-8 w-8 p-0 text-gray-400">✕</Button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => { setShowWarning(u.id); setWarningText(''); }} className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all active:scale-95"><AlertTriangle className="w-4 h-4" /></button>
                          <button onClick={() => toggleBan(u.id, u.status)} className={`p-2 rounded-lg transition-all active:scale-95 ${u.status === 'banned' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                            {u.status === 'banned' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </button>
                          <button onClick={() => deleteUser(u.id, u.username)} className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showBroadcast && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowBroadcast(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">إشعار عام</h3>
              <button onClick={() => setShowBroadcast(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><span className="text-lg leading-none">×</span></button>
            </div>
            <textarea value={broadcastText} onChange={e => setBroadcastText(e.target.value)} placeholder="اكتب رسالة الإشعار..." rows={4} className="w-full rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-purple-200 focus:border-transparent outline-none resize-none mb-4 transition-all" />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowBroadcast(false)} className="flex-1 h-11 rounded-xl border-gray-200">إلغاء</Button>
              <Button onClick={sendBroadcast} disabled={!broadcastText.trim() || actionLoading === 'broadcast'} className="flex-1 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold shadow-md shadow-purple-500/20 transition-all">
                {actionLoading === 'broadcast' ? 'جارٍ...' : 'إرسال للجميع'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {generatedKey && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300 max-w-[90%]">
          <Key className="w-5 h-5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs opacity-80 mb-0.5">مفتاح الدعوة</p>
            <p className="font-mono font-bold text-sm truncate">{generatedKey}</p>
          </div>
          <button onClick={() => copyToClipboard(generatedKey)} className="p-2 hover:bg-white/20 rounded-lg transition-colors shrink-0" title={copied ? 'تم النسخ' : 'نسخ مجدداً'}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button onClick={() => setGeneratedKey('')} className="p-2 hover:bg-red-400/30 rounded-lg transition-colors shrink-0">×</button>
        </div>
      )}

      {toast.show && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300 ${toast.type === 'error' ? 'bg-red-600' : 'bg-gray-900'} text-white`}>
          {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}