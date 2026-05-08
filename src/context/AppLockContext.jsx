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
  const [isLocked, setIsLocked] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(() => lockEnabled);
  const [lockTimer, setLockTimer] = useState(() => localStorage.getItem('app_lock_timer') || 'immediate');
  const [isAppVisible, setIsAppVisible] = useState(true); // ✅ حالة الشاشة البيضاء

  const timerRef = useRef(null);
  const isReturningRef = useRef(false);

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
        setIsAppVisible(true); // ✅ أظهر المحتوى بعد نجاح البصمة
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
        isReturningRef.current = true;
        setTimeout(() => { isReturningRef.current = false; }, 500);
        return { success: true };
      }
    } catch (e) { console.error(e); }
    return { success: false };
  };

  const disableBiometric = () => {
    localStorage.removeItem('app_lock_biometric');
    localStorage.removeItem('app_lock_credential_id');
    localStorage.removeItem('app_lock_timer');
    setBiometricEnabled(false);
    setLockEnabled(false);
    setIsLocked(false);
    setIsAppVisible(true);
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  // ✅ آلية الخروج والعودة مع إخفاء المحتوى فورًا
  useEffect(() => {
    if (!lockEnabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // ✅ الخروج: إخفاء المحتوى فورًا (شاشة بيضاء)
        setIsAppVisible(false);

        if (timerRef.current) clearTimeout(timerRef.current);
        if (lockTimer === 'immediate') {
          // لا شيء، سنقفل عند العودة
        } else {
          timerRef.current = setTimeout(() => {
            setIsLocked(true);
          }, lockTimer === '30s' ? 30000 : 300000);
        }
      } else {
        // العودة إلى التطبيق
        if (isReturningRef.current) return;

        if (lockTimer === 'immediate') {
          setIsLocked(true);
        } else if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
          setIsLocked(false);
          setIsAppVisible(true);
        }
        // إن كان المؤقت قد انتهى، isLocked سيكون true بالفعل وسنعرض شاشة القفل
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lockEnabled, lockTimer]);

  return (
    <AppLockContext.Provider value={{
      lockEnabled, isLocked, biometricEnabled, lockTimer, isAppVisible,
      enableBiometric, verifyBiometric, disableBiometric,
      setTimerOption,
    }}>
      {children}
    </AppLockContext.Provider>
  );
}