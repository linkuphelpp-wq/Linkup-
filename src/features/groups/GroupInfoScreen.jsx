import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/config';
import {
  doc, getDoc, updateDoc, arrayRemove, arrayUnion,
  serverTimestamp, collection, addDoc, query, where, getDocs
} from 'firebase/firestore';
import { toast } from 'sonner';
import { ArrowLeft, Pencil, UserPlus, MoreVertical, Shield, Trash2, Info } from 'lucide-react';

export default function GroupInfoScreen({ group, onBack, onOpenChat }) {
  const [membersData, setMembersData] = useState([]);
  const [groupData, setGroupData] = useState(group);
  const [showEditName, setShowEditName] = useState(false);
  const [showEditDesc, setShowEditDesc] = useState(false);
  const [newName, setNewName] = useState(group.name || '');
  const [newDesc, setNewDesc] = useState(group.description || '');
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [contacts, setContacts] = useState([]);
  const currentUser = auth.currentUser;
  const isAdmin = groupData?.admins?.includes(currentUser.uid) || groupData?.createdBy === currentUser.uid;

  useEffect(() => {
    if (!groupData?.members) return;
    Promise.all(groupData.members.map(async (uid) => {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data();
        const status = data.status || 'offline';
        const lastSeen = data.lastSeen?.toDate?.() || (data.lastSeen ? new Date(data.lastSeen) : null);
        const now = new Date();
        const diffSec = lastSeen ? (now - lastSeen) / 1000 : 999;
        return { uid, name: data.displayName || uid, username: data.username || '', photoURL: data.photoURL || '', status: (status === 'online' && diffSec < 60) ? 'online' : 'offline' };
      }
      return { uid, name: uid, username: '', photoURL: '', status: 'offline' };
    })).then(setMembersData);
  }, [groupData]);

  const updateGroupField = async (field, value) => {
    try {
      await updateDoc(doc(db, 'groups', group.id), { [field]: value });
      setGroupData(prev => ({ ...prev, [field]: value }));
      const systemText = field === 'name' ? `غيّر اسم المجموعة إلى "${value}"` : 'غيّر وصف المجموعة';
      await addDoc(collection(db, 'groups', group.id, 'messages'), { senderId: currentUser.uid, senderName: 'النظام', text: systemText, timestamp: serverTimestamp(), system: true });
      toast.success('تم التحديث');
    } catch (err) { toast.error('فشل التحديث'); }
  };

  const handleToggleAdmin = async (uid) => {
    if (!isAdmin) return;
    const admins = groupData.admins || [];
    try {
      if (admins.includes(uid)) {
        await updateDoc(doc(db, 'groups', group.id), { admins: arrayRemove(uid) });
        setGroupData(prev => ({ ...prev, admins: admins.filter(a => a !== uid) }));
        toast.success('تم إزالة الصلاحية');
      } else {
        await updateDoc(doc(db, 'groups', group.id), { admins: arrayUnion(uid) });
        setGroupData(prev => ({ ...prev, admins: [...admins, uid] }));
        toast.success('تم تعيينه كمشرف');
      }
    } catch (err) { toast.error('فشل التغيير'); }
  };

  const handleRemoveMember = async (uid) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'groups', group.id), { members: arrayRemove(uid) });
      setGroupData(prev => ({ ...prev, members: prev.members.filter(m => m !== uid) }));
      const removedName = membersData.find(m => m.uid === uid)?.name || 'عضو';
      await addDoc(collection(db, 'groups', group.id, 'messages'), { senderId: currentUser.uid, senderName: 'النظام', text: `أزال ${removedName}`, timestamp: serverTimestamp(), system: true });
      toast.success('تم الإزالة');
    } catch (err) { toast.error('فشل الإزالة'); }
  };

  const handleAddMember = async (contact) => {
    if (groupData.members.includes(contact.uid)) { toast.error('العضو موجود بالفعل'); return; }
    try {
      await updateDoc(doc(db, 'groups', group.id), { members: arrayUnion(contact.uid) });
      setGroupData(prev => ({ ...prev, members: [...prev.members, contact.uid] }));
      await addDoc(collection(db, 'groups', group.id, 'messages'), { senderId: currentUser.uid, senderName: 'النظام', text: `أضاف ${contact.displayName || contact.username}`, timestamp: serverTimestamp(), system: true });
      toast.success('تمت الإضافة');
    } catch (err) { toast.error('فشل الإضافة'); }
  };

  useEffect(() => {
    if (!showAddMembers) return;
    const fetchContacts = async () => {
      const q = query(collection(db, 'contacts'), where('participants', 'array-contains', currentUser.uid));
      const snap = await getDocs(q);
      setContacts(snap.docs.map(d => { const data = d.data(); const otherUid = data.participants.find(p => p !== currentUser.uid); return { uid: otherUid, displayName: data.displayName || '', username: data.username || '' }; }));
    };
    fetchContacts();
  }, [showAddMembers]);

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-extrabold text-gray-900">معلومات المجموعة</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg mb-4">
            <span className="text-4xl font-bold text-white">{groupData.name?.charAt(0)?.toUpperCase() || 'G'}</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900">{groupData.name}</h2>
          {groupData.description && <p className="text-sm text-gray-500 mt-1">{groupData.description}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button onClick={() => setShowAddMembers(true)} className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl hover:bg-gray-100">
            <UserPlus className="w-6 h-6 text-purple-600" /><span className="text-xs font-medium">إضافة</span>
          </button>
          {isAdmin && (
            <>
              <button onClick={() => setShowEditName(true)} className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl hover:bg-gray-100">
                <Pencil className="w-6 h-6 text-blue-600" /><span className="text-xs font-medium">تعديل الاسم</span>
              </button>
              <button onClick={() => setShowEditDesc(true)} className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl hover:bg-gray-100">
                <Pencil className="w-6 h-6 text-emerald-600" /><span className="text-xs font-medium">تعديل الوصف</span>
              </button>
            </>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-500 mb-3">الأعضاء ({membersData.length})</h3>
          <div className="space-y-2">
            {membersData.map(member => (
              <div key={member.uid} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0)?.toUpperCase()}
                    </div>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${member.status === 'online' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    {member.username && <p className="text-xs text-gray-500">@{member.username}</p>}
                  </div>
                </div>
                <div className="relative">
                  <button onClick={(e) => { e.stopPropagation(); document.getElementById(`menu-${member.uid}`)?.classList.toggle('hidden'); }} className="p-2 rounded-full hover:bg-gray-200">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <div id={`menu-${member.uid}`} className="hidden absolute left-0 bg-white shadow-lg rounded-xl border py-2 w-48 z-50 mt-2">
                    {isAdmin && (
                      <>
                        <button onClick={() => handleToggleAdmin(member.uid)} className="w-full text-right px-4 py-2 hover:bg-purple-50 flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4" /> {groupData.admins?.includes(member.uid) ? 'إزالة مشرف' : 'تعيين كمشرف'}
                        </button>
                        <button onClick={() => handleRemoveMember(member.uid)} className="w-full text-right px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-sm text-red-600">
                          <Trash2 className="w-4 h-4" /> إزالة
                        </button>
                      </>
                    )}
                    <button className="w-full text-right px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm">
                      <Info className="w-4 h-4" /> معلومات
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showEditName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowEditName(false)}>
          <div className="bg-white rounded-2xl p-6 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">تعديل اسم المجموعة</h3>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full h-10 rounded-lg border px-3 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowEditName(false)} className="flex-1 py-2 rounded-lg border">إلغاء</button>
              <button onClick={() => { updateGroupField('name', newName); setShowEditName(false); }} className="flex-1 py-2 rounded-lg bg-purple-600 text-white">حفظ</button>
            </div>
          </div>
        </div>
      )}
      {showEditDesc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowEditDesc(false)}>
          <div className="bg-white rounded-2xl p-6 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">تعديل الوصف</h3>
            <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full h-10 rounded-lg border px-3 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowEditDesc(false)} className="flex-1 py-2 rounded-lg border">إلغاء</button>
              <button onClick={() => { updateGroupField('description', newDesc); setShowEditDesc(false); }} className="flex-1 py-2 rounded-lg bg-purple-600 text-white">حفظ</button>
            </div>
          </div>
        </div>
      )}
      {showAddMembers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAddMembers(false)}>
          <div className="bg-white rounded-2xl p-6 w-80 max-h-96 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">إضافة أعضاء</h3>
            {contacts.map(c => (
              <div key={c.uid} className="flex items-center justify-between py-2">
                <span>{c.displayName || c.username}</span>
                <button onClick={() => handleAddMember(c)} className="text-purple-600 text-sm font-medium">إضافة</button>
              </div>
            ))}
            <button onClick={() => setShowAddMembers(false)} className="mt-4 w-full py-2 rounded-lg border">إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
}