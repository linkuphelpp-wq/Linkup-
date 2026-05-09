import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AppLockContext = createContext();
export const useAppLock = () => useContext(AppLockContext);

export function AppLockProvider({ children }) {
  // حالة القفل
  const [lockEnabled, setLockEnabled] = useState(() => {
    const pin = localStorage.getItem('app_lock_pin');
    return pin !== null && pin.length >= 4;
  });
  const [isLocked, setIsLocked] = useState(false);
  const [showPrivacyShield, setShowPrivacyShield] = useState(false);
  const [autoVerify, setAutoVerify] = useState(() =>
    localStorage.getItem('app_lock_auto_verify') === 'true'
  );
  const [lockTimer, setLockTimer] = useState(() =>
    localStorage.getItem('app_lock_timer') || 'immediate'
  );

  const timerRef = useRef(null);
  const isReturningFromAuth = useRef(false);

  // إدارة دورة حياة القفل
  useEffect(() => {
    if (!lockEnabled) {
      setIsLocked(false);
      setShowPrivacyShield(false);
      return;
    }

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

  // ضبط المؤقت عند تبديل التطبيق
  useEffect(() => {
    if (!lockEnabled || isLocked) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowPrivacyShield(true);
        if (timerRef.current) clearTimeout(timerRef.current);

        if (lockTimer === 'immediate') {
          setIsLocked(true);
        } else {
          timerRef.current = setTimeout(() => {
            setIsLocked(true);
          }, lockTimer === '30s' ? 30000 : 300000);
        }
      } else {
        if (isReturningFromAuth.current) return;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
          setIsLocked(false);
          setShowPrivacyShield(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lockEnabled, isLocked, lockTimer]);

  // ========== دوال PIN الجديدة ==========
  const setPIN = useCallback((pin) => {
    if (pin && pin.length >= 4) {
      localStorage.setItem('app_lock_pin', pin);
      setLockEnabled(true);
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
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      isReturningFromAuth.current = true;
      setTimeout(() => { isReturningFromAuth.current = false; }, 500);
      return true;
    }
    return false;
  }, []);

  const disableLock = useCallback(() => {
    localStorage.removeItem('app_lock_pin');
    localStorage.removeItem('app_lock_auto_verify');
    localStorage.removeItem('app_lock_timer');
    setLockEnabled(false);
    setIsLocked(false);
    setShowPrivacyShield(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setTimerOption = useCallback((option) => {
    localStorage.setItem('app_lock_timer', option);
    setLockTimer(option);
  }, []);

  const setAutoVerifyOption = useCallback((val) => {
    localStorage.setItem('app_lock_auto_verify', val);
    setAutoVerify(val);
  }, []);

  return (
    <AppLockContext.Provider value={{
      lockEnabled, isLocked, lockTimer, showPrivacyShield, autoVerify,
      setPIN, verifyPIN, disableLock,
      setTimerOption, setAutoVerifyOption,
    }}>
      {children}
    </AppLockContext.Provider>
  );
}