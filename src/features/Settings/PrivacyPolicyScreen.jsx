export default function PrivacyPolicyScreen({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden" dir="rtl">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200/40 rounded-full blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-200/40 rounded-full blur-[80px]" />

      <header className="sticky top-0 z-30 px-6 pt-14 pb-5 backdrop-blur-xl bg-white/70 border-b border-gray-200/50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-11 h-11 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all active:scale-95">
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">سياسة الخصوصية</h1>
        </div>
      </header>

      <main className="relative z-10 px-5 py-8 pb-32 space-y-8 max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-8 h-8 text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <h2 className="font-black text-lg">كلمة من أثير</h2>
          </div>
          <p className="text-blue-50 text-sm leading-loose">هذه ليست وثيقة قانونية معقدة، بل هي كلمتي لك. أنا لا أريد منك شيئًا، فقط أريدك أن تتواصل مع من تحب بأمان وراحة.</p>
          <div className="mt-4 text-[10px] font-bold text-blue-200 opacity-80">آخر تحديث: ٢٨ أبريل ٢٠٢٦</div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-lg border border-white/60 space-y-6 text-gray-700 leading-loose text-justify text-sm md:text-base">
          <section>
            <h3 className="text-base font-black text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-8 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></span>
              ما نعرفه عنك
            </h3>
            <p>كل ما نعرفه عنك هو بريدك الإلكتروني فقط، وذلك لسبب وحيد هو أن تحمي نفسك من ضياع حسابك. إذا تغير هاتفك أو فقدته، فبريدك هو المفتاح الذي تستعيد به كل شيء. لا نرسل لك أي رسائل، لا نطلع على محتوى بريدك، ولا نستخدمه لأي غرض آخر. ببساطة، هو مجرد مفتاح طوارئ تحتفظ به أنت وحدك.</p>
          </section>

          <section>
            <h3 className="text-base font-black text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
              اتصالاتك خاصة تمامًا
            </h3>
            <p>أما كل ما يتعلق باتصالاتك، صوتًا وصورةً ورسائل، فلا نعرف عنه شيئًا ولا نخزنه ولا نستطيع الوصول إليه. ما تقوله وترسله يبقى بينك وبين الطرف الآخر، دون أن يمر على خادم يمكننا فتحه، ودون أن يكون لنا أي قدرة على الاطلاع عليه، حتى لو أراد أحدنا ذلك لا يملك السبيل. يعني حين تتصل بوالدتك أو بصديقك، فالعالم الخارجي كله يقف خارج الغرفة، ونحن معه.</p>
          </section>

          <div className="bg-purple-50 border-r-4 border-purple-400 p-4 rounded-r-xl my-4">
            <p className="text-purple-900 font-medium italic">لا توجد لدينا إعلانات في التطبيق، ولا خطط اشتراك، ولا أطراف ثالثة نشاركها بياناتك لأننا أصلًا لا نملك بيانات نشاركها.</p>
          </div>

          <section>
            <h3 className="text-base font-black text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-8 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></span>
              الشفافية والحذف
            </h3>
            <p>لا نبيع شيئًا، لا نؤجر شيئًا، لا نحلل سلوكك ولا نبني ملفًا عنك، وكل ما يهمنا هو أن تبقى تجربتك نظيفة وخاصة. إذا قررت يومًا أن تغادر Linkup، فبإمكانك حذف حسابك من داخل التطبيق وسيُمسح بريدك الإلكتروني نهائيًا ولا يبقى له أثر.</p>
          </section>

          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-sm font-bold text-gray-900 mb-2">هذا هو وعدي لك</p>
            <p className="text-xs text-gray-600 leading-relaxed">لا بنود مخفية ولا مفاجآت. خصوصيتك ليست سلعة، بل هي حجر الأساس الذي بنيت عليه هذا التطبيق. شكرًا لثقتك فيّ وفي Linkup.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <a href="mailto:Linkup.helpp@gmail.com" className="group flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 active:scale-95">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">تواصل عبر البريد</p>
              <p className="text-xs text-gray-500 mt-0.5">دعم فني مباشر</p>
            </div>
            <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>

          <a href="https://wa.me/966571107181" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 active:scale-95">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">تواصل عبر واتساب</p>
              <p className="text-xs text-gray-500 mt-0.5">محادثة فورية وآمنة</p>
            </div>
            <svg className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </main>
    </div>
  );
}