// تعريف الأيقونات يدوياً (SVG) لضمان السرعة
const Logos = {
  Claude: () => (
    <svg viewBox="0 0 512 512" className="w-5 h-5 md:w-6 md:h-6">
      <rect fill="#CC9B7A" width="512" height="512" rx="104" ry="105" />
      <path fill="#1F1F1E" d="M318.6 149.7h-43.3l78.9 212.4h43.3l-78.9-212.4zm-125.3 0l-78.9 212.4h44.2l15.9-44.6h82.8l16.1 44.6h44.2l-79.1-212.4h-45.3zm-4.2 128.3l26.9-74.7 27 74.7h-53.9z" />
    </svg>
  ),
  OpenAI: () => (
    <svg viewBox="0 0 28 28" className="w-7 h-7 dark:text-white text-black">
      <path d="M26.1 11.4a6.8 6.8 0 00-3.8-8.6 7.2 7.2 0 00-4.4-.4 7 7 0 00-2.4-1.7 7.2 7.2 0 00-11 4.8 7.1 7.1 0 00-2.7 1.1 7 7 0 00-1.8 11.7 6.8 6.8 0 00.6 5.7 7.1 7.1 0 007.7 3.3 7 7 0 002.4 1.7 7.2 7.2 0 0010.8-4.8 7.1 7.1 0 002.7-1.1 7 7 0 001-8.2zm-10.6 14.7c-1.4 0-2.5-.4-3.4-1.2l5.6-3.2c.2-.1.4-.4.4-.8v-7.8l2.3 1.3v6.5c0 2.9-2.4 5.2-5.2 5.2z" fill="currentColor"/>
    </svg>
  ),
  Gemini: () => (
    <svg viewBox="0 0 16 16" className="w-6 h-6">
      <path d="M16 8a8.5 8.5 0 00-8-8h-.1A8.5 8.5 0 000 8v.1A8.5 8.5 0 008 16h.1A8.5 8.5 0 0016 8v-.1z" fill="url(#gemini-grad)" />
      <defs><radialGradient id="gemini-grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(16 5.4 -43.7 129.2 1.5 6.5)"><stop offset=".06" stopColor="#9168C0"/><stop offset=".34" stopColor="#5684D1"/><stop offset=".67" stopColor="#1BA1E3"/></radialGradient></defs>
    </svg>
  )
};

export default function AtheerFeatureCard() {
  return (
    <div className="max-w-sm w-full mx-auto p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl group overflow-hidden relative">
      
      {/* منطقة الشعارات المتحركة (Skeleton) */}
      <div className="h-[15rem] rounded-2xl bg-black/20 flex items-center justify-center relative overflow-hidden [mask-image:radial-gradient(50%_50%_at_50%_50%,white_0%,transparent_100%)]">
        
        {/* الشعارات مع أنيميشن CSS يدوي */}
        <div className="flex items-center gap-4 z-10">
          <div className="animate-[float_2s_infinite_ease-in-out] delay-0">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg"><Logos.Claude /></div>
          </div>
          <div className="animate-[float_2s_infinite_ease-in-out] delay-200">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-xl"><Logos.OpenAI /></div>
          </div>
          <div className="animate-[float_2s_infinite_ease-in-out] delay-400">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg"><Logos.Gemini /></div>
          </div>
        </div>

        {/* خط التوهج العمودي المتحرك */}
        <div className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-[moveUp_3s_infinite_linear]" />
      </div>

      {/* النصوص */}
      <div className="mt-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">مدعوم بأحدث التقنيات</h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          نستخدم في أثير أحدث نماذج الذكاء الاصطناعي لضمان تجربة سلسة وآمنة. كل شيء مصمم يدوياً بدقة متناهية.
        </p>
      </div>

      {/* تعريف الحركات (CSS Keyframes) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        @keyframes moveUp {
          0% { transform: translateY(100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100%); opacity: 0; }
        }
      `}} />
    </div>
  );
}