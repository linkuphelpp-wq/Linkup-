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

// رموز استرداد مكونة من 6 أرقام
function generateRecoveryCodes(count = 6) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    let code = '';
    for (let j = 0; j < 6; j++) code += Math.floor(Math.random() * 10);
    codes.push(code);
  }
  return codes;
}

export function AppLockProvider({ children }) {
  const [lockEnabled, setLockEnabled] = useState(() => {
    const pin = localStorage.getItem('app_lock_pin');
    return pin !== null && pin.length >= 4;
  });
  const [pinLength, setPinLength] = useState(() => {
    const pin = localStorage.getItem('app_lock_pin');
    return pin ? pin.length : 4;
  });
  const [biometricEnabled, setBiometricEnabled] = useState(() =>
    localStorage.getItem('app_lock_biometric') === 'true'
  );
  const [isLocked, setIsLocked] = useState(false);
  const [showPrivacyShield, setShowPrivacyShield] = useState(false);
  const [autoVerify, setAutoVerify] = useState(() =>
    localStorage.getItem('app_lock_auto_verify') === 'true'
  );
  const [recoveryCodes, setRecoveryCodes] = useState(() => {
    try {
      const saved = localStorage.getItem('app_lock_recovery_codes');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // دورة حياة القفل
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
    const clearSession = () => sessionStorage.removeItem('app_lock_session');
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
        setShowPrivacyShield(true);
        setIsLocked(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lockEnabled]);

  // دالة فتح التطبيق الفعلية (تُستدعى بعد انتهاء الأنيميشن)
  const unlockApp = useCallback(() => {
    setIsLocked(false);
    setShowPrivacyShield(false);
  }, []);

  // دوال PIN
  const setPIN = useCallback((pin) => {
    if (pin && pin.length >= 4) {
      const codes = generateRecoveryCodes();
      localStorage.setItem('app_lock_pin', pin);
      localStorage.setItem('app_lock_recovery_codes', JSON.stringify(codes));
      localStorage.setItem('app_lock_pin_length', pin.length.toString());
      setLockEnabled(true);
      setPinLength(pin.length);
      setIsLocked(false);
      setShowPrivacyShield(false);
      setRecoveryCodes(codes);
      return { success: true, codes };
    }
    return { success: false };
  }, []);

  const verifyPIN = useCallback((pin) => {
    const stored = localStorage.getItem('app_lock_pin');
    return stored === pin;
  }, []);

  // يقبل رمز استرداد مكون من 6 أرقام
  const unlockWithRecoveryCode = useCallback((code) => {
    const stored = localStorage.getItem('app_lock_recovery_codes');
    if (!stored) return false;
    try {
      let codes = JSON.parse(stored);
      const index = codes.indexOf(code);
      if (index !== -1) {
        codes = codes.filter((_, i) => i !== index);
        localStorage.setItem('app_lock_recovery_codes', JSON.stringify(codes));
        setRecoveryCodes(codes);
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  }, []);

  const disableLock = useCallback(() => {
    localStorage.removeItem('app_lock_pin');
    localStorage.removeItem('app_lock_pin_length');
    localStorage.removeItem('app_lock_auto_verify');
    localStorage.removeItem('app_lock_recovery_codes');
    localStorage.removeItem('app_lock_biometric');
    localStorage.removeItem('app_lock_credential_id');
    setLockEnabled(false);
    setIsLocked(false);
    setShowPrivacyShield(false);
    setRecoveryCodes([]);
    setBiometricEnabled(false);
  }, []);

  const setAutoVerifyOption = useCallback((val) => {
    localStorage.setItem('app_lock_auto_verify', val);
    setAutoVerify(val);
  }, []);

  // دوال بصمة الإصبع
  const enableBiometric = useCallback(async () => {
    if (!window.PublicKeyCredential) {
      return { success: false, error: 'not_supported' };
    }
    
    try {
      const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!isAvailable) {
        return { success: false, error: 'not_supported' };
      }

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array([8, 12, 3, 77, 94, 4, 1]),
          rp: { name: 'تطبيقنا' },
          user: { id: new Uint8Array(16), name: 'user@app', displayName: 'المستخدم' },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
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
        return { success: true };
      }
    } catch (e) { 
      console.error('فشل تسجيل البصمة:', e);
      return { success: false, error: e.message };
    }
    return { success: false, error: 'unknown' };
  }, []);

  const verifyBiometric = useCallback(async () => {
    if (!biometricEnabled) return false;
    const credentialId = localStorage.getItem('app_lock_credential_id');
    if (!credentialId) return false;
    
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
        return true;
      }
    } catch (e) { 
      console.error('فشل التحقق من البصمة:', e); 
    }
    return false;
  }, [biometricEnabled]);

  const disableBiometric = useCallback(() => {
    localStorage.removeItem('app_lock_biometric');
    localStorage.removeItem('app_lock_credential_id');
    setBiometricEnabled(false);
  }, []);

  return (
    <AppLockContext.Provider value={{
      lockEnabled, isLocked, showPrivacyShield, autoVerify, pinLength, recoveryCodes, biometricEnabled,
      setPIN, verifyPIN, disableLock, setAutoVerifyOption, unlockWithRecoveryCode, unlockApp,
      enableBiometric, verifyBiometric, disableBiometric,
    }}>
      {children}
    </AppLockContext.Provider>
  );
}
