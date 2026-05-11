import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, UserCheck, Heart, MessageCircle, Repeat2 } from 'lucide-react';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, collection, query, orderBy, where } from 'firebase/firestore';
import { toast } from 'sonner';

export default function WorldProfileScreen({ onBack, currentWorldUser, targetUserId }) {
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const viewerUid = currentWorldUser?.uid;
  const isOwnProfile = viewerUid === targetUserId;

  useEffect(() => {
    if (!targetUserId) return;
    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, 'world_users', targetUserId));
        if (snap.exists()) {
          const data = snap.data();
          setProfileUser(data);
          setIsFollowing(data.followers?.includes(viewerUid) || false);
          
          const postsQuery = query(
            collection(db, 'world_posts'),
            where('authorId', '==', targetUserId),
            orderBy('createdAt', 'desc')
          );
          const unsub = onSnapshot(postsQuery, (snapshot) => {
            setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
          });
          return () => unsub();
        } else {
          toast.error('المستخدم غير موجود');
          onBack?.();
        }
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [targetUserId, viewerUid]);

  const handleFollow = async () => {
    if (!viewerUid || !profileUser) return;
    try {
      const userRef = doc(db, 'world_users', profileUser.uid);
      const viewerRef = doc(db, 'world_users', viewerUid);
      
      if (isFollowing) {
        await updateDoc(userRef, { followers: arrayRemove(viewerUid) });
        await updateDoc(viewerRef, { following: arrayRemove(profileUser.uid) });
        setIsFollowing(false);
        toast.success('تم إلغاء المتابعة');
      } else {
        await updateDoc(userRef, { followers: arrayUnion(viewerUid) });
        await updateDoc(viewerRef, { following: arrayUnion(profileUser.uid) });
        setIsFollowing(true);
        toast.success('تمت المتابعة');
      }
    } catch (e) {
      toast.error('فشل الإجراء');
    }
  };

  const handleLike = async (postId, currentLikes = []) => {
    if (!viewerUid) return;
    const postRef = doc(db, 'world_posts', postId);
    if (currentLikes.includes(viewerUid)) {
      await updateDoc(postRef, { likes: arrayRemove(viewerUid) });
    } else {
      await updateDoc(postRef, { likes: arrayUnion(viewerUid) });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24" dir="rtl">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-5 pt-12 pb-4 shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-gray-900">{profileUser.displayName}</h1>
            <p className="text-xs text-gray-500">@{profileUser.username}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="relative bg-white border-b border-gray-100 px-5 pt-8 pb-6">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-white mb-4">
              {profileUser.displayName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{profileUser.displayName}</h2>
            <p className="text-sm text-gray-500">@{profileUser.username}</p>
            {profileUser.bio && (
              <p className="text-sm text-gray-600 mt-2 text-center max-w-xs">{profileUser.bio}</p>
            )}

            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{profileUser.followers?.length || 0}</p>
                <p className="text-xs text-gray-500">متابع</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{profileUser.following?.length || 0}</p>
                <p className="text-xs text-gray-500">يتابع</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{posts.length}</p>
                <p className="text-xs text-gray-500">منشور</p>
              </div>
            </div>

            {!isOwnProfile && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleFollow}
                className={`mt-5 px-8 py-2.5 rounded-full font-bold text-sm transition-all ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                    : 'bg-purple-600 text-white shadow-md shadow-purple-200 hover:bg-purple-700'
                }`}
              >
                {isFollowing ? (
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    متابَع
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    متابعة
                  </span>
                )}
              </motion.button>
            )}
          </div>
        </div>

        <div className="px-4 py-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-500 mb-2">المنشورات</h3>
          {posts.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">لا توجد منشورات بعد</p>
            </div>
          ) : (
            posts.map(post => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
              >
                <p className="text-gray-800 text-sm leading-relaxed mb-3">{post.text}</p>
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="Post" className="w-full h-48 object-cover rounded-xl mb-3" />
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleLike(post.id, post.likes || [])}
                    className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                      (post.likes || []).includes(viewerUid)
                        ? 'text-red-500 bg-red-50'
                        : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${(post.likes || []).includes(viewerUid) ? 'fill-red-500' : ''}`} />
                    {(post.likes || []).length}
                  </button>
                  <button className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl text-gray-500">
                    <MessageCircle className="w-4 h-4" />
                    {(post.comments || []).length}
                  </button>
                  <button className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl text-gray-500">
                    <Repeat2 className="w-4 h-4" />
                    {(post.reposts || []).length}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}