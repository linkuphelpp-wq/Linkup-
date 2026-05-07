import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppLockContext = createContext();

export const useAppLock = () => useContext(AppLockContext);

export function AppLockProvider({ children }) {
  const [lockEnabled, setLockEnabled] = useState(() => {
    return localStorage.getItem('app_lock_enabled') === 'true';
  });
  const [pin, setPin] = useState(() => {
    return localStorage.getItem('app_lock_pin') || '';
  });
  const [isLocked, setIsLocked] = useState(() => {
    return lockEnabled && !!localStorage.getItem('app_lock_pin');
  });
  const [lockTimeout, setLockTimeout] = useState(() => {
    return parseInt(localStorage.getItem('app_lock_timeout') || '0', 10);
  });
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);

  const lastActivityRef = useState(Date.now());

  useEffect(() => {
    if (!lockEnabled || !pin) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => {
      lastActivityRef[1](Date.now());
    };

    events.forEach(e => window.addEventListener(e, handleActivity));

    const interval = setInterval(() => {
      if (lockTimeout > 0 && Date.now() - lastActivityRef[0] > lockTimeout * 1000) {
        setIsLocked(true);
      }
    }, 1000);

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      clearInterval(interval);
    };
  }, [lockEnabled, pin, lockTimeout]);

  const enableLock = useCallback((newPin, timeout = 0) => {
    localStorage.setItem('app_lock_enabled', 'true');
    localStorage.setItem('app_lock_pin', newPin);
    localStorage.setItem('app_lock_timeout', timeout.toString());
    setLockEnabled(true);
    setPin(newPin);
    setLockTimeout(timeout);
    setIsLocked(false);
  }, []);

  const disableLock = useCallback(() => {
    localStorage.removeItem('app_lock_enabled');
    localStorage.removeItem('app_lock_pin');
    localStorage.removeItem('app_lock_timeout');
    setLockEnabled(false);
    setPin('');
    setIsLocked(false);
    setFailedAttempts(0);
    setLockUntil(null);
  }, []);

  const verifyPin = useCallback((enteredPin) => {
    if (lockUntil && Date.now() < lockUntil) {
      return { success: false, locked: true, remainingTime: Math.ceil((lockUntil - Date.now()) / 1000) };
    }

    if (enteredPin === pin) {
      setIsLocked(false);
      setFailedAttempts(0);
      setLockUntil(null);
      lastActivityRef[1](Date.now());
      return { success: true };
    }

    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);

    if (newAttempts >= 3) {
      setLockUntil(Date.now() + 60000); // قفل لمدة دقيقة
      return { success: false, locked: true, remainingTime: 60 };
    }

    return { success: false, locked: false, attemptsLeft: 3 - newAttempts };
  }, [pin, failedAttempts, lockUntil]);

  const lockNow = useCallback(() => {
    if (lockEnabled && pin) {
      setIsLocked(true);
    }
  }, [lockEnabled, pin]);

  return (
    <AppLockContext.Provider value={{
      lockEnabled, pin, isLocked, lockTimeout, failedAttempts, lockUntil,
      enableLock, disableLock, verifyPin, lockNow
    }}>
      {children}
    </AppLockContext.Provider>
  );
}