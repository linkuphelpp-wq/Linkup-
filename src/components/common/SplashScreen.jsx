import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('init');

  useEffect(() => {
    const startTime = Date.now();
    const TOTAL_DURATION = 2500;
    const PROGRESS_END = 1900;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed > 120 && phase === 'init') setPhase('content');
      if (elapsed > 350 && phase === 'content') setPhase('loading');

      setProgress(Math.min(100, (elapsed / PROGRESS_END) * 100));

      if (elapsed >= TOTAL_DURATION) {
        clearInterval(timer);
        setVisible(false);
        setTimeout(onFinish, 100);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [onFinish, phase]);

  return (
    <div className={`fixed inset-0 z-[9999] bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
      
      {/* 🌤️ خلفية فاتحة مع إضاءات ناعمة */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#f3e8ff_0%,_#ffffff_70%)]" />
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200/60 rounded-full blur-[140px] animate-ambient-float" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-blue-200/50 rounded-full blur-[120px] animate-ambient-float animation-delay-3000" />
      </div>

      {/* 📦 المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col items-center px-6">
        
        {/* حاوية الشعار الزجاجية - فاتحة ومتناسقة */}
        <div className={`relative mb-10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'init' ? 'opacity-0 translate-y-8 scale-90' : 'opacity-100 translate-y-0 scale-100'}`}>
          <div className="absolute -inset-6 bg-purple-300/20 rounded-full blur-3xl animate-glow-breathe" />
          <div className="relative w-20 h-20 rounded-2xl bg-white/60 backdrop-blur-xl border border-gray-200/50 shadow-[0_20px_50px_-12px_rgba(139,92,246,0.15)] flex items-center justify-center overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-100/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            <MessageCircle className="w-9 h-9 text-purple-600 drop-shadow-sm transition-transform duration-700 group-hover:scale-110" strokeWidth={1.8} />
          </div>
        </div>

        {/* الاسم والشعار اللفظي - فاتح */}
        <div className={`text-center transition-all duration-700 delay-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'init' ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'}`}>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight drop-shadow-sm">
            Link<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">Up</span>
          </h1>
          <p className="mt-3 text-[11px] text-gray-500 font-medium tracking-[0.3em] uppercase">
            التواصل بلا حدود
          </p>
        </div>

        {/* مؤشر التحميل - فاتح */}
        <div className={`mt-14 w-48 transition-all duration-700 delay-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'init' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden backdrop-blur-sm border border-gray-100/50">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-100 ease-linear" 
              style={{ width: `${progress}%` }} 
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_12px_rgba(139,92,246,0.5)] transition-all duration-100 ease-linear"
              style={{ left: `calc(${progress}% - 6px)`, opacity: progress > 0 ? 1 : 0 }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-5 text-center font-medium tracking-wide">
            {progress < 30 ? 'جاري تهيئة البيئة...' : progress < 70 ? 'تحميل المكونات...' : 'أهلاً بك'}
          </p>
        </div>
      </div>

      {/* 🎬 تعريفات الرسوم المتحركة - معدلة للألوان الفاتحة */}
      <style>{`
        @keyframes ambient-float {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -55%) scale(1.04); opacity: 0.5; }
        }
        .animate-ambient-float { animation: ambient-float 16s ease-in-out infinite; }
        .animation-delay-3000 { animation-delay: 3s; }
        
        @keyframes glow-breathe {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.08); opacity: 0.4; }
        }
        .animate-glow-breathe { animation: glow-breathe 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}