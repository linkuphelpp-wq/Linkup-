import { createContext, useContext, useState, useCallback } from 'react';

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
        setLockEnabled(true);
        setIsLocked(false);
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
    setLockEnabled(false);
    setIsLocked(false);
  };

  const lockNow = useCallback(() => {
    if (lockEnabled) setIsLocked(true);
  }, [lockEnabled]);

  return (
    <AppLockContext.Provider value={{
      lockEnabled, isLocked, biometricEnabled,
      enableBiometric, verifyBiometric, disableBiometric, lockNow
    }}>
      {children}
    </AppLockContext.Provider>
  );
}