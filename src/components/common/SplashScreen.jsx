import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('init');

  useEffect(() => {
    const startTime = Date.now();
    const TOTAL_DURATION = 2500; // المدة الكلية بالضبط: 2.5 ثانية
    const PROGRESS_END = 1900;   // شريط التقدم يكتمل عند 1.9 ثانية

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;

      // تسلسل ظهور العناصر بتوقيت محسوب
      if (elapsed > 120 && phase === 'init') setPhase('content');
      if (elapsed > 350 && phase === 'content') setPhase('loading');

      // تحديث التقدم بسلاسة 60fps
      setProgress(Math.min(100, (elapsed / PROGRESS_END) * 100));

      // بدء الخروج السينمائي
      if (elapsed >= TOTAL_DURATION) {
        clearInterval(timer);
        setVisible(false);
        setTimeout(onFinish, 100); // هامش زمني بسيط لإكمال انتقال CSS
      }
    }, 16); // تحديث كل 16 مللي ثانية لحركة فائقة السلاسة

    return () => clearInterval(timer);
  }, [onFinish, phase]);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#040406] flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
      
      {/* 🌌 خلفية عميقة مع إضاءة محيطة هادئة */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#0a0a12_0%,_#040406_70%)]" />
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[140px] animate-ambient-float" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[120px] animate-ambient-float animation-delay-3000" />
      </div>

      {/* 📦 المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col items-center px-6">
        
        {/* حاوية الشعار الزجاجية */}
        <div className={`relative mb-10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'init' ? 'opacity-0 translate-y-8 scale-90' : 'opacity-100 translate-y-0 scale-100'}`}>
          <div className="absolute -inset-6 bg-purple-500/10 rounded-full blur-3xl animate-glow-breathe" />          <div className="relative w-20 h-20 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            <MessageCircle className="w-9 h-9 text-white drop-shadow-lg transition-transform duration-700 group-hover:scale-110" strokeWidth={1.8} />
          </div>
        </div>

        {/* الاسم والشعار اللفظي */}
        <div className={`text-center transition-all duration-700 delay-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'init' ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'}`}>
          <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-sm">
            Link<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400">Up</span>
          </h1>
          <p className="mt-3 text-[11px] text-gray-400 font-medium tracking-[0.3em] uppercase">
            التواصل بلا حدود
          </p>
        </div>

        {/* مؤشر التحميل الأنيق */}
        <div className={`mt-14 w-48 transition-all duration-700 delay-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'init' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          <div className="relative h-1 bg-gray-800/30 rounded-full overflow-hidden backdrop-blur-sm border border-white/[0.05]">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-100 ease-linear" 
              style={{ width: `${progress}%` }} 
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_12px_rgba(139,92,246,0.8)] transition-all duration-100 ease-linear"
              style={{ left: `calc(${progress}% - 6px)`, opacity: progress > 0 ? 1 : 0 }}
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-5 text-center font-medium tracking-wide">
            {progress < 30 ? 'جاري تهيئة البيئة...' : progress < 70 ? 'تحميل المكونات...' : 'أهلاً بك'}
          </p>
        </div>
      </div>

      {/* 🎬 تعريفات الرسوم المتحركة */}
      <style>{`
        @keyframes ambient-float {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
          50% { transform: translate(-50%, -55%) scale(1.04); opacity: 0.28; }
        }
        .animate-ambient-float { animation: ambient-float 16s ease-in-out infinite; }
        .animation-delay-3000 { animation-delay: 3s; }
        
        @keyframes glow-breathe {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.08); opacity: 0.25; }
        }
        .animate-glow-breathe { animation: glow-breathe 4s ease-in-out infinite; }
      `}</style>
    </div>  );
}