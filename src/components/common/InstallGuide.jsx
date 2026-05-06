import { useState } from 'react';
import { X } from 'lucide-react';

export default function InstallGuide({ onDismiss, deferredPrompt, isInstalled }) {
  const [showSteps, setShowSteps] = useState(false);

  if (isInstalled) return null;

  const handleAutoInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        return;
      }
    } else {
      setShowSteps(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] p-6 w-full max-w-sm shadow-2xl text-center relative border border-white/50 overflow-hidden">
        
        {/* خلفية زخرفية علوية */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-indigo-50 to-white -z-10" />

        {/* زر الإغلاق */}
        <button
          onClick={onDismiss}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition-all active:scale-95 z-10 backdrop-blur-sm"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {/* أيقونة التطبيق الحقيقية */}
        <div className="mb-5 flex justify-center">
          <div className="relative">
            {/* حلقة خارجية متدرجة */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 blur-md opacity-75" />
            {/* الإطار الأساسي */}
            <div className="relative w-20 h-20 rounded-[1.75rem] bg-white p-1 shadow-xl">
              <img
                src="/icon-512.png"  // استخدم المسار الصحيح لأيقونتك
                alt="أيقونة التطبيق"
                className="w-full h-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>

        {/* العنوان والوصف */}
        <h2 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">ثبّت التطبيق</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed px-2">
          وصول أسرع، تجربة أفضل، بدون متصفح
        </p>

        {/* زر التثبيت السريع */}
        {deferredPrompt && (
          <button
            onClick={handleAutoInstall}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.97] mb-3 flex items-center justify-center gap-2 group"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:animate-bounce">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تثبيت سريع
          </button>
        )}

        {/* زر عرض الخطوات اليدوية */}
        <button
          onClick={() => setShowSteps(!showSteps)}
          className={`w-full font-semibold py-3.5 px-6 rounded-2xl transition-all active:scale-[0.97] flex items-center justify-center gap-2 border ${
            showSteps 
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1.5" fill={showSteps ? 'currentColor' : 'none'}/>
            <circle cx="12" cy="12" r="1.5" fill={showSteps ? 'currentColor' : 'none'}/>
            <circle cx="12" cy="19" r="1.5" fill={showSteps ? 'currentColor' : 'none'}/>
          </svg>
          طريقة التثبيت اليدوي
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${showSteps ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {/* الخطوات التفصيلية */}
        {showSteps && (
          <div className="mt-3 text-right text-sm text-gray-700 bg-gradient-to-b from-indigo-50/50 to-white p-5 rounded-2xl border border-indigo-100 animate-in slide-in-from-top-2 duration-200">
            <p className="font-bold text-center mb-4 text-gray-800">
              🪄 خطوات سهلة
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">1</div>
                <p className="leading-relaxed">اضغط <strong>⋮</strong> في المتصفح</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">2</div>
                <p className="leading-relaxed">اختر <strong>"تثبيت التطبيق"</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">3</div>
                <p className="leading-relaxed">الأيقونة تظهر على شاشتك</p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-indigo-100 text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Chrome • Edge • Safari
              </p>
            </div>
          </div>
        )}

        {/* زر التذكير لاحقاً */}
        <button
          onClick={onDismiss}
          className="w-full mt-4 text-gray-400 hover:text-gray-600 text-sm py-2.5 transition-colors font-medium"
        >
          لاحقاً
        </button>
      </div>
    </div>
  );
}