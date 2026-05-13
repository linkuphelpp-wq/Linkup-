import { useEffect, useState, useCallback, useRef } from 'react';
import {
  createPeer,
  getPeer,
  callPeer,
  answerCall,
  endCall,
  destroyPeer,
} from '../services/peerService';
import { db, auth } from '../firebase/config';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export const usePeer = () => {
  const [myId, setMyId] = useState('');
  const [callStatus, setCallStatus] = useState('متوقف');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteUserData, setRemoteUserData] = useState(null);
  const dataConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const currentUserId = auth.currentUser?.uid;

  // حالات المكالمة الواردة
  const [incomingCall, setIncomingCall] = useState(null);
  const [incomingCallerInfo, setIncomingCallerInfo] = useState(null);
  const [incomingCallType, setIncomingCallType] = useState('audio');

  // إنشاء PeerJS وكتابة peerId
  useEffect(() => {
    if (!currentUserId) return;

    const peer = createPeer();

    peer.on('open', (id) => {
      setMyId(id);
      // كتابة peerId في Firestore بشكل موثوق
      setDoc(doc(db, 'peers', currentUserId), { peerId: id, updatedAt: new Date() }).catch(err => {
        console.error('فشل كتابة peerId:', err);
      });
    });

    peer.on('connection', (conn) => {
      dataConnectionRef.current = conn;
      conn.on('data', (data) => setRemoteUserData(data));
    });

    // 📥 التعامل مع المكالمة الواردة
    peer.on('call', (call) => {
      const callType = call.metadata?.video ? 'video' : 'audio';
      setIncomingCall(call);
      setIncomingCallType(callType);

      const fetchCaller = async () => {
        try {
          const q = query(collection(db, 'peers'), where('peerId', '==', call.peer));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const peerDoc = snap.docs[0];
            const callerUid = peerDoc.id;
            const userSnap = await getDoc(doc(db, 'users', callerUid));
            if (userSnap.exists()) {
              const data = userSnap.data();
              setIncomingCallerInfo({
                displayName: data.displayName || callerUid,
                photoURL: data.photoURL || '',
                username: data.username || '',
              });
            } else {
              setIncomingCallerInfo({ displayName: 'مستخدم', photoURL: '', username: '' });
            }
          } else {
            setIncomingCallerInfo({ displayName: 'مستخدم', photoURL: '', username: '' });
          }
        } catch {
          setIncomingCallerInfo({ displayName: 'مستخدم', photoURL: '', username: '' });
        }
      };
      fetchCaller();

      call.on('close', () => {
        setIncomingCall(null);
        setIncomingCallerInfo(null);
        setCallStatus('متوقف');
      });
    });

    peer.on('error', (err) => setCallStatus(`خطأ: ${err.type}`));

    return () => {
      destroyPeer();
      if (currentUserId) {
        // إزالة peerId عند الخروج (اختياري، لكن يمنع البقاء)
        setDoc(doc(db, 'peers', currentUserId), { peerId: null, updatedAt: new Date() }).catch(() => {});
      }
    };
  }, [currentUserId]);

  // قبول المكالمة الواردة
  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCall) return;
    const tryGetMedia = async (video) => {
      try {
        return await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: video ? { facingMode: 'user' } : false,
        });
      } catch (e) {
        if (video) {
          console.warn('فشل الوصول للكاميرا، سيتم الرد بالصوت فقط.');
          return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        }
        throw e;
      }
    };

    try {
      const useVideo = incomingCallType === 'video';
      const stream = await tryGetMedia(useVideo);
      setLocalStream(stream);
      localStreamRef.current = stream;

      answerCall(incomingCall, stream);
      setCallStatus('متصل (مستقبل)');

      incomingCall.on('stream', (remoteStream) => setRemoteStream(remoteStream));
      incomingCall.on('close', () => {
        setCallStatus('انتهت المكالمة');
        setRemoteStream(null);
        setRemoteUserData(null);
        dataConnectionRef.current = null;
      });

      setIncomingCall(null);
    } catch {
      setCallStatus('خطأ في الوسائط (تأكد من صلاحيات الميكروفون)');
      setIncomingCall(null);
    }
  }, [incomingCall, incomingCallType]);

  // رفض المكالمة
  const rejectIncomingCall = useCallback(() => {
    if (incomingCall) {
      if (dataConnectionRef.current && dataConnectionRef.current.open) {
        dataConnectionRef.current.send({ type: 'rejected' });
      }
      incomingCall.close();
      setIncomingCall(null);
      setIncomingCallerInfo(null);
      setCallStatus('متوقف');
    }
  }, [incomingCall]);

  // بدء مكالمة صادرة
  const startCall = useCallback(async (remotePeerId, userData, callType = 'audio') => {
    if (!remotePeerId) return;
    const peer = getPeer();
    if (!peer) {
      console.error('الـ Peer غير موجود');
      return;
    }

    const tryGetMedia = async (video) => {
      try {
        return await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: video ? { facingMode: 'user' } : false,
        });
      } catch (e) {
        if (video) {
          console.warn('فشل الوصول للكاميرا، سيتم الاتصال بالصوت فقط.');
          return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        }
        throw e;
      }
    };

    try {
      const stream = await tryGetMedia(callType === 'video');
      setLocalStream(stream);
      localStreamRef.current = stream;

      const call = callPeer(remotePeerId, stream, { metadata: { video: callType === 'video' } });
      setCallStatus('جاري الاتصال...');

      const conn = peer.connect(remotePeerId, { reliable: true });
      dataConnectionRef.current = conn;
      conn.on('open', () => conn.send(userData));
      conn.on('data', (data) => {
        if (data?.type === 'rejected') {
          setCallStatus('تم رفض المكالمة');
          stopCall();
        } else {
          setRemoteUserData(data);
        }
      });

      call.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
        setCallStatus('متصل (بادئ)');
      });
      call.on('close', () => {
        setCallStatus('انتهت المكالمة');
        setRemoteStream(null);
        setRemoteUserData(null);
        dataConnectionRef.current = null;
      });
      call.on('error', () => setCallStatus('فشل الاتصال'));
      return call;
    } catch (err) {
      setCallStatus('خطأ في الوسائط (تأكد من صلاحيات الميكروفون)');
      return null;
    }
  }, []);

  const stopCall = useCallback(() => {
    endCall();
    if (dataConnectionRef.current) {
      dataConnectionRef.current.close();
      dataConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setCallStatus('متوقف');
    setRemoteUserData(null);
  }, []);

  const switchCamera = useCallback(async () => {
    // ... (تبقى كما هي)
  }, []);

  const toggleVideo = useCallback(() => {
    // ... (تبقى كما هي)
  }, []);

  const isVideoEnabled = () => localStreamRef.current?.getVideoTracks()[0]?.enabled ?? false;

  const getRemotePeerId = useCallback(async (uid) => {
    try {
      const snap = await getDoc(doc(db, 'peers', uid));
      if (snap.exists()) {
        const data = snap.data();
        return data.peerId || null;
      }
      return null;
    } catch (err) {
      console.error('فشل جلب peerId:', err);
      return null;
    }
  }, []);

  return {
    myId,
    callStatus,
    localStream,
    remoteStream,
    remoteUserData,
    startCall,
    stopCall,
    switchCamera,
    toggleVideo,
    isVideoEnabled,
    getRemotePeerId,
    incomingCall,
    incomingCallerInfo,
    incomingCallType,
    acceptIncomingCall,
    rejectIncomingCall,
  };
};