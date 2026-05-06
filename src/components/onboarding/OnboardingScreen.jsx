import { useState } from 'react';

const slides = [
  {
    id: 1,
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: 'تأكيد الحساب بسرعة',
    description: 'سجّل دخولك بحساب Google وتأكد من بريدك الإلكتروني لتصبح جاهزاً للتواصل.',
  },
  {
    id: 2,
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'أضف أصدقاءك',
    description: 'ابحث عن أصدقائك باستخدام معرفهم الفريد وأضفهم إلى جهات اتصالك.',
  },
  {
    id: 3,
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    ),
    title: 'مكالمات صوتية وفيديو',
    description: 'اتصل بأصدقائك صوتياً أو فيديو مباشرة من جهات الاتصال.',
  },
  {
    id: 4,
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <line x1="8" y1="8" x2="16" y2="8" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="8" y1="16" x2="12" y2="16" />
      </svg>
    ),
    title: 'محادثات نصية فورية',
    description: 'تبادل الرسائل النصية مع أصدقائك أثناء المكالمات أو في أي وقت.',
  },
  {
    id: 5,
    icon: (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: 'خصوصية وأمان',
    description: 'محادثاتك ومكالماتك مشفرة ولا يمكن لأحد الاطلاع عليها.',
  },
];

export default function OnboardingScreen({ onFinish }) {
  const [current, setCurrent] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else handleFinish();
  };

  const prev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const handleFinish = () => {
    setIsExiting(true);
    setTimeout(() => onFinish(), 600);
  };

  return (
    <div className={`fixed inset-0 bg-[#0e0e1a] flex flex-col items-center justify-between py-12 px-6 transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute top-6 right-6 text-xs font-medium text-gray-600 uppercase tracking-[0.15em]">LinkUp</div>
      <button onClick={handleFinish} className="absolute top-6 left-6 text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors">تخطي</button>

      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm">
        <div className="mb-8 text-blue-500">{slides[current].icon}</div>
        <h2 className="text-2xl font-bold text-white mb-3">{slides[current].title}</h2>
        <p className="text-gray-400 leading-relaxed text-sm">{slides[current].description}</p>
      </div>

      <div className="w-full max-w-xs">
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-blue-500' : 'w-1.5 bg-gray-700'}`} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <button onClick={prev} disabled={current === 0} className={`text-sm font-medium ${current === 0 ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}>السابق</button>
          <button onClick={next} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all active:scale-95">
            {current === slides.length - 1 ? 'ابدأ الآن' : 'التالي'}
          </button>
        </div>
      </div>
    </div>
  );
}