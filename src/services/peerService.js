import { Peer } from 'peerjs';

let peerInstance = null;
let currentCall = null;

export const createPeer = () => {
  // تنظيف أي مثيل سابق
  if (peerInstance) {
    try { peerInstance.destroy(); } catch (e) {}
    peerInstance = null;
  }

  peerInstance = new Peer({
    debug: 1, // 0=صامت, 1=أخطاء فقط
    pingInterval: 5000,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' }
      ]
    }
  });

  // مراقبة الأخطاء وإعادة الاتصال
  peerInstance.on('error', (err) => {
    console.warn('📞 PeerJS Warning:', err.type, err.message);
    if (err.type === 'unavailable-id') {
      console.warn('المعرف مستخدم أو منتهي، جاري إنشاء معرف جديد...');
    }
  });

  peerInstance.on('disconnected', () => {
    console.log('🔌 انقطع الاتصال بخادم الإشارة. جاري إعادة المحاولة...');
    if (peerInstance && !peerInstance.destroyed) {
      peerInstance.reconnect();
    }
  });

  peerInstance.on('close', () => {
    console.log('🔌 تم إغلاق Peer نهائياً.');
    peerInstance = null;
    currentCall = null;
  });

  return peerInstance;
};

export const getPeer = () => peerInstance;

export const callPeer = (peerId, stream, options = {}) => {
  if (!peerInstance) throw new Error('Peer not initialized');
  if (peerInstance.disconnected) peerInstance.reconnect();
  
  currentCall = peerInstance.call(peerId, stream, options);
  return currentCall;
};

export const answerCall = (call, stream) => {
  if (!call) throw new Error('No incoming call to answer');
  call.answer(stream);
  currentCall = call;
  return currentCall;
};

export const getCurrentCall = () => currentCall;

export const endCall = () => {
  if (currentCall) {
    try { currentCall.close(); } catch (e) {}
    currentCall = null;
  }
  return true;
};

export const destroyPeer = () => {
  if (currentCall) {
    try { currentCall.close(); } catch (e) {}
    currentCall = null;
  }
  if (peerInstance) {
    try { peerInstance.destroy(); } catch (e) {}
    peerInstance = null;
  }
};