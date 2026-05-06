import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, User } from 'lucide-react';
import { listenToUserChats } from '../../firebase/chat';
import { auth, db } from '../../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

export default function ChatListScreen({ onOpenChat }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = listenToUserChats(userId, (chatsData) => {
      setChats(chatsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="px-5 py-4 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">المحادثات</h2>
        {chats.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">لا توجد محادثات بعد</p>
            <p className="text-sm text-gray-400 mt-1">ابدأ محادثة من جهات الاتصال</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                userId={userId}
                onClick={() => onOpenChat(chat.otherUser)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// مكون العنصر الواحد في القائمة
function ChatListItem({ chat, userId, onClick }) {
  const [status, setStatus] = useState('offline');
  const [lastSeen, setLastSeen] = useState(null);

  const otherUser = chat.otherUser;
  const displayName = otherUser?.displayName || otherUser?.username || 'مستخدم';
  const photoURL = otherUser?.photoURL || '';
  const lastMessage = chat.lastMessage || '';
  const isMyLastMessage = chat.lastMessageSenderId === userId;
  const lastMessageTime = chat.lastMessageTime?.toDate
    ? chat.lastMessageTime.toDate()
    : null;

  useEffect(() => {
    if (!otherUser?.uid) return;
    const userRef = doc(db, 'users', otherUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStatus(data.status || 'offline');
        setLastSeen(data.lastSeen?.toDate() || null);
      }
    });
    return () => unsubscribe();
  }, [otherUser?.uid]);

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'الآن';
    if (diffMin < 60) return `${diffMin} د`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs} س`;
    return date.toLocaleDateString('ar-SA');
  };

  const formatLastSeen = (date) => {
    if (!date) return '';
    const diffMin = Math.floor((new Date() - date) / 60000);
    if (diffMin < 1) return 'الآن';
    if (diffMin < 60) return `قبل ${diffMin} د`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `قبل ${diffHrs} س`;
    return date.toLocaleDateString('ar-SA');
  };

  return (
    <div
      onClick={onClick}
      className="bg-white/70 backdrop-blur-xl rounded-2xl p-3 flex items-center gap-3 shadow-sm border border-white/20 cursor-pointer hover:bg-white/90 transition-colors"
    >
      <div className="relative">
        <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
          <AvatarImage src={photoURL} />
          <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            status === 'online' ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <p className="font-semibold text-gray-900 truncate">{displayName}</p>
          {lastMessageTime && (
            <span className="text-xs text-gray-400 ml-2 shrink-0">{formatTime(lastMessageTime)}</span>
          )}
        </div>
        <div className="flex justify-between items-baseline">
          {lastMessage ? (
            <p className="text-sm text-gray-500 truncate">
              {isMyLastMessage ? 'أنت: ' : ''}{lastMessage}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">ابدأ المحادثة</p>
          )}
          {status === 'online' ? (
            <span className="text-xs text-green-600 font-medium ml-2 shrink-0">متصل</span>
          ) : lastSeen ? (
            <span className="text-xs text-gray-400 ml-2 shrink-0">{formatLastSeen(lastSeen)}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}