import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, Trash2, Database, Cloud, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, getDocs, writeBatch, doc, deleteDoc } from 'firebase/firestore';

export default function DataManagementScreen({ onBack }) {
  const [loading, setLoading] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const user = auth.currentUser;

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
  };

  const handleExport = async () => {
    if (!user) return;
    setLoading('export');
    try {
      const chatsRef = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
      const snap = await getDocs(chatsRef);
      const data = snap.docs.map(d => d.data());
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `linkup_backup_${Date.now()}.json`;
      a.click(); URL.revokeObjectURL(url);
      showToast('تم تصدير البيانات بنجاح');
    } catch (e) { showToast('فشل التصدير', 'error'); }
    finally { setLoading(null); }
  };

  const handleClearCache = () => {
    setLoading('cache');
    setTimeout(() => {
      localStorage.removeItem('vibecall_has_seen_welcome');
      sessionStorage.clear();
      showToast('تم مسح ذاكرة التخزين المؤقت');
      setLoading(null);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-5 pt-16 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">إدارة البيانات</h1>
        </div>
        <p className="text-xs text-gray-500">تحكم كامل في بياناتك ونسخك الاحتياطي</p>      </header>

      <main className="px-5 pt-6 space-y-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600"><Database className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-gray-900">النسخ الاحتياطي</h3>
              <p className="text-xs text-gray-500">حفظ محادثاتك وبياناتك بأمان</p>
            </div>
          </div>
          <Button onClick={handleExport} disabled={loading === 'export'} className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50">
            {loading === 'export' ? 'جارٍ التصدير...' : <><Download className="w-4 h-4 ml-2" /> تصدير البيانات (JSON)</>}
          </Button>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600"><Cloud className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-gray-900">مسح الذاكرة المؤقتة</h3>
              <p className="text-xs text-gray-500">تسريع التطبيق وحل مشاكل العرض</p>
            </div>
          </div>
          <Button onClick={handleClearCache} disabled={loading === 'cache'} variant="outline" className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50">
            {loading === 'cache' ? 'جارٍ المسح...' : <><Upload className="w-4 h-4 ml-2" /> مسح الكاش</>}
          </Button>
        </div>

        <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-red-100 text-red-600"><AlertTriangle className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-red-800">منطقة الخطر</h3>
              <p className="text-xs text-red-600">إجراءات لا يمكن التراجع عنها</p>
            </div>
          </div>
          <p className="text-xs text-red-700 mb-4 leading-relaxed">
            حذف البيانات سيؤدي إلى إزالة جميع المحادثات، الإعدادات، والبيانات المحلية. لن يتم حذف حسابك من الخادم.
          </p>
          <Button variant="destructive" className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all active:scale-[0.98]">
            <Trash2 className="w-4 h-4 ml-2" /> حذف البيانات المحلية
          </Button>
        </div>
      </main>

      {toast.show && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-4 ${toast.type === 'error' ? 'bg-red-600' : 'bg-gray-900'} text-white`}>
          {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
          <span className="text-sm font-medium">{toast.msg}</span>        </div>
      )}
    </div>
  );
}