// AppLockContext.jsx

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AppLockContext = createContext();
export const useAppLock = () => useContext(AppLockContext);

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function AppLockProvider({ children }) {
  const [lockEnabled, setLockEnabled] = useState(() => localStorage.getItem('app_lock_biometric') === 'true');
  const [isLocked, setIsLocked] = useState(() => lockEnabled);
  const [biometricEnabled, setBiometricEnabled] = useState(() => lockEnabled);
  
  // حالة إدارة التوقيت: 'immediate' | '30s' | '5m'
  const [lockTimer, setLockTimer] = useState(() => localStorage.getItem('app_lock_timer') || 'immediate');
  
  const timerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // حفظ التوقيت عند تغيره
  const setTimerOption = useCallback((option) => {
    localStorage.setItem('app_lock_timer', option);
    setLockTimer(option);
  }, []);

  // دالة لبدء القفل بعد مدة محددة
  const startLockTimer = useCallback(() => {
    if (!lockEnabled) return;
    
    if (timerRef.current) clearTimeout(timerRef.current);

    if (lockTimer === 'immediate') {
      setIsLocked(true);
    } else {
      const delay = lockTimer === '30s' ? 30000 : 300000; // 30 ثانية أو 5 دقائق
      timerRef.current = setTimeout(() => {
        setIsLocked(true);
      }, delay);
    }
  }, [lockEnabled, lockTimer]);

  // إلغاء القفل عند النشاط (إذا كان المستخدم قد عاد قبل انتهاء المدة)
  const resetLockTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (isLocked === false) return; // لا داعي للتغيير
    
    // إذا لم يكن القفل فوريًا وتم استئناف النشاط، ألغِ القفل
    if (lockTimer !== 'immediate') {
      setIsLocked(false);
    }
  }, [lockTimer, isLocked]);

  // مراقبة ظهور/اختفاء التطبيق (للإغلاق عند الخروج)
  useEffect(() => {
    if (!lockEnabled) return;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // خرج المستخدم من التطبيق -> بدء عداد القفل
        startLockTimer();
      } else {
        // عاد المستخدم -> إذا لم تنتهِ المدة، ألغِ القفل وأظهر التطبيق
        resetLockTimer();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lockEnabled, startLockTimer, resetLockTimer]);

  // تفعيل البصمة (تسجيل)
  const enableBiometric = async () => {
    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array([8, 12, 3, 77, 94, 4, 1]),
          rp: { name: 'LinkUp App' },
          user: { id: new Uint8Array(16), name: 'user@linkup.app', displayName: 'LinkUp User' },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
          authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
          timeout: 60000,
          attestation: 'none',
        },
      });
      if (credential) {
        const credentialId = arrayBufferToBase64(credential.rawId);
        localStorage.setItem('app_lock_credential_id', credentialId);
        localStorage.setItem('app_lock_biometric', 'true');
        setBiometricEnabled(true);
        setLockEnabled(true);
        setIsLocked(false);
        return true;
      }
    } catch (e) { console.error('Biometric registration failed', e); }
    return false;
  };

  // التحقق من البصمة
  const verifyBiometric = async () => {
    if (!biometricEnabled) return { success: false };
    const credentialId = localStorage.getItem('app_lock_credential_id');
    if (!credentialId) return { success: false };
    try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array([9, 34, 5, 66, 12, 4, 8]),
          allowCredentials: [{ id: base64ToArrayBuffer(credentialId), type: 'public-key' }],
          timeout: 60000,
          userVerification: 'required',
        },
      });
      if (assertion) {
        setIsLocked(false);
        resetLockTimer();
        return { success: true };
      }
    } catch (e) { console.error('Biometric verification failed', e); }
    return { success: false };
  };

  const disableBiometric = () => {
    localStorage.removeItem('app_lock_biometric');
    localStorage.removeItem('app_lock_credential_id');
    localStorage.removeItem('app_lock_timer');
    setBiometricEnabled(false);
    setLockEnabled(false);
    setIsLocked(false);
  };

  return (
    <AppLockContext.Provider value={{
      lockEnabled, isLocked, biometricEnabled, lockTimer,
      enableBiometric, verifyBiometric, disableBiometric,
      setTimerOption, startLockTimer, resetLockTimer,
    }}>
      {children}
    </AppLockContext.Provider>
  );
}