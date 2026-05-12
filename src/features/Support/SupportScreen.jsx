import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, MessageCircle, AlertCircle, Clock, ArrowLeft, Wrench
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import {
  collection, doc, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, getDocs, where, setDoc, writeBatch
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

/* ================================================================
   DESIGN TOKENS (مستوحاة من SettingsScreen)
   ================================================================ */
const colorThemes = {
  purple: {
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    activeBg: 'bg-violet-600',
    text: 'text-violet-700',
  },
  blue: {
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    activeBg: 'bg-blue-600',
    text: 'text-blue-700',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 26 } }
};

/* ================================================================
   COMPONENT
   ================================================================ */
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

  // --- Authentication ---
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

  // --- Ticket & Messages Listener ---
  useEffect(() => {
    if (!user?.uid) return;
    let unsubMessages = () => {};

    const initTicket = async () => {
      try {
        const q = query(collection(db, 'supportTickets'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        
        let tid;
        if (!snap.empty) {
          tid = snap.docs[0].id;
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
            createdAt: serverTimestamp()
          });
        }
        setTicketId(tid);

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

          // Auto-delete after 15 min of last admin reply
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

  // --- Send Handler ---
  const handleSend = useCallback(async (textOverride) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : inputText;
    if (!textToSend.trim() || !ticketId || !user || sending) return;

    // Cooldown check
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
    if (lastUserMsg && lastUserMsg.createdAt) {
      const diffMinutes = (Date.now() - lastUserMsg.createdAt.getTime()) / (1000 * 60);
      if (diffMinutes < 5) {
        setCooldownMinutes(Math.ceil(5 - diffMinutes));
        setTimeout(() => setCooldownMinutes(0), 4000);
        return;
      }
    }

    try {
      setSending(true);

      await addDoc(collection(db, 'supportTickets', ticketId, 'messages'), {
        sender: 'user',
        text: textToSend.trim(),
        createdAt: serverTimestamp(),
        read: false,
        notifiedAdmin: false,
      });

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50" dir="rtl">
        <p className="text-stone-500">يجب تسجيل الدخول</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col" dir="rtl">
      {/* ─── Header (مماثل للإعدادات) ─── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-30 bg-white/85 backdrop-blur-xl border-b border-stone-200/60"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="max-w-lg mx-auto px-5 pt-4 pb-3 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${colorThemes.purple.iconBg} text-white`}>
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-stone-900">الدعم الفني</h1>
              <p className="text-[11px] text-emerald-600 font-medium">● متصل الآن</p>
            </div>
          </div>

          <div className="w-10" />
        </div>
      </motion.header>

      {/* ─── Messages Area ─── */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto px-4 py-4 pt-28 pb-44 space-y-4"
      >
        {/* Welcome Banner */}
        {!loading && messages.length === 0 && (
          <motion.div
            variants={itemVariants}
            className="p-4 bg-blue-50/80 border border-blue-100 rounded-2xl text-center mb-4"
          >
            <p className="text-[13px] text-blue-700 font-medium leading-relaxed">
              💡 يرجى شرح مشكلتك في رسالة واحدة.<br />
              يُسمح بإرسال رسالة كل 5 دقائق لضمان جودة الرد.
            </p>
          </motion.div>
        )}

        {/* Suggestions */}
        {!loading && messages.length === 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-2 mb-4">
            {suggestions.map((s, i) => (
              <motion.button
                key={i}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSend(s)}
                className="p-3 bg-white border border-stone-200 rounded-2xl text-[13px] text-stone-700 text-right shadow-sm hover:shadow-md transition-all"
              >
                {s}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Messages */}
        <AnimatePresence>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-stone-800 rounded-bl-none border border-stone-200'
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1.5 ${isUser ? 'text-blue-200' : 'text-stone-400'}`}>
                    {msg.createdAt.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </motion.main>

      {/* ─── Input Bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-stone-200/60 px-4 py-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        {cooldownMinutes > 0 && (
          <div className="flex items-center justify-center gap-2 mb-2 text-rose-600 text-[12px] font-bold animate-pulse">
            <Clock className="w-4 h-4" />
            <span>انتظر {cooldownMinutes} دقائق للإرسال مجدداً</span>
          </div>
        )}

        <div className="flex items-end gap-2 max-w-lg mx-auto">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالتك..."
            rows={1}
            className="flex-1 bg-stone-100 rounded-2xl px-4 py-3 text-sm text-stone-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all resize-none border border-stone-200"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleSend()}
            disabled={sending || !inputText.trim()}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all ${
              sending || !inputText.trim()
                ? 'bg-stone-300 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 shadow-blue-200'
            }`}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}