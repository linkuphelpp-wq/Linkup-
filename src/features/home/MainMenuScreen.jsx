// MainMenuScreen.jsx
import { useState } from 'react';
import { Copy, Check, Settings, Users, Eye, EyeOff } from 'lucide-react';
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 pb-24">
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-20 px-5 pt-16 pb-5 border-b border-gray-200/60">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">القائمة الرئيسية</h1>
        <p className="text-xs text-gray-500 mt-1">مرحباً بك في LinkUp</p>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pt-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-600 to-blue-500 opacity-5" />

          <div className="relative inline-block mb-4">
            <Avatar className="w-28 h-28 border-4 border-white shadow-xl ring-4 ring-purple-500/10 mx-auto">
              <AvatarImage src={user?.photoURL} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-500 text-white text-4xl font-bold">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <h2 className="text-2xl font-black text-gray-900">{displayName}</h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
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

          <div className="bg-slate-50 rounded-xl p-4 border border-gray-200 flex items-center justify-between group transition-colors hover:border-purple-200">
            <code
              className="text-lg font-mono text-purple-700 font-bold truncate flex-1 text-right select-all"
              dir="ltr"
            >
              @{idVisible ? userHandle : '••••••••'}
            </code>
            <button
              onClick={handleCopy}
              disabled={!username || username === 'غير محدد'}
              className="mr-3 p-3 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <p className="text-[10px] text-gray-500 mt-3 text-center font-medium">
            شارك اسم المستخدم (@{username}) مع أصدقائك ليعثروا عليك بسهولة في جهات الاتصال.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate?.('contacts')}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all active:scale-[0.98] text-right group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <p className="font-bold text-gray-900 text-sm">جهات الاتصال</p>
            <p className="text-xs text-gray-500 mt-0.5">إدارة القائمة</p>
          </button>

          <button
            onClick={() => onNavigate?.('settings')}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all active:scale-[0.98] text-right group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <p className="font-bold text-gray-900 text-sm">الإعدادات</p>
            <p className="text-xs text-gray-500 mt-0.5">تخصيص التطبيق</p>
          </button>
        </div>
      </main>
    </div>
  );
}