export default function AboutScreen({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/4" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-200/40 rounded-full blur-[100px] translate-y-1/2 translate-x-1/4" />

      <header className="sticky top-0 z-30 px-6 pt-14 pb-5 backdrop-blur-xl bg-white/70 border-b border-gray-200/50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-11 h-11 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all active:scale-95">
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">من نحن</h1>
        </div>
      </header>

      <main className="relative z-10 px-5 py-8 pb-32 space-y-8 max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-3xl p-7 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-[10px] font-bold tracking-wide mb-4 border border-white/10">الإصدار 1.0.0 | تحديث مستمر</span>
            <h2 className="text-3xl font-black tracking-tight mb-3">LinkUp</h2>
            <p className="text-indigo-100 leading-relaxed text-sm">منصة تواصل عصرية صُممت لمن يقدر الخصوصية والسرعة والبساطة.</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-lg border border-white/60 space-y-5 text-gray-700 leading-loose text-justify text-sm md:text-base">
          <p>نحن لسنا شركة، ولستَ تقرأ الآن كتيبًا تعريفيًا كتبه قسم التسويق، نحن مجرد فكرة خرجت من رأس شخص واحد هو أنا، أثير، ووجدت طريقها إلى هاتفك تحت اسم Linkup، اسم اخترته بعناية لأنه ببساطة ما نفعله: نوصلك بمن تحب، لا أكثر ولا أقل، دون تعقيد ودون مقابل ودون أن نجعل من أنفسنا حاجزًا بينك وبين صوت من تنتظره.</p>
          <p>حين تقرأ "نحن" في هذا النص فأنت لا تقرأ عن فريق عمل ضخم ولا عن هيكل تنظيمي ولا عن مجلس إدارة، أنا أثير وحدي، وخلفي قناعة واحدة ظلت ترافقني في كل مشروع أصنعه: التكنولوجيا يجب أن تخدم الإنسان لا أن تستعبده، أنا هنا لأنني أرفض فكرة أن كل نقرة على الهاتف يجب أن يتبعها إعلان، وأن كل دقيقة اتصال يجب أن تُدفع، وأن كل خصوصية يجب أن تُباع، هذا الرفض هو نقطة البداية.</p>
          <div className="bg-blue-50 border-r-4 border-blue-400 p-4 rounded-r-xl my-4">
            <p className="text-blue-900 font-medium italic">Linkup خرج إلى النور ليكون مساحة اتصال نقية، لا تعقيد فيها ولا تشويش، تفتح التطبيق فتجده بسيطًا لدرجة أنك لا تحتاج إلى شرح، تضغط على اسم من تحب فيتصل، تتحدث بصوت واضح كأن الشخص في الغرفة المجاورة.</p>
          </div>
          <p>ترى وجهه بنقاء يجعلك تنسى أن بينكما شاشات ومسافات وكيلومترات من كابلات الإنترنت، تكتب له ملاحظة سريعة أثناء المكالمة وهو يقرؤها في لحظتها، وكل هذا يحدث في ممر آمن تمامًا، لا أحد يستمع، لا أحد يتطفل، لا أحد يحلل كلامكما ليبيعكما شيئًا لاحقًا، حتى أنا شخصيًا لا أستطيع الوصول إلى ما يدور بينكما لأن التطبيق صُمم أصلًا ليكون حصينًا حتى من صانعه.</p>
          <p>نحن لا نجمع بياناتك لنبيعها لأننا ببساطة لا نجمعها من الأساس، لا نعرف ماذا تقول، لا نعرف مع من تتكلم، لا نعرف كم مرة اتصلت بوالدتك هذا الأسبوع، كل ما نعرفه هو بريدك الإلكتروني الذي تعطينا إياه طواعية لا لنرسل لك إعلانات بل لنحفظ لك مفتاح حسابك إذا ضاع هاتفك أو تغير، وحتى هذا البريد لن يصلك منه شيء منا، لا نشرات ولا عروض ولا رسائل تذكير، إنه مجرد حبل نجاة صغير تمسك به أنت وحدك إذا احتجته يومًا، لا أكثر.</p>
          <p>في Linkup لا توجد خطط اشتراك تخفي الميزات الحقيقية خلف جدار دفع، كل ما في التطبيق متاح لك الآن، وغدًا، وإلى الأبد، الصوت عالي الجودة ليس ترفًا تشتريه، الفيديو النقي ليس ميزة بريميوم، الأمان الكامل ليس حكرًا على من يدفع أكثر، هذه كلها حقوق أساسية لأي إنسان يريد أن يتواصل بكرامة، وأنا أؤمن أن بيع هذه الحقوق هو نوع من الظلم الذي لا أريد أن أكون جزءًا منه.</p>
          <p>ما يفرقنا عن غيرنا ليس خاصية سحرية، بل ما لا يوجد لدينا، ليس لدينا إعلانات، ليس لدينا متتبعات، ليس لدينا طرف ثالث ينتظر بياناتك، ليس لدينا رغبة في احتكار وقتك أو انتباهك، كل ما لدينا هو أداة اتصال نظيفة تؤدي وظيفتها وتختفي، تمنحك ما تحتاج بالضبط دون أن تطلب منك شيئًا.</p>
          <p>Linkup هو الجزء الجديد من عائلة أثير الرقمية، إلى جانب مشاريع أخرى قادمة، ألعاب ألغاز هادئة، أدوات تفاعلية بسيطة، كلها تحمل الاسم نفسه والوعد نفسه، لأن فلسفتي لا تتغير بتغير نوع التطبيق، أنا أصنع مساحات للناس وليس أدوات للربح، أمنحك ما أصنعه بيدي وأثق أنه سينفعك، ولا أنتظر منك مقابلاً.</p>
          <p>هذه الصفحة ليست طويلة لأن لدي الكثير لأخفيه، بل لأن لدي مبادئ أريدك أن تفهمها جيدًا قبل أن تضغط على أيقونة التطبيق لأول مرة، أريدك أن تعرف أن خلف هذه الأيقونة إنسانًا حقيقيًا يهمه رأيك وتجربتك، إنسانًا يقرأ رسائلك بنفسه على بريد الدعم، إنسانًا لا يعدك بالكمال لكنه يعدك بالصدق.</p>
          <p className="font-bold text-gray-900 mt-4 pt-4 border-t border-gray-200">مرحبًا بك في Linkup، مرحبًا بك في المساحة التي تحمل توقيع أثير، حيث البساطة أسلوب حياة، والتواصل بلا ثمن، والخصوصية ليست خيارًا بل أساس، وحيث ما زال بالإمكان أن تجد تطبيقًا يصنع لك لا لي.</p>
        </div>

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