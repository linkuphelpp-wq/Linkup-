import { useState } from 'react';
import { ArrowLeft, Lock, Fingerprint, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AppLockScreen({ onBack }) {
  const [enabled, setEnabled] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 relative overflow-hidden">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-5 pt-16 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">قفل التطبيق</h1>
        </div>
      </header>

      <main className="px-5 pt-8 space-y-6 relative z-10">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600"><Lock className="w-6 h-6" /></div>
            <div>
              <p className="font-bold text-gray-900 text-base">تفعيل القفل الأمني</p>
              <p className="text-xs text-gray-500 mt-1">طلب رمز PIN عند كل فتح</p>
            </div>
          </div>
          <button 
            onClick={() => setEnabled(!enabled)} 
            className={`w-14 h-8 rounded-full transition-colors relative ${enabled ? 'bg-purple-600' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-6' : ''}`} />
          </button>
        </div>

        {enabled && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5 animate-in fade-in slide-in-from-top-4">
            <label className="text-sm font-bold text-gray-700 block">تعيين رمز PIN</label>
            <div className="relative">
              <Input 
                type={showPin ? 'text' : 'password'} 
                value={pin} 
                onChange={e => setPin(e.target.value)} 
                placeholder="مثال: 1234" 
                maxLength={6}
                className="h-14 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-purple-200 text-center tracking-[0.5em] text-xl font-mono"
              />
              <button onClick={() => setShowPin(!showPin)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 p-4 rounded-xl">
              <Fingerprint className="w-5 h-5 text-purple-600 shrink-0" />
              <span>يمكنك تفعيل البصمة لاحقاً من إعدادات النظام</span>
            </div>
            <Button className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-xl font-bold text-base shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98]">حفظ القفل</Button>
          </div>
        )}
      </main>
    </div>
  );
}