import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, ArrowLeft, Clock, LogIn, AlertTriangle, RefreshCw, Heart,
  ThumbsUp, ThumbsDown, CheckCircle2, XCircle
} from 'lucide-react';
import { db, auth } from '../../firebase/config';
import {
  collection, doc, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, getDocs, where, setDoc, writeBatch
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

/* ================================================================
   DESIGN TOKENS
   ================================================================ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 420, damping: 24 } }
};

const messageVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 450, damping: 28 } }
};

const suggestions = [
  { text: "مشكلة في تسجيل الدخول", icon: LogIn, color: "from-purple-500 to-indigo-600" },
  { text: "التطبيق يتوقف فجأة", icon: AlertTriangle, color: "from-rose-500 to-pink-600" },
  { text: "سؤال عن تحديث جديد", icon: RefreshCw, color: "from-blue-500 to-indigo-600" },
  { text: "شكر و تقدير", icon: Heart, color: "from-emerald-500 to-teal-600" },
];

export default function SupportScreen({ onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const [ticketId, setTicketId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cooldownMinutes, setCooldownMinutes] = useState(0);
  const [feedbackState, setFeedbackState] = useState(null); // null, 'liked', 'disliked'
  const bottomRef = useRef(null);

  // --- Auth ---
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

  // --- Ticket & Messages ---
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
          const msgs = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate?.() || new Date(),
          }));
          setMessages(msgs);
          setLoading(false);

          // التحقق من حالة التذكرة إذا كانت منتهية
          const lastAutoReply = [...msgs].reverse().find(m => m.sender === 'admin' && m.autoReply);
          if (lastAutoReply?.feedback) {
            setFeedbackState(lastAutoReply.feedback);
          }

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
        console.error("Init error:", err);
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
      console.error(err);
      alert("فشل الإرسال، تحقق من الإنترنت.");
    } finally {
      setSending(false);
    }
  }, [inputText, ticketId, user, sending, messages]);

  // --- Feedback Handler (معدل) ---
  const handleFeedback = async (messageId, isPositive) => {
    if (feedbackState) return; // ممنوع بعد الاختيار
    const newState = isPositive ? 'liked' : 'disliked';
    setFeedbackState(newState);

    try {
      const messageRef = doc(db, 'supportTickets', ticketId, 'messages', messageId);
      await setDoc(messageRef, { feedback: newState }, { merge: true });

      if (isPositive) {
        // إنهاء الجلسة
        await setDoc(doc(db, 'supportTickets', ticketId), { status: 'resolved' }, { merge: true });
      } else {
        // طلب مراجعة
        await setDoc(doc(db, 'supportTickets', ticketId), { status: 'needs_review' }, { merge: true });
      }
    } catch (err) {
      console.error('Failed to save feedback:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-50" dir="rtl"><p className="text-stone-500">يجب تسجيل الدخول</p></div>;
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col" dir="rtl">
      {/* ─── Header عصري ─── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-b border-stone-200/60 px-4 py-3"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-lg font-black text-stone-900 tracking-tight">الدعم الفني</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full animate-pulse ${feedbackState === 'liked' ? 'bg-emerald-500' : 'bg-emerald-500'}`} />
              <span className="text-[11px] text-emerald-700 font-medium">
                {feedbackState === 'liked' ? 'انتهت الجلسة' : 'متصل'}
              </span>
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
        className="flex-1 overflow-y-auto px-4 py-4 pt-28 pb-44 space-y-5"
      >
        {!loading && messages.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center"
            >
              <AlertTriangle className="w-8 h-8 text-blue-600" />
            </motion.div>
            <h3 className="text-[15px] font-bold text-stone-800 mb-1">كيف نقدر نساعدك؟</h3>
            <p className="text-[13px] text-stone-500 leading-relaxed">
              اشرح مشكلتك وسيتم الرد خلال وقت قصير
            </p>
          </motion.div>
        )}

        {!loading && messages.length === 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-2.5">
            {suggestions.map((s) => (
              <motion.button
                key={s.text}
                variants={itemVariants}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSend(s.text)}
                className="relative overflow-hidden rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md p-3.5 text-right transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className={`bg-gradient-to-br ${s.color} rounded-xl p-2 text-white shrink-0 shadow-sm`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[13px] font-bold text-stone-700 group-hover:text-stone-900 transition-colors leading-tight">{s.text}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isAutoReply = msg.sender === 'admin' && msg.autoReply === true;
            const feedbackGiven = feedbackState != null;

            return (
              <motion.div
                key={msg.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[82%] flex flex-col gap-1">
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
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

                  {/* أزرار التقييم للردود التلقائية */}
                  {isAutoReply && !isUser && !feedbackGiven && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 mt-1"
                    >
                      <button
                        onClick={() => handleFeedback(msg.id, true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95 transition-all"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>مفيد</span>
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-700 active:scale-95 transition-all"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>غير مفيد</span>
                      </button>
                    </motion.div>
                  )}

                  {/* رسالة بعد التقييم */}
                  {isAutoReply && !isUser && feedbackGiven && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-2 mt-1 px-3 py-2 rounded-xl text-[11px] font-medium ${
                        feedbackState === 'liked'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {feedbackState === 'liked' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>شكراً لتقييمك! سعدنا بخدمتك</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>نعتذر، سنقوم بمراجعة مشكلتك والتواصل معك</span>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </motion.main>

      {/* ─── Input (يخفي عند إنهاء الجلسة) ─── */}
      {feedbackState !== 'liked' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-stone-200/60 px-4 py-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          {cooldownMinutes > 0 && (
            <div className="flex items-center justify-center gap-2 mb-2 text-rose-600 text-[12px] font-medium">
              <Clock className="w-4 h-4" />
              <span>الرجاء الانتظار {cooldownMinutes} دقائق</span>
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
              whileTap={{ scale: 0.9 }}
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
      )}
    </div>
  );
}