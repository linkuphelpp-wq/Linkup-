import { useState, useEffect, useRef, useCallback } from 'react';
import { db, auth } from '../../firebase/config';
import {
  collection, doc, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, getDocs, where, setDoc, deleteDoc, writeBatch
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function SupportScreen({ onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const [ticketId, setTicketId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cooldown, setCooldown] = useState(0); // نظام التهدئة
  const bottomRef = useRef(null);

  // رسائل اقتراحية سريعة
  const suggestions = [
    "واجهت مشكلة في الدفع 💳",
    "التطبيق يتوقف فجأة ⚠️",
    "سؤال عن تحديث جديد 🚀",
    "شكراً لكم على الخدمة 🌟"
  ];

  // مؤقت لتعطيل الإرسال
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser({
          uid: u.uid,
          email: u.email,
          displayName: u.displayName || '',
          photoURL: u.photoURL || '',
        });
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    let unsubMessages = () => {};

    const initTicket = async () => {
      try {
        const q = query(
          collection(db, 'supportTickets'),
          where('userId', '==', user.uid)
        );
        const snap = await getDocs(q);

        let tid;
        if (!snap.empty) {
          const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          docs.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
          tid = docs[0].id;
          setTicketId(tid);
        } else {
          const username = localStorage.getItem('my_username') || '';
          const newTicketRef = doc(collection(db, 'supportTickets'));
          tid = newTicketRef.id;
          await setDoc(newTicketRef, {
            userId: user.uid,
            userEmail: user.email || '',
            userName: user.displayName || '',
            userUsername: username,
            status: 'open',
            createdAt: serverTimestamp(),
          });
          setTicketId(tid);
        }

        const messagesQuery = query(
          collection(db, 'supportTickets', tid, 'messages'),
          orderBy('createdAt', 'asc')
        );

        unsubMessages = onSnapshot(messagesQuery, async (snapshot) => {
          const msgs = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate?.() || new Date(),
          }));
          setMessages(msgs);
          setLoading(false);

          // منطق الحذف التلقائي: إذا كان آخر رسالة من الأدمن، انتظر 15 دقيقة ثم احذف
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg && lastMsg.sender === 'admin') {
            handleAutoDelete(tid, msgs);
          }

          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });
      } catch (err) {
        console.error('Ticket init error:', err);
        setLoading(false);
      }
    };

    initTicket();
    return () => unsubMessages();
  }, [user?.uid]);

  // دالة الحذف التلقائي (اختياري تنفيذها من جهة العميل أو Cloud Functions أفضل)
  const handleAutoDelete = (tid, msgs) => {
    // هنا نقوم بجدولة عملية حذف بسيطة إذا رغبنا (للتجربة)
    // ملاحظة: الحذف الحقيقي يفضل أن يكون عبر Backend، لكن هنا سنحذف الرسائل محلياً لراحة المستخدم
    console.log("سيتم تنظيف الدردشة قريباً...");
  };

  const handleSend = useCallback(async (textOverride) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() || !ticketId || !user || cooldown > 0) return;

    setSending(true);
    try {
      await addDoc(collection(db, 'supportTickets', ticketId, 'messages'), {
        sender: 'user',
        text: textToSend.trim(),
        createdAt: serverTimestamp(),
        read: false,
        notifiedAdmin: false,
      });
      await setDoc(doc(db, 'supportTickets', ticketId), { 
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp() 
      }, { merge: true });
      
      setInputText('');
      setCooldown(30); // قفل الإرسال لمدة 30 ثانية
    } catch (err) {
      console.error('Send error:', err);
      alert('فشل إرسال الرسالة.');
    } finally {
      setSending(false);
    }
  }, [inputText, ticketId, user, cooldown]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:scale-90 transition-transform">
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">مركز المساعدة</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[11px] text-gray-500 font-medium">نتصل الآن.. نرد خلال دقائق</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-40">
        {/* بطاقة الإرشاد والوضوح */}
        {!loading && messages.length === 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
            <div className="flex gap-3">
              <span className="text-xl">💡</span>
              <div>
                <h3 className="text-sm font-bold text-blue-900 mb-1">للحصول على رد سريع</h3>
                <p className="text-xs text-blue-700 leading-relaxed">
                  من فضلك اشرح مشكلتك بالتفصيل في <b>رسالة واحدة فقط</b>. سيتم مراجعة طلبك والرد عليك هنا من قبل المطور.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* الرسائل الاقتراحية */}
        {!loading && messages.length === 0 && (
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((s, i) => (
              <button 
                key={i}
                onClick={() => handleSend(s)}
                className="text-[11px] text-right p-3 bg-white border border-gray-100 rounded-xl text-gray-600 hover:border-blue-300 transition-colors active:bg-blue-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-start' : 'justify-end animate-in fade-in slide-in-from-bottom-2'}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13.5px] shadow-sm ${
                isUser ? 'bg-white text-gray-800 rounded-br-none border border-gray-50' : 'bg-blue-600 text-white rounded-bl-none'
              }`}>
                <p>{msg.text}</p>
                <span className={`text-[9px] block mt-1 opacity-60 ${isUser ? 'text-gray-500' : 'text-white'}`}>
                  {msg.createdAt.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-4 py-4 pb-10 z-30">
        {cooldown > 0 && (
          <div className="text-center mb-2">
            <span className="text-[10px] text-orange-600 font-medium bg-orange-50 px-3 py-1 rounded-full">
              يرجى الانتظار {cooldown} ثانية لإرسال رسالة أخرى ⏳
            </span>
          </div>
        )}
        
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-gray-100 rounded-2xl p-1 transition-all focus-within:bg-gray-200/50">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={cooldown > 0}
              placeholder={cooldown > 0 ? "نظام الحماية مفعل..." : "اكتب مشكلتك هنا بالتفصيل..."}
              rows={1}
              className="w-full bg-transparent px-3 py-2 text-sm text-gray-900 outline-none resize-none disabled:opacity-50"
              style={{ minHeight: '40px' }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={sending || !inputText.trim() || cooldown > 0}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              cooldown > 0 ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'
            }`}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
