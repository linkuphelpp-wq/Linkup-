import { db } from './config';
import { 
  collection, addDoc, updateDoc, doc, onSnapshot, 
  query, where, orderBy, arrayUnion, serverTimestamp, getDocs 
} from 'firebase/firestore';

/**
 * إنشاء مجموعة جديدة مع إشعار الأعضاء (مُصلح)
 */
export const createGroup = async (name, creatorId, creatorName, memberIds, description = '') => {
  const groupRef = await addDoc(collection(db, 'groups'), {
    name, creator: creatorId, createdBy: creatorName, members: memberIds, description, createdAt: serverTimestamp(),
  });

  const notifiedMembers = memberIds.filter(id => id !== creatorId);
  if (notifiedMembers.length > 0) {
    const notificationsRef = collection(db, 'notifications');
    // ✅ ضمان اكتمال جميع الإشعارات
    await Promise.all(notifiedMembers.map(async (memberId) => {
      await addDoc(notificationsRef, {
        message: `${creatorName} أضافك إلى مجموعة "${name}"`,
        userId: memberId, groupId: groupRef.id, type: 'added_to_group', timestamp: serverTimestamp()
      });
    }));
  }
  return groupRef.id;
};

/**
 * إضافة أعضاء جدد إلى مجموعة (مُصلح)
 */
export const addMembersToGroup = async (groupId, newMemberIds, addedByName) => {
  const groupRef = doc(db, 'groups', groupId);
  await updateDoc(groupRef, { members: arrayUnion(...newMemberIds) });
  
  const notificationsRef = collection(db, 'notifications');
  // ✅ ضمان اكتمال جميع إشعارات الإضافة
  await Promise.all(newMemberIds.map(async (id) => {
    await addDoc(notificationsRef, {
      message: `${addedByName} أضافك إلى المجموعة`,
      userId: id, groupId, type: 'added_to_group', timestamp: serverTimestamp()
    });
  }));
};

/**
 * الاستماع للمجموعات
 */
export const listenToUserGroups = (userId, callback) => {
  const q = query(collection(db, 'groups'), where('members', 'array-contains', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const groups = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    callback(groups);
  }, (error) => { console.error('Groups listen error:', error); callback([]); });
};

/**
 * ✅ تم إرجاع الدالة لمنع انهيار التطبيق (Crash)
 * ملاحظة: يُفضل لاحقاً توحيد الاستيراد من contacts.js فقط
 */
export const findUserByUsername = async (username) => {
  const q = query(collection(db, 'users'), where('username', '==', username));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docData = snap.docs[0].data();
  return { uid: snap.docs[0].id, ...docData };
};