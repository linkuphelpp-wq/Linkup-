import { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  const [lockEnabled, setLockEnabled] = useState(() => localStorage.getItem('app_lock_enabled') === 'true');
  const [pin, setPin] = useState(() => localStorage.getItem('app_lock_pin') || '');
  const [isLocked, setIsLocked] = useState(() => lockEnabled && !!pin);
  const [lockTimeout, setLockTimeout] = useState(() => parseInt(localStorage.getItem('app_lock_timeout') || '0', 10));
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);
  const [biometricEnabled, setBiometricEnabled] = useState(() => localStorage.getItem('app_lock_biometric') === 'true');

  const lastActivityRef = useState(Date.now());

  useEffect(() => {
    if (!lockEnabled || !pin) return;
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => { lastActivityRef[1](Date.now()); };
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
    localStorage.removeItem('app_lock_biometric');
    localStorage.removeItem('app_lock_credential_id');
    localStorage.removeItem('app_lock_public_key');
    setLockEnabled(false);
    setPin('');
    setIsLocked(false);
    setBiometricEnabled(false);
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
      setLockUntil(Date.now() + 60000);
      return { success: false, locked: true, remainingTime: 60 };
    }
    return { success: false, locked: false, attemptsLeft: 3 - newAttempts };
  }, [pin, failedAttempts, lockUntil]);

  const lockNow = useCallback(() => {
    if (lockEnabled && pin) setIsLocked(true);
  }, [lockEnabled, pin]);

  // ───────── دوال البصمة ─────────
  const enableBiometric = async () => {
    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array([8, 12, 3, 77, 94, 4, 1]),
          rp: { name: 'LinkUp App' },
          user: {
            id: new Uint8Array(16),
            name: 'user@linkup.app',
            displayName: 'LinkUp User',
          },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
          attestation: 'none',
        },
      });
      if (credential) {
        const credentialId = arrayBufferToBase64(credential.rawId);
        localStorage.setItem('app_lock_credential_id', credentialId);
        localStorage.setItem('app_lock_biometric', 'true');
        setBiometricEnabled(true);
        return true;
      }
    } catch (e) {
      console.error('Biometric registration failed', e);
      alert('فشل تفعيل البصمة. قد لا يدعم جهازك هذه الميزة.');
    }
    return false;
  };

  const verifyBiometric = async () => {
    if (!biometricEnabled) return { success: false, error: 'البصمة غير مفعلة' };
    const credentialId = localStorage.getItem('app_lock_credential_id');
    if (!credentialId) return { success: false, error: 'بيانات البصمة مفقودة' };

    try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array([9, 34, 5, 66, 12, 4, 8]),
          allowCredentials: [{
            id: base64ToArrayBuffer(credentialId),
            type: 'public-key',
          }],
          timeout: 60000,
          userVerification: 'required',
        },
      });
      if (assertion) {
        setIsLocked(false);
        setFailedAttempts(0);
        setLockUntil(null);
        lastActivityRef[1](Date.now());
        return { success: true };
      }
    } catch (e) {
      console.error('Biometric verification failed', e);
    }
    return { success: false, error: 'فشل التحقق من البصمة' };
  };

  const disableBiometric = () => {
    localStorage.removeItem('app_lock_biometric');
    localStorage.removeItem('app_lock_credential_id');
    setBiometricEnabled(false);
  };

  return (
    <AppLockContext.Provider value={{
      lockEnabled, pin, isLocked, lockTimeout, failedAttempts, lockUntil, biometricEnabled,
      enableLock, disableLock, verifyPin, lockNow,
      enableBiometric, verifyBiometric, disableBiometric,
    }}>
      {children}
    </AppLockContext.Provider>
  );
}