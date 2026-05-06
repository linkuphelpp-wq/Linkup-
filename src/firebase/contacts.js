import { db } from './config';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

export const listenToContacts = (userId, callback) => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback(data.contacts || []);
    } else {
      callback([]);
    }
  });
};

export const findUserByUsername = async (username) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username.toLowerCase()));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const docSnap = querySnapshot.docs[0];
  return { uid: docSnap.id, ...docSnap.data() };
};

export const addContact = async (userId, contactData) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    contacts: arrayUnion(contactData),
  });
};

export const removeContact = async (userId, contactUid) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;
  const currentContacts = userSnap.data().contacts || [];
  const updatedContacts = currentContacts.filter((c) => c.uid !== contactUid);
  await updateDoc(userRef, { contacts: updatedContacts });
};