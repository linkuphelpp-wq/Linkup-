import { useState, useEffect, useRef, useCallback } from 'react';
import { db, auth } from '../../firebase/config';
import {
  collection, doc, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, getDocs, where, setDoc, writeBatch
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function SupportScreen({ onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const [ticketId, setTicketId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cooldownMinutes, setCooldownMinutes] = useState(0);
  const bottomRef = useRef(null);

  const suggestions = [
    "واجهت مشكلة في الدفع 💳",
    "التطبيق يتوقف فجأة ⚠️",
    "سؤال عن تحديث جديد 🚀",
    "شكراً لكم على الخدمة 🌟"
  ];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser({
          uid: u.uid, email: u.email, displayName: u.displayName || '', photoURL: u.photoURL || '',
        });
      } else setUser(null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    let unsubMessages = () => {};

    const initTicket = async () => {
      try {
        const q = query(collection(db, 'supportTickets'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        
        let tid;
        if (!snap.empty) {
          // جلب آمن جداً لمعرف التذكرة بدون التسبب في خطأ التواريخ
          tid = snap.docs[0].id; 
        } else {
          const username = localStorage.getItem('my_username') || '';
          const newTicketRef = doc(collection(db, 'supportTickets'));
          tid = newTicketRef.id;
          await setDoc(newTicketRef, {
            userId: user.uid, userEmail: user.email || '', userName: user.displayName || '',
            userUsername: username, status: 'open', createdAt: serverTimestamp()
          });
        }
        setTicketId(tid);

        const messagesQuery = query(collection(db, 'supportTickets', tid, 'messages'), orderBy('createdAt', 'asc'));
        unsubMessages = onSnapshot(messagesQuery, async (snapshot) => {
          const msgs = snapshot.docs.map((d) => ({
            id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() || new Date(),
          }));
          setMessages(msgs);
          setLoading(false);

          // الحذف التلقائي بعد 15 دقيقة
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg && lastMsg.sender === 'admin') {
            const diff = (Date.now() - lastMsg.createdAt.getTime()) / (1000 * 60);
            if (diff >= 15) {
              const batch = writeBatch(db);
              snapshot.docs.forEach(d => batch.delete(d.ref));
              await batch.commit();
            }
          }
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });
      } catch (err) {
        console.error("Ticket init error:", err);
        setLoading(false);
      }
    };
    initTicket();
    return () => unsubMessages();
  }, [user?.uid]);

  const handleSend = useCallback(async (textOverride) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : inputText;
    if (!textToSend.trim() || !ticketId || !user || sending) return;

    // 🛡️ التقييد الآمن 100% (يفحص الرسائل الموجودة أمامه في الشاشة فقط)
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
    if (lastUserMsg && lastUserMsg.createdAt) {
      const diffMinutes = (Date.now() - lastUserMsg.createdAt.getTime()) / (1000 * 60);
      if (diffMinutes < 5) {
        setCooldownMinutes(Math.ceil(5 - diffMinutes));
        setTimeout(() => setCooldownMinutes(0), 4000);
        return; // إيقاف الإرسال
      }
    }

    try {
      setSending(true);
      
      // الإرسال السليم الذي يقرأه البوت
      await addDoc(collection(db, 'supportTickets', ticketId, 'messages'), {
        sender: 'user',
        text: textToSend.trim(),
        createdAt: serverTimestamp(),
        read: false,
        notifiedAdmin: false, // 🚨 تم التأكيد على هذا الحقل للبوت
      });

      // تحديث حالة التذكرة ليعرف المدير أن هناك رسالة
      await setDoc(doc(db, 'supportTickets', ticketId), { 
        updatedAt: serverTimestamp(),
        status: 'open'
      }, { merge: true });

      setInputText('');
    } catch (err) {
      console.error("Send error:", err);
      alert("فشل الإرسال، تحقق من الإنترنت.");
    } finally {
      setSending(false);
    }
  }, [inputText, ticketId, user, sending, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-slate-50/50" dir="rtl"><p className="text-gray-500">يجب تسجيل الدخول</p></div>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50" dir="rtl">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-5 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform">
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">الدعم الفني</h1>
            <p className="text-xs text-green-600 font-medium">● متصل الآن</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-36">
        {!loading && messages.length === 0 && (
          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl text-center mb-4">
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              💡 يرجى شرح مشكلتك في رسالة واحدة.<br/>يسمح بإرسال رسالة كل 5 دقائق لضمان جودة الرد.
            </p>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => handleSend(s)} className="p-3 bg-white border border-gray-200 rounded-xl text-[11px] text-gray-600 text-right active:bg-gray-50 transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                isUser ? 'bg-white text-gray-900 rounded-br-none border border-gray-100' : 'bg-blue-600 text-white rounded-bl-none'
              }`}>
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1 ${isUser ? 'text-gray-400' : 'text-blue-200'}`}>
                  {msg.createdAt.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 pb-8 z-30">
        {cooldownMinutes > 0 && (
          <p className="text-center text-[10px] text-red-500 font-bold mb-2 animate-pulse">
            ⚠️ يرجى الانتظار {cooldownMinutes} دقائق للإرسال مجدداً
          </p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالتك هنا..."
            rows={1}
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 max-h-32"
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={sending || !inputText.trim()}
            className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-40 transition-all active:scale-95 shrink-0"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
