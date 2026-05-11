import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Users, Sparkles, Plus, Image, Send, Heart, MessageCircle, Repeat2, MoreHorizontal, AtSign, ArrowLeft } from 'lucide-react';
import { db } from '../../../firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { toast } from 'sonner';

export default function WorldMainScreen({ worldUser, onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('forYou');
  const [posts, setPosts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState(''); // رابط صورة (يمكن تطويره لاحقاً)
  const [loading, setLoading] = useState(false);

  // جلب المنشورات
  useEffect(() => {
    const q = query(collection(db, 'world_posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleCreatePost = async () => {
    if (!postText.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'world_posts'), {
        authorId: worldUser.uid,
        authorName: worldUser.displayName,
        authorUsername: worldUser.username,
        authorPhoto: worldUser.photoURL || '',
        text: postText.trim(),
        imageUrl: postImage.trim() || null,
        likes: [],
        reposts: [],
        comments: [],
        createdAt: serverTimestamp(),
      });
      setPostText('');
      setPostImage('');
      setShowCreate(false);
      toast.success('تم نشر منشورك');
    } catch (e) {
      toast.error('فشل النشر');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId, currentLikes) => {
    const postRef = doc(db, 'world_posts', postId);
    if (currentLikes.includes(worldUser.uid)) {
      await updateDoc(postRef, { likes: arrayRemove(worldUser.uid) });
    } else {
      await updateDoc(postRef, { likes: arrayUnion(worldUser.uid) });
    }
  };

  const handleRepost = async (postId, currentReposts) => {
    const postRef = doc(db, 'world_posts', postId);
    if (currentReposts.includes(worldUser.uid)) {
      await updateDoc(postRef, { reposts: arrayRemove(worldUser.uid) });
    } else {
      await updateDoc(postRef, { reposts: arrayUnion(worldUser.uid) });
    }
  };

  const filteredPosts = activeTab === 'following'
    ? posts.filter(p => worldUser.following?.includes(p.authorId) || p.authorId === worldUser.uid)
    : posts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24" dir="rtl">
      {/* هيدر */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-5 pt-12 pb-3 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}
            <Globe className="w-6 h-6 text-purple-500" />
            <h1 className="text-xl font-black text-gray-900">العالم</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreate(true)}
              className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md hover:bg-purple-700 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('forYou')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'forYou' ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Sparkles className="w-4 h-4 inline ml-1" /> لك
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'following' ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            متابَع
          </button>
        </div>
      </header>

      {/* قائمة المنشورات */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Globe className="w-16 h-16 mb-3 opacity-40" />
            <p className="text-lg font-bold">لا توجد منشورات</p>
            <p className="text-sm mt-1">ابدأ بنشر أول منشور لك في العالم</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >
              {/* رأس المنشور */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                  {post.authorName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-900">{post.authorName}</p>
                  <p className="text-xs text-gray-500">@{post.authorUsername}</p>
                </div>
              </div>

              {/* نص المنشور */}
              <p className="text-gray-800 text-sm leading-relaxed mb-3">{post.text}</p>

              {/* صورة المنشور */}
              {post.imageUrl && (
                <img src={post.imageUrl} alt="Post" className="w-full h-48 object-cover rounded-xl mb-3" />
              )}

              {/* أزرار التفاعل */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleLike(post.id, post.likes || [])}
                  className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${(post.likes || []).includes(worldUser.uid) ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'}`}
                >
                  <Heart className={`w-4 h-4 ${(post.likes || []).includes(worldUser.uid) ? 'fill-red-500' : ''}`} />
                  {(post.likes || []).length}
                </button>
                <button className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  {(post.comments || []).length}
                </button>
                <button
                  onClick={() => handleRepost(post.id, post.reposts || [])}
                  className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${(post.reposts || []).includes(worldUser.uid) ? 'text-green-500 bg-green-50' : 'text-gray-500 hover:text-green-500 hover:bg-green-50'}`}
                >
                  <Repeat2 className="w-4 h-4" />
                  {(post.reposts || []).length}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </main>

      {/* مودال إنشاء منشور */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-lg shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">منشور جديد</h2>
              <textarea
                value={postText}
                onChange={e => setPostText(e.target.value)}
                placeholder="ما الذي يدور في بالك؟"
                className="w-full h-32 p-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none text-sm mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 h-11 rounded-xl border border-gray-200 font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={loading || !postText.trim()}
                  className="flex-1 h-11 rounded-xl bg-purple-600 text-white font-bold disabled:opacity-50"
                >
                  {loading ? 'ينشر...' : 'نشر'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}