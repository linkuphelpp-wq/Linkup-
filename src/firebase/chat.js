import { db } from './config';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';

/**
 * إنشاء محادثة جديدة بين مستخدمين.
 */
export const createChat = async (userId1, userId2) => {
  const chatRef = await addDoc(collection(db, 'chats'), {
    participants: [userId1, userId2],
    createdAt: serverTimestamp(),
    lastMessage: '',
    lastMessageTime: serverTimestamp(),
    lastMessageSenderId: '',
  });
  return chatRef.id;
};

/**
 * جلب أو إنشاء محادثة بين مستخدمين.
 */
export const getOrCreateChat = async (userId1, userId2) => {
  const chatsRef = collection(db, 'chats');
  const q = query(chatsRef, where('participants', 'array-contains', userId1));
  const querySnapshot = await getDocs(q);
  let existingChatId = null;

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.participants.includes(userId2)) {
      existingChatId = docSnap.id;
    }
  });

  if (existingChatId) return existingChatId;
  return await createChat(userId1, userId2);
};
/**
 * إرسال رسالة في محادثة.
 */
export const sendMessage = async (chatId, senderId, text) => {
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    text,
    timestamp: serverTimestamp(),
  });

  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, {
    lastMessage: text,
    lastMessageTime: serverTimestamp(),
    lastMessageSenderId: senderId,
  });
};

/**
 * الاستماع للرسائل في محادثة معينة.
 */
export const listenToMessages = (chatId, callback) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((docSnap) => {
      messages.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(messages);
  });
};

/**
 * ✅ الاستماع لقائمة محادثات المستخدم (مُحسّن للأداء العالي).
 * تم استبدال الحلقات المتسلسلة بـ جلب متوازي (Parallel Fetching).
 */
export const listenToUserChats = (userId, callback) => {
  const chatsRef = collection(db, 'chats');
  const q = query(chatsRef, where('participants', 'array-contains', userId), orderBy('lastMessageTime', 'desc'));

  return onSnapshot(q, async (snapshot) => {
    // 1. جمع البيانات الأساسية و IDs المستخدمين الآخرين
    const chatsData = [];
    const userIdsToFetch = new Set(); // استخدام Set لتجنب التكرار

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const otherUserId = data.participants.find((id) => id !== userId);      
      // حفظ بيانات المحادثة مؤقتاً
      chatsData.push({
        id: docSnap.id,
        ...data,
        otherUserId,
      });

      // جمع معرفات المستخدمين لجلبهم دفعة واحدة
      if (otherUserId) userIdsToFetch.add(otherUserId);
    });

    // 2. جلب بيانات جميع المستخدمين الآخرين في وقت واحد (سريع جداً)
    const fetchPromises = Array.from(userIdsToFetch).map((uid) => getDoc(doc(db, 'users', uid)));
    const userDocs = await Promise.all(fetchPromises);

    // 3. إنشاء خريطة (Map) للبحث السريع عن بيانات المستخدمين
    const usersMap = {};
    userDocs.forEach((docSnap) => {
      if (docSnap.exists()) {
        usersMap[docSnap.id] = docSnap.data();
      }
    });

    // 4. دمج بيانات المحادثات مع بيانات المستخدمين
    const finalChats = chatsData.map((chat) => {
      const otherUserData = usersMap[chat.otherUserId];
      return {
        id: chat.id,
        ...chat,
        otherUser: otherUserData
          ? {
              uid: chat.otherUserId,
              displayName: otherUserData.displayName,
              username: otherUserData.username,
              photoURL: otherUserData.photoURL,
            }
          : null,
      };
    });

    // إزالة الحقل المؤقت otherUserId من النتيجة النهائية
    // (يمكنك تركه إذا كنت تحتاجه، لكن الأفضل تنظيفه)
    const cleanedChats = finalChats.map(({ otherUserId, ...rest }) => rest);

    callback(cleanedChats);
  });
};