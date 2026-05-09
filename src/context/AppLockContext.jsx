import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AppLockContext = createContext();
export const useAppLock = () => useContext(AppLockContext);

export function AppLockProvider({ children }) {
  const [lockEnabled, setLockEnabled] = useState(() => {
    const pin = localStorage.getItem('app_lock_pin');
    return pin !== null && pin.length >= 4;
  });
  const [pinLength, setPinLength] = useState(() => {
    const len = localStorage.getItem('app_lock_pin_length');
    return len ? parseInt(len, 10) : 4;
  });
  const [isLocked, setIsLocked] = useState(false);
  const [showPrivacyShield, setShowPrivacyShield] = useState(false);
  const [autoVerify, setAutoVerify] = useState(() =>
    localStorage.getItem('app_lock_auto_verify') === 'true'
  );

  const isReturningFromAuth = useRef(false);

  // عند تفعيل القفل لأول مرة بعد إعادة تحميل الصفحة
  useEffect(() => {
    if (!lockEnabled) {
      setIsLocked(false);
      setShowPrivacyShield(false);
      return;
    }

    // إذا كانت الجلسة جديدة، نقفل
    if (!sessionStorage.getItem('app_lock_session')) {
      setIsLocked(true);
      setShowPrivacyShield(true);
    }
    sessionStorage.setItem('app_lock_session', 'true');

    const clearSession = () => {
      sessionStorage.removeItem('app_lock_session');
    };
    window.addEventListener('pagehide', clearSession);
    window.addEventListener('beforeunload', clearSession);

    return () => {
      window.removeEventListener('pagehide', clearSession);
      window.removeEventListener('beforeunload', clearSession);
    };
  }, [lockEnabled]);

  // القفل الفوري عند إخفاء التطبيق
  useEffect(() => {
    if (!lockEnabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // إخفاء المحتوى وقفل فوري
        setShowPrivacyShield(true);
        setIsLocked(true);
      } else {
        // عند العودة لا نفتح القفل تلقائياً، يبقى PinLockScreen ظاهراً
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lockEnabled]);

  // دوال PIN
  const setPIN = useCallback((pin) => {
    if (pin && pin.length >= 4) {
      localStorage.setItem('app_lock_pin', pin);
      localStorage.setItem('app_lock_pin_length', pin.length.toString());
      setLockEnabled(true);
      setPinLength(pin.length);
      setIsLocked(false);
      setShowPrivacyShield(false);
      return true;
    }
    return false;
  }, []);

  const verifyPIN = useCallback((pin) => {
    const stored = localStorage.getItem('app_lock_pin');
    if (stored === pin) {
      setIsLocked(false);
      setShowPrivacyShield(false);
      isReturningFromAuth.current = true;
      setTimeout(() => { isReturningFromAuth.current = false; }, 500);
      return true;
    }
    return false;
  }, []);

  const disableLock = useCallback(() => {
    localStorage.removeItem('app_lock_pin');
    localStorage.removeItem('app_lock_pin_length');
    localStorage.removeItem('app_lock_auto_verify');
    setLockEnabled(false);
    setIsLocked(false);
    setShowPrivacyShield(false);
  }, []);

  const setAutoVerifyOption = useCallback((val) => {
    localStorage.setItem('app_lock_auto_verify', val);
    setAutoVerify(val);
  }, []);

  return (
    <AppLockContext.Provider value={{
      lockEnabled, isLocked, showPrivacyShield, autoVerify, pinLength,
      setPIN, verifyPIN, disableLock, setAutoVerifyOption,
    }}>
      {children}
    </AppLockContext.Provider>
  );
}