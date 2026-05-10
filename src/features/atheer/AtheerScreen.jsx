import { useState } from 'react';

export default function AtheerScreen({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden" dir="rtl">
      {/* خلفية زخرفية هادئة */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

      {/* الهيدر الثابت */}
      <header className="sticky top-0 z-30 px-6 pt-14 pb-5 backdrop-blur-xl bg-white/70 border-b border-gray-200/50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-11 h-11 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all active:scale-95">
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">من هو أثير؟</h1>
        </div>
      </header>

      <main className="relative z-10 px-5 py-8 pb-32 space-y-8 max-w-3xl mx-auto">
        {/* بطاقة التعريف */}
        <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-3xl p-7 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4 text-2xl font-bold">أ</div>
            <h2 className="text-2xl font-black mb-2">أثير المطور</h2>
            <p className="text-purple-200 text-sm leading-relaxed">مؤسس LinkUp | صانع التجارب الرقمية الهادئة</p>
          </div>
        </div>

        {/* النص الأصلي - منسق باحترافية */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-lg border border-white/60 space-y-5 text-gray-700 leading-loose text-justify text-sm md:text-base">
          <p>اسمي أثير، وهذا التطبيق بين يديك اسمه Linkup، وما يجمع بين الاسمين ليس مجرد فكرة عابرة أو مشروع تجاري، بل قصة كاملة بدأت من سؤال واحد ظل يلح عليّ كلما فتحت هاتفي: لماذا كل شيء في هذا العالم الرقمي إما يسرق وقتي أو يسرق بياناتي أو يطلب مني مالًا مقابل لحظة هدوء؟</p>
          <p>أنا لا أمثل شركة، ولا خلفي مستثمرون، ولا يوجد مكتب فاخر يحمل لوحة باسمي، كل ما في الأمر أنني شخص قرر أن يصنع مساحته الخاصة بهدوء، مساحة لا يشوهها إعلان مقتحم ولا يثقلها اشتراك شهري ولا يعكر صفوها شعور دائم بأن هناك من يتنصت، مساحة أضع فيها توقيعي الشخصي بكل ثقة وأقول لك: هذا صنعته لك، خذه، ولا ترد لي شيئًا.</p>
          <p>Linkup هو الابن الروحي لهذه الفلسفة، تطبيق ولد من رحم القناعة وليس من رحم السوق، لم أصنعه لأن هناك فجوة تجارية يجب ملؤها، بل صنعته لأنني ببساطة أردت أن أتصل بمن أحب دون أن أشعر أنني سلعة، أردت أن أسمع صوت أمي دون أن تقاطعنا نافذة منبثقة، أردت أن أضحك مع صديق قديم دون أن أعرف أن حديثنا حُلل لاستهدافنا بإعلان لاحق، وحين بحثت عن أداة تمنحني هذا النقاء لم أجدها، فقررت أن أصنعها بنفسي.</p>
          <div className="bg-purple-50 border-r-4 border-purple-400 p-4 rounded-r-xl my-4">
            <p className="text-purple-900 font-medium italic">لهذا حين ترى اسم أثير على أي تطبيق، فأنت لا ترى علامة تجارية، بل ترى وعدًا شخصيًا من إنسان يعرف أن سمعته مرهونة بكل سطر برمجي يكتبه، وعد بأن هذا المكان الرقمي الصغير سيبقى نظيفًا، حرًا، وآمنًا، ليس لأن القانون يلزمني بذلك، بل لأن ضميري يفعل.</p>
          </div>
          <p>في Linkup لا يوجد سوى ما تحتاجه فعلًا: صوت نقي يصل كأن المتحدث جالس بجانبك، صورة واضحة تنقل ملامح الوجوه دون تشويش، مساحة صغيرة للكتابة السريعة أثناء المكالمة تمرر فيها فكرة أو رابطًا وكأنك تهمس في أذن الطرف الآخر، وكل هذا يحدث خلف جدار سميك من الخصوصية الكاملة التي لا يستطيع أحد اختراقها، حتى أنا شخصيًا أقف خارج هذا الجدار ولا أملك مفاتيحه.</p>
          <p>لا إعلانات تعطل تجربتك، لا اشتراكات تخفي خلفها الميزات الحقيقية، كل ما في التطبيق مفتوح لك من اللحظة الأولى وإلى الأبد، لأنني ببساطة لا أرى أن جودة الصوت أو وضوح الصورة ينبغي أن يكونا ترفًا يدفع المرء مقابله، هما حق أساسي مثل الهواء النقي الذي يجب ألا يباع.</p>
          <p>في زمن صار فيه المستخدم مجرد رقم في تقرير أرباح ربع سنوية، Linkup هو محاولتي المتواضعة لإعادة تعريف العلاقة بين الإنسان وتطبيقه، علاقة لا تقوم على الاستغلال بل على الثقة، لا تقوم على المراقبة بل على الاحترام، لا تقوم على الأخذ بل على العطاء.</p>
          <p>لست هنا لأبيعك شيئًا، ولا لأقنعك أن تطبيقي أفضل تطبيق في العالم، فأنا أعرف أنه ليس كذلك، لكن ما أعرفه يقينًا أن هذا التطبيق صُنع لك وليس ضدي، صُنع ليخدمك أنت لا ليخدمني أنا، صُنع وفي قلبه مبدأ واحد بسيط: أنت إنسان تستحق أن تتواصل بكرامة.</p>
          <p className="font-bold text-gray-900 mt-4">مرحبًا بك في Linkup، أهلاً بك في مساحة تحمل اسمي وتوقيعي وضميري، هنا لا يوجد مستخدمون ولا عملاء، يوجد فقط بشر مثلي ومثلك يريدون أن يتحدثوا بحرية وأمان، وأنا أعدك أن هذه المساحة ستبقى كما هي دائمًا، هادئة، نظيفة، وصادقة، تمامًا كما وعدتك أول مرة.</p>
          <p className="mt-4 pt-4 border-t border-gray-200 text-gray-500 italic">هذا أنا، وهذا تطبيقي، وهذه دعوة مفتوحة لك لتكون جزءًا من عالم أثير الرقمي، حيث البساطة فلسفة، والخصوصية عهد، والتواصل بين الناس عودة إلى الجوهر الأول: صوت إنسان يصل إلى إنسان آخر، دون ضجيج ودون مقابل.</p>
        </div>

        {/* أزرار التواصل (بدون ظهور البريد أو الرقم) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <a href="mailto:Linkup.helpp@gmail.com" className="group flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 active:scale-95">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">تواصل عبر البريد</p>
              <p className="text-xs text-gray-500 mt-0.5">رد سريع ومباشر</p>
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