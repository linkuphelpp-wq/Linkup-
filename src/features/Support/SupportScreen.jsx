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
  const [cooldownText, setCooldownText] = useState(''); // لنص التنبيه بالوقت المتبقي
  const bottomRef = useRef(null);

  // --- 1. الرسائل الاقتراحية ---
  const suggestions = [
    "واجهت مشكلة في الدفع 💳",
    "التطبيق يتوقف فجأة ⚠️",
    "سؤال عن تحديث جديد 🚀",
    "شكراً لكم على الخدمة 🌟"
  ];

  // --- 2. إدارة حالة المستخدم ---
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

  // --- 3. مراقبة التذاكر والرسائل والحذف التلقائي ---
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
            lastMessageAt: null
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

          // --- نظام الحذف التلقائي بعد 15 دقيقة من رد الإدارة ---
          if (msgs.length > 0) {
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg.sender === 'admin') {
              const diffMinutes = (Date.now() - lastMsg.createdAt.getTime()) / (1000 * 60);
              if (diffMinutes >= 15) {
                const batch = writeBatch(db);
                snapshot.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
                // تحديث التذكرة لتمكين الإرسال مجدداً بعد الحذف
                await setDoc(doc(db, 'supportTickets', tid), { lastMessageAt: null }, { merge: true });
              }
            }
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

  // --- 4. دالة الإرسال مع التقييد الحقيقي (5 دقائق) ---
  const handleSend = useCallback(async (textOverride) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() || !ticketId || !user || sending) return;

    try {
      setSending(true);
      
      // جلب بيانات التذكرة للتحقق من التوقيت الحقيقي
      const ticketSnap = await getDocs(query(collection(db, 'supportTickets'), where('userId', '==', user.uid)));
      const ticketData = ticketSnap.docs[0]?.data();

      if (ticketData?.lastMessageAt) {
        const lastTime = ticketData.lastMessageAt.toMillis();
        const diffMinutes = (Date.now() - lastTime) / (1000 * 60);

        if (diffMinutes < 5) {
          const remaining = Math.ceil(5 - diffMinutes);
          setCooldownText(`يرجى الانتظار ${remaining} دقائق لإرسال رسالة أخرى 🛡️`);
          setTimeout(() => setCooldownText(''), 5000);
          setSending(false);
          return;
        }
      }

      // إضافة الرسالة
      await addDoc(collection(db, 'supportTickets', ticketId, 'messages'), {
        sender: 'user',
        text: textToSend.trim(),
        createdAt: serverTimestamp(),
        read: false,
        notifiedAdmin: false,
      });

      // تحديث "قفل" التوقيت في Firestore
      await setDoc(doc(db, 'supportTickets', ticketId), { 
        lastMessageAt: serverTimestamp(),
        status: 'open' 
      }, { merge: true });

      setInputText('');
    } catch (err) {
      console.error('Send error:', err);
      alert('فشل في الإرسال، حاول مجدداً.');
    } finally {
      setSending(false);
    }
  }, [inputText, ticketId, user, sending]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]" dir="rtl">
        <p className="text-gray-500 font-medium">يجب تسجيل الدخول لاستخدام الدعم الفني</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center active:scale-90 transition-transform">
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">الدعم المباشر</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[11px] text-gray-500 font-medium">المطور متصل الآن</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-40">
        {/* نص التوضيح الأنيق */}
        {!loading && messages.length === 0 && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 animate-in fade-in zoom-in duration-500">
            <div className="flex gap-3">
              <span className="text-xl">💡</span>
              <div>
                <h3 className="text-sm font-bold text-indigo-900 mb-1">نظام الرسالة الواحدة</h3>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  لضمان سرعة الاستجابة، يرجى كتابة مشكلتك في <b>رسالة واحدة مفصلة</b>. سيتم تقييد الإرسال لمدة 5 دقائق بعد كل رسالة.
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
                className="text-[11px] text-right p-3 bg-white border border-gray-100 rounded-xl text-gray-600 hover:border-indigo-200 transition-all active:bg-indigo-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* قائمة الرسائل */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13.5px] shadow-sm animate-in slide-in-from-bottom-1 ${
                isUser ? 'bg-white text-gray-800 rounded-br-none border border-gray-50' : 'bg-indigo-600 text-white rounded-bl-none'
              }`}>
                <p className="leading-relaxed">{msg.text}</p>
                <span className={`text-[9px] block mt-1 opacity-60 ${isUser ? 'text-gray-400' : 'text-indigo-100'}`}>
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
        {cooldownText && (
          <div className="text-center mb-2 animate-bounce">
            <span className="text-[10px] text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full border border-red-100">
              {cooldownText}
            </span>
          </div>
        )}
        
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-gray-100 rounded-2xl p-1 transition-all focus-within:bg-gray-200/50">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك بالتفصيل..."
              rows={1}
              className="w-full bg-transparent px-3 py-2 text-sm text-gray-900 outline-none resize-none"
              style={{ minHeight: '40px' }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={sending || !inputText.trim()}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              !inputText.trim() ? 'bg-gray-200 text-gray-400' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
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
