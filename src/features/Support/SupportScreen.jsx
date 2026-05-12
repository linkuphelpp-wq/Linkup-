import { useState, useEffect, useRef, useCallback } from 'react';
import { db, auth } from '../../firebase/config';
import {
  collection, doc, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, getDocs, where, setDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function SupportScreen({ onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const [ticketId, setTicketId] = useState(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  // ١. جلب المستخدم الحالي
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

  // ٢. إنشاء التذكرة أو جلبها + الاستماع على الرسائل
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
          const docs = snap.docs;
          docs.sort((a, b) => {
            const aTime = a.data().lastMessageAt?.toMillis?.() || 0;
            const bTime = b.data().lastMessageAt?.toMillis?.() || 0;
            return bTime - aTime;
          });
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
            userPhotoURL: user.photoURL || '',
            userUsername: username,
            status: 'open',
            createdAt: serverTimestamp(),
            lastMessageAt: serverTimestamp(),
          });
          setTicketId(tid);
        }

        const messagesQuery = query(
          collection(db, 'supportTickets', tid, 'messages'),
          orderBy('createdAt', 'asc('createdAt', 'asc')
        );
        unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
          const msgs = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate?.() || new Date(),
          }));
          setMessages(msgs);
          setLoading(false);
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

  // ٣. إرسال الرسالة
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !ticketId || !user) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'supportTickets', ticketId, 'messages'), {
        sender: 'user',
        text: inputText.trim(),
        createdAt: serverTimestamp(),
        read: false,
        notifiedAdmin: false,
      });
      await setDoc(
        doc(db, 'supportTickets', ticketId),
        { lastMessageAt: serverTimestamp() },
        { merge: true }
      );
      setInputText('');
    } catch (err) {
      console.error('Send error:', err);
      alert('فشل إرسال الرسالة. تحقق من الاتصال.');
    } finally {
      setSending(false);
    }
  }, [inputText, ticketId, user]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50" dir="rtl">
        <p className="text-gray-500">يجب تسجيل الدخول لاستخدام الدعم الفني</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50" dir="rtl">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-5 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95">
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">الدعم الفني</h1>
            <p className="text-xs text-green-600 font-medium">● متصل الآن</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-32">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <p className="text-sm text-gray-500">مرحباً بك في الدعم الفني 👋<br/>اكتب رسالتك وسنرد عليك في أقرب وقت.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                isUser
                  ? 'bg-white text-gray-900 rounded-br-none border border-gray-100'
                  : 'bg-blue-600 text-white rounded-bl-none'
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
        <div className="flex items-end gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالتك هنا..."
            rows={1}
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 resize-none outline-none focus:ring-2 focus:ring-blue-500/20 max-h-32"
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !inputText.trim()}
            className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-95 shrink-0"
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