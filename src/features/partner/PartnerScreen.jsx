import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Shield, Mail, Key, Users, Star, Lock } from 'lucide-react';
import { db, auth } from '../../firebase/config';
import { doc, getDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function PartnerScreen({ onBack }) {
  const [adminKey, setAdminKey] = useState('');
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(''); // لكشف المشكلة مؤقتاً
  const currentUser = auth.currentUser;

  const handleActivate = async () => {
    const trimmed = adminKey.replace(/\s+/g, '').toUpperCase().trim();
    
    if (!trimmed) {
      setStatus('error');
      setMessage('يرجى إدخال معرف المدير.');
      return;
    }
    if (!currentUser) {
      setStatus('error');
      setMessage('يجب تسجيل الدخول أولاً.');
      return;
    }

    setLoading(true);
    setStatus(null);
    setMessage('');
    setDebugInfo('');

    try {
      const inviteRef = doc(db, 'adminInvites', trimmed);
      const inviteSnap = await getDoc(inviteRef);

      if (!inviteSnap.exists()) {
        setStatus('error');
        setMessage('معرف المدير غير صحيح أو منتهي الصلاحية.');
        setLoading(false);
        return;
      }

      if (inviteSnap.data().used === true) {
        setStatus('error');
        setMessage('هذا المفتاح تم استخدامه بالفعل ولا يمكن إعادة استخدامه.');
        setLoading(false);
        return;
      }

      // ⚠️ هذه الخطوة قد تفشل إذا كانت قواعد Firestore تمنع المستخدم من الكتابة إلى adminInvites
      await setDoc(
        inviteRef,
        {
          used: true,
          usedBy: currentUser.uid,
          usedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // ترقية المستخدم – أيضاً قد تمنعها القواعد إذا كان الحقل isAdmin محظوراً
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(
        userRef,
        {
          isAdmin: true,
          upgradedBy: inviteSnap.data().createdBy || 'admin',
        },
        { merge: true }
      );

      // حذف المفتاح بعد الاستخدام (لن يؤثر على الترقية إذا فشل)
      await deleteDoc(inviteRef).catch(() => {});

      setStatus('success');
      setMessage('🎉 تم تفعيل صلاحيات المدير بنجاح! سيتم تحويلك للوحة الإدارة.');
      setAdminKey('');
      setTimeout(() => { if (onBack) onBack(); }, 2000);
    } catch (error) {
      console.error('❌ خطأ التفاصيل الكامل:', error);
      let errorMsg = 'حدث خطأ غير متوقع.';
      if (error.code === 'permission-denied') {
        errorMsg = '⛔ صلاحيات محدودة. يرجى التواصل مع المطور لضبط قواعد الأمان.';
      } else if (error.message?.includes('serverTimestamp')) {
        errorMsg = '❌ خطأ في تهيئة الوقت. تأكد من استيراد serverTimestamp.';
      } else {
        errorMsg = `❌ ${error.message || error}`;
      }
      setStatus('error');
      setMessage(errorMsg);
      setDebugInfo(JSON.stringify(error, null, 1)); // لعرض التفاصيل مؤقتاً
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col items-center justify-center px-5 py-10">
      <div className="max-w-md w-full mx-auto">
        <div className="mb-4">
          <Button variant="ghost" onClick={onBack} className="rounded-full">
            <ArrowLeft className="h-5 w-5 ml-2" /> رجوع
          </Button>
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-white shadow-lg mb-4">
            <Users className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">تكوين شراكة</h2>
          <p className="text-gray-600 leading-relaxed">انضم إلى فريق LinkUp وساهم في تطوير التطبيق</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white/20 mb-6 space-y-5 text-right">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-600" />
            لماذا نصمم هذا البرنامج؟
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            لأن LinkUp ليس مجرد تطبيق، إنه مجتمع نابض بالحياة. نريد أن نفتح أبواب الإدارة للمبدعين والمتطوعين الذين يشاركونا الشغف. برنامج "تكوين شراكة" هو فرصتك لتصبح جزءًا من فريق التطوير والإشراف، وتمتلك صلاحيات حقيقية لمساعدة الآخرين والحفاظ على بيئة آمنة ونظيفة.
          </p>

          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            ماذا ستحصل عليه كشريك؟
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
            <li><strong>لوحة تحكم إدارية:</strong> تمكنك من مراقبة المستخدمين، حظر المخالفين، وإرسال تحذيرات.</li>
            <li><strong>إدارة الإشعارات العامة:</strong> إرسال تنبيهات لجميع المستخدمين لإطلاعهم على التحديثات.</li>
            <li><strong>إنشاء مفاتيح دعوة:</strong> لترقية شركاء جدد تختارهم بنفسك.</li>
            <li><strong>تقارير وإحصاءات:</strong> رؤية شاملة لنشاط التطبيق.</li>
            <li><strong>دعم فني خاص:</strong> تواصل مباشر مع المطور الأساسي لحل المشكلات.</li>
          </ul>
          <p className="text-sm text-gray-500 italic">
            ملاحظة: صلاحيات الشريك لا تشمل الاطلاع على محادثات المستخدمين الخاصة، احترامًا لخصوصيتهم.
          </p>

          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Key className="h-5 w-5 text-purple-600" />
            كيف تنضم؟
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            ببساطة، تواصل مع مدير التطبيق الحالي ليولد لك "مفتاح دعوة" خاصًا بك. أدخل هذا المفتاح في الحقل أدناه، واضغط "تفعيل المدير". ستصبح شريكًا فورًا دون الحاجة لأي إعدادات معقدة. كل مفتاح يُستخدم مرة واحدة لضمان الأمان والخصوصية.
          </p>

          <div className="flex items-center gap-2 text-purple-700 bg-purple-50 rounded-xl p-3 mt-2">
            <Lock className="h-5 w-5 shrink-0" />
            <span className="text-sm">نظام المفاتيح آمن تمامًا، ولا يمكن لأحد التنبؤ بها أو إعادة استخدامها.</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white/20 mb-6 space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="أدخل معرف المدير هنا"
              value={adminKey}
              onChange={(e) => {
                setAdminKey(e.target.value);
                setStatus(null);
                setMessage('');
                setDebugInfo('');
              }}
              className="h-12 rounded-xl bg-gray-100/80 border-gray-200 text-center text-lg font-mono tracking-widest uppercase"
              disabled={loading}
              autoComplete="off"
            />
            {status && (
              <div className="mt-2 text-sm font-medium text-center">
                <p className={status === 'success' ? 'text-green-600' : 'text-red-500'}>
                  {message}
                </p>
                {debugInfo && (
                  <details className="mt-2 text-left bg-red-50 rounded p-2 text-xs text-red-800 max-h-24 overflow-auto">
                    <summary className="cursor-pointer font-bold">تفاصيل الخطأ</summary>
                    <pre className="whitespace-pre-wrap">{debugInfo}</pre>
                  </details>
                )}
              </div>
            )}
          </div>
          <Button
            onClick={handleActivate}
            disabled={loading || !adminKey.trim()}
            className="w-full h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Key className="h-5 w-5 mr-2" /> تفعيل الصلاحية الآن
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-500 text-center">إذا لم تحصل على مفتاح بعد، تواصل معنا:</p>
          <a
            href="mailto:Linkup.helpp@gmail.com"
            className="group relative flex items-center justify-center gap-2 w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            <Mail className="h-5 w-5 relative z-10" />
            <span className="relative z-10">البريد الإلكتروني</span>
          </a>
        </div>
      </div>
    </div>
  );
}