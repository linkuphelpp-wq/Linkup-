import { useState } from 'react';

export default function SupportScreen({ onBack }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText('Linkup.helpp@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50" dir="rtl">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-5 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95">
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">تواصل مع المطور</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 pb-24 space-y-5">
        <div className="text-center mb-2">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <p className="text-sm text-gray-600">نحن هنا لمساعدتك. اختر القناة المناسبة وسنرد خلال 24 ساعة.</p>
        </div>

        <a href="mailto:Linkup.helpp@gmail.com" className="group block bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">البريد الإلكتروني</p>
              <p className="text-xs text-gray-500 mt-0.5 font-mono">Linkup.helpp@gmail.com</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </a>

        <a href="https://wa.me/966500000000" target="_blank" rel="noopener noreferrer" className="group block bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-green-200 hover:shadow-md transition-all active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">واتساب</p>
              <p className="text-xs text-gray-500 mt-0.5">تواصل مباشر وسريع</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </a>

        <button onClick={handleCopy} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2 active:scale-[0.98]">
          {copied ? (
            <><svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> تم نسخ البريد بنجاح</>
          ) : (
            <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> نسخ عنوان البريد الإلكتروني</>
          )}
        </button>
      </main>
    </div>
  );
}