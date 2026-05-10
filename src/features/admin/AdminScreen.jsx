import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search, Trash2, CheckCircle, XCircle, AlertTriangle, Download, Bell, Key,
  Users, Shield, Zap, UserPlus, ArrowLeft, Copy, Check, Sparkles
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import {
  collection, query, getDocs, onSnapshot, doc, updateDoc, deleteDoc,
  writeBatch, orderBy, limit, addDoc, serverTimestamp, setDoc, where
} from 'firebase/firestore';
import { useLanguage } from '../../context/LanguageContext';

const StatCard = ({ icon: Icon, label, value, color, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
    whileHover={{ y: -5, boxShadow: '0 16px 32px -8px rgba(0,0,0,0.15)' }}
    className="group relative bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
  >
    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full" />
    <div className="flex items-start justify-between mb-3">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
          {trend}
        </span>
      )}
    </div>
    <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
    <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
  </motion.div>
);

const StatusBadge = ({ status, t }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
    status === 'banned'
      ? 'bg-red-50 text-red-600 border-red-100'
      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${status === 'banned' ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
    {status === 'banned' ? t('admin.banned') : t('admin.active')}
  </span>
);

export default function AdminScreen({ onBack }) {
  const { t } = useLanguage();
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
      return created && (Date.now() - created.getTime() < 24 * 60 * 60 * 1000);
    }).length
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const logAction = async (action, targetUserId, details = '') => {
    if (!adminId) return;
    try { await addDoc(collection(db, 'admin_logs'), { action, adminId, targetUserId, details, timestamp: serverTimestamp() }); }
    catch (e) { console.error('log error', e); }
  };

  useEffect(() => {
    const fetchServer = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
        const snap = await getDocs(q, { source: 'server' });
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchServer();

    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsubscribe();
  }, []);

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
      showToast(newStatus === 'banned' ? t('admin.banSuccess') : t('admin.unbanSuccess'));
      refreshUsers();
    } catch (e) { showToast(t('admin.updateFailed'), 'error'); }
    finally { setActionLoading(null); }
  };

  const deleteUser = async (userId, username) => {
    if (!confirm(t('admin.confirmDelete', { username: username || userId }))) return;
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
      showToast(t('admin.deleteSuccess'));
      refreshUsers();
    } catch (e) { showToast(t('admin.deleteFailed'), 'error'); }
    finally { setActionLoading(null); }
  };

  const sendWarning = async (userId) => {
    if (!warningText.trim()) return;
    setActionLoading(`warn-${userId}`);
    try {
      await updateDoc(doc(db, 'users', userId), { warning: { message: warningText.trim(), timestamp: new Date() } });
      await logAction('warn_user', userId, warningText.trim());
      showToast(t('admin.warningSent'));
      setShowWarning(null); setWarningText(''); refreshUsers();
    } catch (e) { showToast(t('admin.updateFailed'), 'error'); }
    finally { setActionLoading(null); }
  };

  const sendBroadcast = async () => {
    if (!broadcastText.trim()) return;
    setActionLoading('broadcast');
    try {
      await addDoc(collection(db, 'notifications'), { message: broadcastText.trim(), timestamp: serverTimestamp() });
      await logAction('broadcast', null, broadcastText.trim());
      showToast(t('admin.broadcastSent'));
      setBroadcastText(''); setShowBroadcast(false);
    } catch (e) { showToast(t('admin.updateFailed'), 'error'); }
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
      showToast(t('admin.keyGenerated', { key }));
    } catch (e) {
      console.error('generateKey error', e);
      showToast(t('admin.keyFailed'), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const exportCSV = () => {
    let csv = 'email,username,status,createdAt\n';
    (users || []).forEach(u => { csv += `${u.email},${u.username || ''},${u.status},${u.createdAt?.toDate?.()?.toISOString() || ''}\n`; });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`; link.click();
    showToast(t('admin.exported'));
  };

  const filteredUsers = (users || []).filter(u =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-24 text-right" dir="rtl">
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-5 pt-12 pb-4 shadow-sm"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95 shrink-0">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-purple-500" />
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('admin.title')}</h1>
                </div>
                <p className="text-sm text-gray-500 mt-1">{t('admin.subtitle')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateInviteKey}
                disabled={actionLoading === 'key'}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs px-4 py-2 shadow-md shadow-emerald-500/20 transition-all active:scale-95 shrink-0 flex items-center gap-1.5 font-bold"
              >
                <Key className="w-3.5 h-3.5" /> {t('admin.inviteKey')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBroadcast(true)}
                className="rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs px-4 py-2 transition-all active:scale-95 shrink-0 flex items-center gap-1.5 font-bold"
              >
                <Bell className="w-3.5 h-3.5" /> {t('admin.broadcast')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportCSV}
                className="rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs px-4 py-2 transition-all active:scale-95 shrink-0 flex items-center gap-1.5 font-bold"
              >
                <Download className="w-3.5 h-3.5" /> {t('admin.exportCSV')}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label={t('admin.totalUsers')} value={stats.total} color="from-blue-500 to-cyan-500" delay={0.1} />
          <StatCard icon={Zap} label={t('admin.activeNow')} value={stats.active} color="from-emerald-500 to-teal-500" trend={`${stats.total ? Math.round((stats.active / stats.total) * 100) : 0}%`} delay={0.2} />
          <StatCard icon={Shield} label={t('admin.bannedUsers')} value={stats.banned} color="from-red-500 to-rose-500" delay={0.3} />
          <StatCard icon={UserPlus} label={t('admin.joinedToday')} value={stats.newToday} color="from-purple-500 to-indigo-500" delay={0.4} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-white rounded-2xl p-4 border border-gray-100/80 shadow-sm flex flex-col md:flex-row gap-4 items-center"
        >
          <div className="relative flex-1 w-full group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
            <Input
              placeholder={t('admin.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pr-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-purple-200 focus:bg-white transition-all text-sm"
            />
          </div>
          <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-full shrink-0">
            {t('admin.showing', { count: filteredUsers.length, total: stats.total })}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-medium">{t('common.loading')}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 text-gray-400"
            >
              <Users className="w-16 h-16 mx-auto mb-3 opacity-40" />
              <p className="font-medium text-lg">{t('admin.noResults')}</p>
              <p className="text-sm mt-1">{t('admin.noResultsDesc')}</p>
            </motion.div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredUsers.map((u, index) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  whileHover={{ backgroundColor: '#faf5ff' }}
                  className="p-4 transition-colors duration-200 group/row"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm shrink-0 group-hover/row:scale-105 transition-transform duration-300">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold text-sm">
                          {u.email?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 text-right flex-1">
                        <p className="font-bold text-gray-900 truncate text-sm group-hover/row:text-purple-700 transition-colors">
                          {u.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 font-mono">
                          @{u.username || t('admin.unknown')}
                        </p>
                      </div>
                      <StatusBadge status={u.status} t={t} />
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      {showWarning === u.id ? (
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center gap-2 bg-white rounded-xl p-1.5 shadow-lg border border-gray-200 w-full md:w-auto"
                        >
                          <Input
                            autoFocus
                            value={warningText}
                            onChange={e => setWarningText(e.target.value)}
                            placeholder={t('admin.warningPlaceholder')}
                            className="h-8 text-xs rounded-lg bg-gray-50 border-gray-200"
                          />
                          <Button
                            size="sm"
                            onClick={() => sendWarning(u.id)}
                            disabled={!warningText.trim()}
                            className="h-8 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold"
                          >
                            {t('common.send')}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowWarning(null)}
                            className="h-8 w-8 p-0 text-gray-400"
                          >
                            ✕
                          </Button>
                        </motion.div>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { setShowWarning(u.id); setWarningText(''); }}
                            className="p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all"
                            title={t('admin.warn')}
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleBan(u.id, u.status)}
                            className={`p-2.5 rounded-xl transition-all ${
                              u.status === 'banned'
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                            title={u.status === 'banned' ? t('admin.unban') : t('admin.ban')}
                          >
                            {u.status === 'banned' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteUser(u.id, u.username)}
                            className="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
                            title={t('admin.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <AnimatePresence>
        {showBroadcast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40 backdrop-blur-md"
            onClick={() => setShowBroadcast(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-bold text-gray-900">{t('admin.broadcast')}</h3>
                </div>
                <button
                  onClick={() => setShowBroadcast(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>
              <textarea
                value={broadcastText}
                onChange={e => setBroadcastText(e.target.value)}
                placeholder={t('admin.broadcastPlaceholder')}
                rows={4}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-purple-200 focus:border-transparent outline-none resize-none mb-4 transition-all"
              />
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowBroadcast(false)}
                  className="flex-1 h-11 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 font-medium transition-all"
                >
                  {t('common.cancel')}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={sendBroadcast}
                  disabled={!broadcastText.trim() || actionLoading === 'broadcast'}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
                >
                  {actionLoading === 'broadcast' ? t('common.loading') : t('admin.sendToAll')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {generatedKey && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[90%]"
          >
            <Key className="w-5 h-5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs opacity-80 mb-0.5">{t('admin.inviteKey')}</p>
              <p className="font-mono font-bold text-sm truncate">{generatedKey}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => copyToClipboard(generatedKey)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors shrink-0"
              title={copied ? t('common.copied') : t('common.copyAgain')}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setGeneratedKey('')}
              className="p-2 hover:bg-red-400/30 rounded-lg transition-colors shrink-0"
            >
              ×
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 ${
              toast.type === 'error' ? 'bg-red-600' : 'bg-gray-900'
            } text-white`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}