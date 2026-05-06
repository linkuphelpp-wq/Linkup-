import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail } from 'lucide-react';

export default function TermsOfServiceScreen({ onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 pb-10">
      <div className="px-5 py-4 max-w-2xl mx-auto">
        <div className="mb-4">
          <Button variant="ghost" onClick={onBack} className="rounded-full">
            <ArrowLeft className="h-5 w-5 ml-2" /> رجوع
          </Button>
        </div>

        <article className="prose prose-gray max-w-none text-right leading-relaxed space-y-6">
          <p className="text-sm text-gray-500">آخر تحديث: أبريل 2026</p>
          <h2 className="text-2xl font-bold text-gray-900">كلمة من أثير</h2>
          <p>
            مرحباً بك في Tero Quick Call. قبل أن تبدأ، أريدك أن تقرأ هذه السطور القليلة.
            إنها "قواعد البيت" الذي بنيته لك. بسيطة، ومنطقية، ومبنية على الاحترام المتبادل.
          </p>
          <p>
            باستخدامك للتطبيق، أنت توافق على هذه البنود. إذا لم تعجبك، لا مشكلة، لكن لا يحق لك الاستمرار.
          </p>

          <h3 className="text-xl font-bold text-gray-900">١. ما تلتزم به أنت</h3>
          <p>تطبيقنا مساحة للتواصل النقي. لذلك، أنت توعدني بأنك:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-800">
            <li><strong>ستكون إنساناً طيباً:</strong> لا مضايقات، لا تهديدات، لا سب، لا محتوى غير أخلاقي، ولا أي فعل يؤذي الآخرين أو يخيفهم.</li>
            <li><strong>لن تستخدم التطبيق في الحرام:</strong> أي نشاط غير قانوني أو ينتهك حقوق الغير ممنوع تماماً.</li>
            <li><strong>لن تعبث بالتطبيق:</strong> لا تحاول اختراقه، أو نسخه، أو إعادة بيعه، أو استخدامه لإرسال رسائل مزعجة.</li>
            <li><strong>ستحافظ على حسابك:</strong> أنت مسؤول عن الحفاظ على سرية بيانات دخولك.</li>
          </ul>
          <p>أي خرق واضح لهذه البنود يعطيني الحق في وقف حسابك فوراً دون سابق إنذار. هذه المساحة نظيفة، وسأحافظ عليها نظيفة.</p>

          <h3 className="text-xl font-bold text-gray-900">٢. ما نلتزم به نحن</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-800">
            <li><strong>الخدمة مجانية للأبد:</strong> لا اشتراكات، لا إعلانات، لا مفاجآت مالية.</li>
            <li><strong>خصوصيتك مصانة:</strong> لا نقرأ محادثاتك، لا نبيع بياناتك. سياسة الخصوصية تشرح هذا بالتفصيل.</li>
            <li><strong>نبذل جهدنا:</strong> نسعى لأن تكون المكالمات واضحة والخدمة مستقرة، لكن لا نضمن الكمال المطلق.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900">٣. حدود المسؤولية (بكل صراحة)</h3>
          <p>أنا أقدم لك هذه الأداة كما هي، من شخص يحب أن يصنع أشياء مفيدة. لكن الحياة لا تخلو من مفاجآت:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-800">
            <li>أنا غير مسؤول عن أي ضرر مباشر أو غير مباشر يحدث بسبب استخدامك للتطبيق أو عدم قدرتك على استخدامه (مثلاً: انقطاع مكالمة مهمة بسبب ضعف شبكتك، أو أي خسارة تنتج عن ذلك).</li>
            <li><strong>الاستخدام مسؤوليتك الشخصية:</strong> أنت تتحمل وحدك كل ما ترسله أو تشاركه.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900">٤. إنهاء الخدمة</h3>
          <p>أنت حر في أي وقت. يمكنك حذف حسابك من داخل التطبيق. وأنا أيضاً أحتفظ بحقي في إنهاء حساب أي شخص يخالف هذه الشروط البسيطة، دون تعويض أو إشعار مسبق إذا كان الضرر واضحاً.</p>

          <h3 className="text-xl font-bold text-gray-900">٥. تغييرات على هذه الشروط</h3>
          <p>إذا طرأ أي تعديل، سأخبرك عبر إشعار في التطبيق. استمرارك في الاستخدام بعد التعديل يعني قبولك به.</p>

          <h3 className="text-xl font-bold text-gray-900">تواصل معي</h3>
          <p>هذه الشروط كتبتها بنفسي. إذا عندك سؤال، أنا موجود:</p>

          {/* الأزرار متطابقة في الشكل والتصميم */}
          <div className="flex flex-wrap gap-4 mt-4">
            {/* زر البريد الإلكتروني */}
            <a
              href="mailto:Linkup.helpp@gmail.com"
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
              <Mail className="h-5 w-5 relative z-10" />
              <span className="relative z-10">البريد الإلكتروني</span>
            </a>

            {/* زر واتساب */}
            <a
              href="https://wa.me/966571107181"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
              <svg className="h-5 w-5 relative z-10" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              <span className="relative z-10">واتساب</span>
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}