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
  const isBiometricConfigured = localStorage.getItem('app_lock_biometric') === 'true';
  
  const [lockEnabled, setLockEnabled] = useState(isBiometricConfigured);
  const [isLocked, setIsLocked] = useState(isBiometricConfigured); 
  const [biometricEnabled, setBiometricEnabled] = useState(isBiometricConfigured);
  const [lockTimer, setLockTimer] = useState(() => localStorage.getItem('app_lock_timer') || 'immediate');

  const timerRef = useRef(null);
  const isVerifyingRef = useRef(false); // لمنع إعادة القفل أثناء ظهور نافذة البصمة

  const setTimerOption = useCallback((option) => {
    localStorage.setItem('app_lock_timer', option);
    setLockTimer(option);
  }, []);

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
    } catch (e) { console.error(e); }
    return false;
  };

  const verifyBiometric = async () => {
    if (!biometricEnabled) return { success: false };
    const credentialId = localStorage.getItem('app_lock_credential_id');
    if (!credentialId) return { success: false };
    
    isVerifyingRef.current = true; // نحن الآن في عملية تحقق، لا تقفل الشاشة
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
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
        // انتظر قليلاً قبل السماح بإعادة القفل لضمان استقرار الشاشة
        setTimeout(() => { isVerifyingRef.current = false; }, 1000);
        return { success: true };
      }
    } catch (e) { 
      console.error(e);
      isVerifyingRef.current = false;
    }
    return { success: false };
  };

  const disableBiometric = () => {
    localStorage.removeItem('app_lock_biometric');
    localStorage.removeItem('app_lock_credential_id');
    localStorage.removeItem('app_lock_timer');
    setBiometricEnabled(false);
    setLockEnabled(false);
    setIsLocked(false);
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  useEffect(() => {
    if (!lockEnabled) return;

    const handleLockTrigger = () => {
      if (isVerifyingRef.current) return; // لا تقفل إذا كانت نافذة البصمة مفتوحة أصلاً

      if (lockTimer === 'immediate') {
        setIsLocked(true);
      } else {
        const delay = lockTimer === '30s' ? 30000 : 300000;
        if (!timerRef.current) {
          timerRef.current = setTimeout(() => {
            setIsLocked(true);
          }, delay);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleLockTrigger();
      } else {
        if (!isLocked && timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    };

    // هذا هو السر: عند سحب قائمة المهام، يفقد التطبيق التركيز (blur)
    // فنقوم بإظهار شاشة القفل فوراً (التي هي بيضاء) لكي لا يظهر المحتوى في المعاينة
    const handleBlur = () => {
      if (lockTimer === 'immediate' && !isVerifyingRef.current) {
        setIsLocked(true);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [lockEnabled, lockTimer, isLocked]);

  return (
    <AppLockContext.Provider value={{
      lockEnabled, isLocked, biometricEnabled, lockTimer,
      enableBiometric, verifyBiometric, disableBiometric,
      setTimerOption,
    }}>
      {children}
    </AppLockContext.Provider>
  );
}
