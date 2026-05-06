import { useState, useEffect } from 'react';
import { Shield, Palette, Mic, Speaker, Lock, RefreshCw, MessageCircle, Share2, Sparkles, ChevronLeft, Check, Crown, AlertTriangle, X, TabletSmartphone } from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, getDocs, writeBatch, doc, deleteDoc } from 'firebase/firestore';

const SettingRow = ({ icon: Icon, label, desc, onClick, toggle, isToggled, onToggle }) => (
  <div onClick={toggle ? undefined : onClick} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer">
    <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 shrink-0"><Icon className="w-5 h-5" /></div>
    <div className="flex-1 min-w-0 text-right">
      <p className="text-sm font-bold text-gray-900">{label}</p>
      {desc && <p className="text-xs text-gray-500 mt-0.5 truncate">{desc}</p>}
    </div>
    {toggle ? (
      <button onClick={(e) => { e.stopPropagation(); onToggle?.(); }} className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${isToggled ? 'bg-purple-600' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isToggled ? 'translate-x-5' : ''}`} />
      </button>
    ) : <ChevronLeft className="w-4 h-4 text-gray-400 shrink-0" />}
  </div>
);

const SimpleModal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default function SettingsScreen({
  onOpenAtheer, onOpenAbout, onOpenPrivacy, onOpenDataManagement, onOpenAppLock, onOpenProfile,
  onOpenSupport, muteMicOnJoin, speakerDefault, onToggleMuteMic, onToggleSpeaker,
  fontSize, fontFamily, onSelectFontSize, onSelectFontFamily, isAdmin, onOpenAdmin, onOpenPartner
}) {
  const [showFontModal, setShowFontModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetText, setResetText] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('compactMode') === 'true');

  useEffect(() => {
    localStorage.setItem('compactMode', compactMode);
    if (compactMode) {
      document.documentElement.classList.add('compact-ui');
    } else {
      document.documentElement.classList.remove('compact-ui');
    }
  }, [compactMode]);

  const sizes = [{ v: 'small', l: 'صغير' }, { v: 'medium', l: 'متوسط' }, { v: 'large', l: 'كبير' }, { v: 'xlarge', l: 'كبير جداً' }];
  const fonts = [
    { v: 'tajawal', l: 'Tajawal', desc: 'الافتراضي' },
    { v: 'cairo', l: 'Cairo', desc: 'واضح' },    { v: 'rubik', l: 'Rubik', desc: 'ناعم' },
    { v: 'ibm-plex', l: 'IBM Plex', desc: 'مميز', featured: true }
  ];

  const handleResetApp = async () => {
    if (resetText.trim() !== 'حذف') return;
    setResetLoading(true);
    try {
      if (!auth?.currentUser?.uid || !db) throw new Error('فشل المصادقة');
      const batch = writeBatch(db);
      const chatsSnap = await getDocs(query(collection(db, 'chats'), where('participants', 'array-contains', auth.currentUser.uid)));
      chatsSnap.forEach(d => batch.delete(doc(db, 'chats', d.id)));
      await batch.commit();
      localStorage.clear(); sessionStorage.clear();
      window.location.reload();
    } catch(e) { 
      console.error(e); 
      alert('تعذر إعادة الضبط. تأكد من اتصالك أو سجّل الدخول مجدداً.');
    } finally { setResetLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-5 pt-16 pb-4 shadow-sm sticky top-0 z-10 text-center">
        <h1 className="text-lg font-black text-gray-900 tracking-tight">خصّص تجربتك في LinkUp</h1>
      </div>

      <div className="px-5 py-6 space-y-6">
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">الحساب</h3>
          <SettingRow icon={Shield} label="الملف الشخصي" desc="تعديل المعلومات" onClick={onOpenProfile} />
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">المظهر</h3>
          <SettingRow icon={Palette} label="حجم الخط" desc={sizes.find(s => s.v === fontSize)?.l} onClick={() => setShowSizeModal(true)} />
          <SettingRow icon={Palette} label="نوع الخط" desc={fonts.find(f => f.v === fontFamily)?.l} onClick={() => setShowFontModal(true)} />
          <SettingRow icon={TabletSmartphone} label="تصغير الأبعاد" desc="يناسب الشاشات الصغيرة" toggle isToggled={compactMode} onToggle={() => setCompactMode(!compactMode)} />
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">المكالمات</h3>
          <SettingRow icon={Mic} label="كتم الميكروفون تلقائياً" toggle isToggled={muteMicOnJoin} onToggle={onToggleMuteMic} />
          <SettingRow icon={Speaker} label="مكبر الصوت افتراضياً" toggle isToggled={speakerDefault} onToggle={onToggleSpeaker} />
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">الخصوصية</h3>
          <SettingRow icon={Lock} label="قفل التطبيق" onClick={onOpenAppLock} />
          <SettingRow icon={Shield} label="إدارة البيانات" onClick={onOpenDataManagement} />
          <SettingRow icon={RefreshCw} label="إعادة ضبط التطبيق" onClick={() => setShowResetModal(true)} />
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">المزيد</h3>
          <SettingRow icon={MessageCircle} label="تواصل مع المطور" onClick={onOpenSupport} />
          <SettingRow icon={Share2} label="شارك التطبيق" onClick={() => navigator.share?.({ title: 'LinkUp', url: window.location.origin }).catch(() => {})} />
          <SettingRow icon={Sparkles} label="تكوين شراكة" onClick={onOpenPartner} />
          {isAdmin && <SettingRow icon={Shield} label="لوحة الإدارة" onClick={onOpenAdmin} />}
          
          <div className="grid grid-cols-3 gap-3 pt-2">
            <button onClick={onOpenAtheer} className="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-xl">
              <span className="text-xs font-bold text-purple-700">من هو أثير؟</span>
            </button>
            <button onClick={onOpenAbout} className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-xl">
              <span className="text-xs font-bold text-blue-700">من نحن</span>
            </button>
            <button onClick={onOpenPrivacy} className="flex flex-col items-center justify-center p-3 bg-gray-100 rounded-xl">
              <span className="text-xs font-bold text-gray-700">الخصوصية</span>
            </button>
          </div>
        </section>
      </div>

      <SimpleModal open={showSizeModal} onClose={() => setShowSizeModal(false)} title="حجم الخط">
        <div className="space-y-2">
          {sizes.map(s => (
            <button key={s.v} onClick={() => { onSelectFontSize?.(s.v); setShowSizeModal(false); }} className={`w-full p-3 rounded-lg text-right text-sm font-bold flex items-center justify-between ${fontSize === s.v ? 'bg-purple-100 text-purple-700 border-2 border-purple-300' : 'bg-gray-50 text-gray-700'}`}>
              {s.l} {fontSize === s.v && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </SimpleModal>

      <SimpleModal open={showFontModal} onClose={() => setShowFontModal(false)} title="نوع الخط">
        <div className="space-y-2">
          {fonts.map(f => (
            <button key={f.v} onClick={() => { onSelectFontFamily?.(f.v); setShowFontModal(false); }} className={`w-full p-3 rounded-lg text-right text-sm font-bold flex items-center justify-between ${fontFamily === f.v ? 'bg-purple-100 text-purple-700 border-2 border-purple-300' : 'bg-gray-50 text-gray-700'}`}>
              <span className="flex items-center gap-2">{f.l} {f.featured && <Crown className="w-3 h-3 text-yellow-500" />}</span>
              {fontFamily === f.v && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </SimpleModal>

      <SimpleModal open={showResetModal} onClose={() => setShowResetModal(false)} title="تأكيد إعادة الضبط">
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
            <p className="text-sm text-gray-600 text-center">اكتب كلمة <span className="font-bold text-red-600">"حذف"</span> للتأكيد</p>
          </div>
          <input value={resetText} onChange={e => setResetText(e.target.value)} placeholder="اكتب هنا..." className="w-full h-11 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-200 text-center" />
          <div className="flex gap-3">
            <button onClick={() => setShowResetModal(false)} className="flex-1 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 font-medium">إلغاء</button>
            <button onClick={handleResetApp} disabled={resetText.trim() !== 'حذف' || resetLoading} className="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50">
              {resetLoading ? 'جارٍ...' : 'تأكيد'}
            </button>
          </div>
        </div>
      </SimpleModal>
    </div>
  );
}