import { useState, useEffect, useRef, useMemo } from 'react';
import { db, auth } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { ArrowLeft, Send, Trash2 } from 'lucide-react';

// ───────── مكون القائمة المنسدلة لإجراءات الرسالة ─────────
const MessageActionsPopup = ({ message, isOwn, onReply, onDeleteForEveryone, onClose, position }) => {
  if (!position) return null;
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="absolute bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 w-48 animate-in fade-in slide-in-from-bottom-2 duration-150"
        style={{
          top: Math.min(position.y, window.innerHeight - 200),
          left: position.x > window.innerWidth / 2 ? position.x - 192 : position.x
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => { onReply(message); onClose(); }}
          className="w-full text-right px-4 py-3 hover:bg-purple-50 flex items-center gap-3 text-sm"
        >
          <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
          </svg>
          رد
        </button>
        {isOwn && (
          <button
            onClick={() => { onDeleteForEveryone(message); onClose(); }}
            className="w-full text-right px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-sm text-red-600"
          >
            <Trash2 className="w-4 h-4" /> حذف للكل
          </button>
        )}
      </div>
    </div>
  );
};

export default function ChatScreen({ contact, onBack, onCall }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [actionPopup, setActionPopup] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const currentUser = auth.currentUser;
  const contactUid = contact?.uid || contact?.id;
  const chatId = currentUser?.uid && contactUid ? [currentUser.uid, contactUid].sort().join('_') : null;

  useEffect(() => {
    if (!chatId) return;
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => { console.error(err); setLoading(false); });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !chatId || !currentUser) return;
    const text = message.trim();
    setMessage('');
    inputRef.current?.focus();
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        replyTo: replyTo ? { id: replyTo.id, text: replyTo.text, senderName: replyTo.senderName } : null,
      });
      setReplyTo(null);
    } catch (err) { toast.error('تعذر إرسال الرسالة'); setMessage(text); }
  };

  const handleDeleteForEveryone = async (msg) => {
    if (!chatId) return;
    try {
      await updateDoc(doc(db, 'chats', chatId, 'messages', msg.id), { deleted: true });
      toast.success('تم حذف الرسالة');
    } catch (err) { toast.error('فشل حذف الرسالة'); }
  };

  const handleLongPress = (msg, e) => {
    const touch = e.touches?.[0] || e;
    setActionPopup({ message: msg, position: { x: touch.clientX, y: touch.clientY } });
  };

  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = '';
    let currentGroup = [];
    messages.forEach(msg => {
      const date = msg.timestamp?.toDate?.() || new Date(msg.timestamp);
      const dateStr = date.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' });
      if (dateStr !== currentDate) {
        if (currentGroup.length > 0) groups.push({ date: currentDate, messages: currentGroup });
        currentDate = dateStr;
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }
    });
    if (currentGroup.length > 0) groups.push({ date: currentDate, messages: currentGroup });
    return groups;
  }, [messages]);

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };

  const getSafeName = () => {
    const candidates = [contact?.displayName, contact?.username, contact?.name];
    for (let candidate of candidates) {
      if (candidate && !/@/.test(candidate)) return candidate;
    }
    return 'مستخدم';
  };

  if (!chatId) return <div className="flex items-center justify-center h-screen bg-slate-50 text-gray-500">جارٍ تهيئة المحادثة...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      {/* هيدر المحادثة */}
      <header className="sticky top-0 z-30 px-4 pt-12 pb-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {getSafeName().charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-900 truncate">@{getSafeName()}</h2>
              <p className="text-xs text-gray-500">{contact.status === 'online' ? 'متصل الآن' : 'غير متصل'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => onCall?.(contact, 'audio')} className="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-purple-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </button>
          </div>
        </div>
      </header>

      {/* رسائل */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-6" style={{ paddingBottom: '120px' }}>
        {loading ? (
          <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : groupedMessages.length === 0 ? (
          <div className="flex justify-center py-16 text-gray-400 text-sm">لا توجد رسائل بعد</div>
        ) : (
          groupedMessages.map((group, idx) => (
            <div key={idx}>
              <div className="flex justify-center mb-4">
                <span className="text-xs bg-white border border-gray-200 text-gray-500 px-3 py-1 rounded-full shadow-sm">{group.date}</span>
              </div>
              {group.messages.map(msg => {
                const isMe = msg.senderId === currentUser.uid;
                return (
                  <div
                    key={msg.id}
                    className={`mb-4 ${isMe ? 'flex justify-end' : 'flex justify-start'} group`}
                    onTouchStart={(e) => { const timer = setTimeout(() => handleLongPress(msg, e), 500); e.target._timer = timer; }}
                    onTouchEnd={(e) => clearTimeout(e.target._timer)}
                    onTouchMove={(e) => clearTimeout(e.target._timer)}
                  >
                    <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                      {msg.replyTo && (
                        <div className={`mb-1 p-2 rounded-lg text-xs border border-gray-200 bg-gray-50 ${isMe ? 'mr-2' : 'ml-2'}`}>
                          <p className="font-bold text-gray-700">{msg.replyTo.senderName}</p>
                          <p className="text-gray-500 truncate">{msg.replyTo.text}</p>
                        </div>
                      )}
                      <div
                        style={{
                          backgroundColor: msg.deleted ? '#F3F4F6' : (isMe ? '#6D28D9' : '#FFFFFF'),
                          color: msg.deleted ? '#9CA3AF' : (isMe ? '#FFFFFF' : '#111827'),
                          borderRadius: isMe ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                          padding: '0.75rem 1rem',
                          boxShadow: msg.deleted ? 'none' : (isMe ? '0 4px 12px rgba(109, 40, 217, 0.25)' : '0 2px 8px rgba(0,0,0,0.05)'),
                          border: msg.deleted ? '1px dashed #E5E7EB' : (!isMe ? '1px solid #E5E7EB' : 'none'),
                        }}
                      >
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontStyle: msg.deleted ? 'italic' : 'normal' }}>
                          {msg.deleted ? 'تم حذف هذه الرسالة' : msg.text}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 block text-right">{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* شريط الإدخال مع الرد */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-5 pt-1 bg-white">
        {replyTo && (
          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-t-xl mx-2 border border-gray-200">
            <div className="flex-1 text-xs text-gray-600 truncate">
              <span className="font-bold">الرد على {replyTo.senderName}:</span> {replyTo.text}
            </div>
            <button onClick={() => setReplyTo(null)} className="p-1 rounded-full hover:bg-gray-200"><X className="w-4 h-4" /></button>
          </div>
        )}
        <div className="flex items-end gap-2 bg-white rounded-3xl border border-gray-200 shadow-lg p-2">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="اكتب رسالتك..."
            rows={1}
            className="flex-1 bg-transparent border-0 focus:ring-0 resize-none text-sm text-gray-800 placeholder:text-gray-400 py-2.5 px-1 max-h-32"
            style={{ minHeight: '40px' }}
          />
          {message.trim() ? (
            <button onClick={handleSend} className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white shadow-lg">
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
              <Send className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </footer>

      {/* قائمة إجراءات الرسالة */}
      {actionPopup && (
        <MessageActionsPopup
          message={actionPopup.message}
          isOwn={actionPopup.message.senderId === currentUser.uid}
          onReply={setReplyTo}
          onDeleteForEveryone={handleDeleteForEveryone}
          onClose={() => setActionPopup(null)}
          position={actionPopup.position}
        />
      )}
    </div>
  );
}