import { useState, useEffect, useRef, useMemo } from 'react';
import { db, auth } from '../../firebase/config';
import {
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp,
  doc, getDoc, updateDoc
} from 'firebase/firestore';
import { toast } from 'sonner';
import { X, Send, ArrowLeft, MoreVertical, Trash2 } from 'lucide-react';

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

export default function GroupChatScreen({ group, onBack, onOpenGroupInfo }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [actionPopup, setActionPopup] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const currentUser = auth.currentUser;
  const groupId = group?.id;

  useEffect(() => {
    if (!group?.members) return;
    Promise.all(group.members.map(async (uid) => {
      const snap = await getDoc(doc(db, 'users', uid));
      return snap.exists() ? { uid, name: snap.data().displayName || uid } : { uid, name: uid };
    })).then(setMembers);
  }, [group]);

  useEffect(() => {
    if (!groupId) return;
    const colRef = collection(db, 'groups', groupId, 'messages');
    const q = query(colRef, orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const senderName = (uid) => members.find(m => m.uid === uid)?.name || uid;

  const handleSend = async () => {
    if (!message.trim()) return;
    const text = message.trim();
    setMessage('');
    inputRef.current?.focus();
    try {
      await addDoc(collection(db, 'groups', groupId, 'messages'), {
        senderId: currentUser.uid,
        senderName: senderName(currentUser.uid),
        text,
        timestamp: serverTimestamp(),
        replyTo: replyTo ? { id: replyTo.id, text: replyTo.text, senderName: replyTo.senderName } : null,
      });
      setReplyTo(null);
    } catch (err) {
      toast.error('تعذر إرسال الرسالة');
      setMessage(text);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteForEveryone = async (msg) => {
    try {
      await updateDoc(doc(db, 'groups', groupId, 'messages', msg.id), { deleted: true });
      toast.success('تم حذف الرسالة');
    } catch (err) {
      toast.error('فشل حذف الرسالة');
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowClearConfirm(false);
    setShowHeaderMenu(false);
    toast.success('تم مسح المحادثة محلياً');
  };

  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = '';
    let currentGroup = [];

    messages.forEach(msg => {
      const date = msg.timestamp?.toDate?.() || new Date(msg.timestamp);
      const dateStr = date.toLocaleDateString('ar-SA', {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });

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

  const handleLongPress = (msg, e) => {
    const touch = e.touches?.[0] || e;
    setActionPopup({ message: msg, position: { x: touch.clientX, y: touch.clientY } });
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };

  if (!groupId) return <div className="flex h-screen items-center justify-center">جار التحميل...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <header className="sticky top-0 z-30 px-4 pt-12 pb-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => onOpenGroupInfo?.(group)}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {group.name?.charAt(0)?.toUpperCase() || 'G'}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-extrabold text-gray-900 truncate">{group.name || 'المجموعة'}</h2>
                <p className="text-xs text-gray-500">{group.members?.length || 0} أعضاء</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setShowHeaderMenu(!showHeaderMenu)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center">
              <MoreVertical className="w-5 h-5 text-gray-700" />
            </button>
            {showHeaderMenu && (
              <div
                className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setShowHeaderMenu(false)}
              >
                <button
                  onClick={() => { setShowClearConfirm(true); setShowHeaderMenu(false); }}
                  className="w-full text-right px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-sm text-red-600"
                >
                  <Trash2 className="w-4 h-4" /> مسح محتوى الدردشة
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowClearConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 w-80 text-center shadow-xl" onClick={e => e.stopPropagation()}>
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2">تأكيد مسح المحادثة</h3>
            <p className="text-sm text-gray-500 mb-6">سيتم مسح جميع الرسائل من شاشتك فقط ولا يمكن استعادتها. الرسائل لدى الأطراف الأخرى لن تتأثر.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-2 rounded-lg border">إلغاء</button>
              <button onClick={handleClearChat} className="flex-1 py-2 rounded-lg bg-red-600 text-white">مسح</button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-6" style={{ paddingBottom: '130px' }}>
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
                if (msg.system) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <span className="text-xs bg-gray-200/70 text-gray-500 px-3 py-1 rounded-full">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

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
                      {!isMe && (
                        <div className="flex items-center gap-2 mb-1 mr-2">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">
                            {msg.senderName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="text-xs font-medium text-gray-600">{msg.senderName || 'مستخدم'}</span>
                        </div>
                      )}
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
                      <div className={`flex items-center gap-2 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[10px] text-gray-400">{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </main>

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
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالة..."
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