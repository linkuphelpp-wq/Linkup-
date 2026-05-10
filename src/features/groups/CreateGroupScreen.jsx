import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/config';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { useLanguage } from '../../context/LanguageContext';

export default function CreateGroupScreen({ onBack }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser?.uid) return;
    const contactsQuery = query(
      collection(db, 'contacts'),
      where('participants', 'array-contains', currentUser.uid)
    );
    const unsub = onSnapshot(contactsQuery, (snap) => {
      const contactList = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        contactId: doc.data().participants.find(p => p !== currentUser.uid),
      }));
      setContacts(contactList);
    });
    return () => unsub();
  }, [currentUser]);

  const handleToggleContact = (contactId) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError(t('groups.nameRequired'));
    if (!currentUser) { setError(t('auth.required')); return; }

    setLoading(true);
    try {
      const memberIds = [currentUser.uid, ...selectedContacts];

      const groupRef = await addDoc(collection(db, 'groups'), {
        name: name.trim(),
        description: description.trim(),
        isPrivate,
        createdBy: currentUser.uid,
        members: memberIds,
        createdAt: serverTimestamp(),
      });

      const batch = [];
      for (const memberId of selectedContacts) {
        if (memberId === currentUser.uid) continue;
        batch.push(
          addDoc(collection(db, 'notifications'), {
            type: 'added_to_group',
            groupId: groupRef.id,
            groupName: name.trim(),
            recipientId: memberId,
            senderId: currentUser.uid,
            read: false,
            createdAt: serverTimestamp(),
          })
        );
      }
      await Promise.all(batch);

      setSuccess(true);
      setTimeout(() => onBack?.(), 1500);
    } catch (err) {
      console.error(err);
      setError(t('groups.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50" dir="rtl">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-5 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95">
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">{t('groups.createGroup')}</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 pb-24">
        {success ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('groups.created')}</h3>
            <p className="text-sm text-gray-500">{t('groups.redirecting')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">{t('groups.name')} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('groups.namePlaceholder')}
                  className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-transparent transition-all"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">{t('groups.description')} ({t('common.optional')})</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={t('groups.descPlaceholder')}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-transparent transition-all resize-none"
                  maxLength={200}
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4">{t('groups.privacySettings')}</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t('groups.privateGroup')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('groups.privateGroupDesc')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-12 h-7 rounded-full transition-colors relative ${isPrivate ? 'bg-purple-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${isPrivate ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4">{t('groups.addMembersTitle', { count: selectedContacts.length })}</h3>
              {contacts.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">{t('groups.noContacts')}</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {contacts.map((contact) => {
                    const isSelected = selectedContacts.includes(contact.contactId);
                    return (
                      <div
                        key={contact.id}
                        onClick={() => handleToggleContact(contact.contactId)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50 border-purple-300 shadow-sm'
                            : 'bg-gray-50 border-gray-100 hover:border-purple-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                            isSelected
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-gray-300 text-transparent'
                          }`}>
                            {isSelected && '✓'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {contact.displayName || contact.email || t('common.user')}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              @{contact.username || contact.contactId?.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-xl font-bold text-base shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/></svg>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                  {t('groups.createGroup')}
                </>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}