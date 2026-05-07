import { useState, useEffect, useRef, useCallback } from 'react';
import SplashScreen from './components/common/SplashScreen';
import AuthScreen from './features/auth/AuthScreen';
import VerifyEmailScreen from './features/auth/VerifyEmailScreen';
import ForgotPasswordScreen from './features/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './features/auth/ResetPasswordScreen';
import HomeScreen from './features/home/HomeScreen';
import ProfileScreen from './features/profile/ProfileScreen';
import SettingsScreen from './features/Settings/SettingsScreen';
import ContactsScreen from './features/contacts/ContactsScreen';
import AtheerScreen from './features/atheer/AtheerScreen';
import AboutScreen from './features/about/AboutScreen';
import PrivacyPolicyScreen from './features/Settings/PrivacyPolicyScreen';
import TermsOfServiceScreen from './features/Settings/TermsOfServiceScreen';
import DataManagementScreen from './features/Settings/DataManagementScreen';
import AppLockScreen from './features/Settings/AppLockScreen';
import ChangeEmailScreen from './features/profile/ChangeEmailScreen';
import ResetPasswordProfileScreen from './features/profile/ResetPasswordScreen';
import CallScreen from './features/call/CallScreen';
import ChatScreen from './features/chat/ChatScreen';
import AdminScreen from './features/admin/AdminScreen';
import UserManagementScreen from './features/UserManagement/UserManagementScreen';
import PartnerScreen from './features/partner/PartnerScreen';
import NotificationsScreen from './features/notifications/NotificationsScreen';
import OnboardingScreen from './components/onboarding/OnboardingScreen';
import SupportScreen from './features/Support/SupportScreen';
import GroupsScreen from './features/groups/GroupsScreen';
import CreateGroupScreen from './features/groups/CreateGroupScreen';
import MainMenuScreen from './features/home/MainMenuScreen';
import DisplayNameModal from './components/common/DisplayNameModal';
import WelcomeModal from './components/common/WelcomeModal';
import UsernameModal from './components/common/UsernameModal';
import BannedModal from './components/common/BannedModal';
import WarningModal from './components/common/WarningModal';
import IncomingCallModal from './components/common/IncomingCallModal';
import InstallGuide from './components/common/InstallGuide';
import GroupChatScreen from './features/groups/GroupChatScreen';
import GroupInfoScreen from './features/groups/GroupInfoScreen';
import { usePeer } from './hooks/usePeer';
import { usePresence } from './hooks/usePresence';
import { db, auth } from './firebase/config';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Home, UsersRound, User, Settings, Shield, Bell, ArrowLeft, Contact2 } from 'lucide-react';
import { Toaster } from 'sonner';
import './styles/App.css';

// ───────── الأيقونات المخصصة ─────────
const UsersIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const UsersRoundIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/></svg>;
const SettingsIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const UserIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ArrowLeftIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
const ShieldIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const BellIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;

// ───────── عناصر التنقل ─────────
const NavItem = ({ icon: Icon, label, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className="group relative flex flex-col items-center justify-center min-w-[3.5rem]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className={`absolute -top-12 transition-all duration-200 bg-black/80 backdrop-blur-md text-white text-[11px] px-3 py-1.5 rounded-full font-bold shadow-xl border border-white/10 whitespace-nowrap ${
          isHovered ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      >
        {label}
      </span>
      <div
        onClick={onClick}
        className={`w-11 h-11 md:w-12 md:h-12 flex items-center justify-center backdrop-blur-lg rounded-full border transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] cursor-pointer active:scale-90 ${
          isActive ? 'bg-white text-black border-white/40 shadow-lg scale-110' : 'bg-white/10 text-gray-700 border-white/20'
        }`}
      >
        <Icon />
      </div>
    </div>
  );
};

const BottomNav = ({ currentScreen, onNavigate, isAdmin, onOpenAdmin, onOpenUserManagement }) => (
  <div
    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg"
    style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
  >
    <div className="flex items-center justify-center gap-1.5 px-3 py-3 bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
      <NavItem icon={Home} label="الرئيسية" isActive={currentScreen === 'mainMenu'} onClick={() => onNavigate('mainMenu')} />
      <NavItem icon={Contact2} label="جهات الاتصال" isActive={currentScreen === 'contacts'} onClick={() => onNavigate('contacts')} />
      <NavItem icon={UsersRoundIcon} label="المجموعات" isActive={currentScreen === 'groups' || currentScreen === 'createGroup' || currentScreen === 'groupChat' || currentScreen === 'groupInfo'} onClick={() => onNavigate('groups')} />
      <NavItem icon={UserIcon} label="الملف الشخصي" isActive={currentScreen === 'profile'} onClick={() => onNavigate('profile')} />
      <NavItem icon={SettingsIcon} label="الإعدادات" isActive={currentScreen === 'settings'} onClick={() => onNavigate('settings')} />
      {isAdmin && (
        <>
          <NavItem icon={ShieldIcon} label="الإدارة" isActive={currentScreen === 'admin'} onClick={onOpenAdmin} />
          <NavItem icon={UserIcon} label="المستخدمين" isActive={currentScreen === 'usermanagement'} onClick={onOpenUserManagement} />
        </>
      )}
    </div>
  </div>
);

// ───────── المكون الرئيسي ─────────
function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callOpen, setCallOpen] = useState(false);
  const [remoteContact, setRemoteContact] = useState(null);
  const [callType, setCallType] = useState('audio');
  const [showNameModal, setShowNameModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [myUsername, setMyUsername] = useState(() => localStorage.getItem('my_username') || '');
  const [usernameResolved, setUsernameResolved] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [muteMicOnJoin, setMuteMicOnJoin] = useState(() => localStorage.getItem('muteMicOnJoin') === 'true');
  const [speakerDefault, setSpeakerDefault] = useState(() => localStorage.getItem('speakerDefault') === 'true');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'medium');
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('fontFamily') || 'tajawal');
  const [currentChatContact, setCurrentChatContact] = useState(null);
  const [bannedModalOpen, setBannedModalOpen] = useState(false);
  const [banType, setBanType] = useState('banned');
  const [pendingBan, setPendingBan] = useState(false);
  const banTriggered = useRef(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [currentScreen, setCurrentScreen] = useState('mainMenu');
  const [navHistory, setNavHistory] = useState(['mainMenu']);
  const [currentGroup, setCurrentGroup] = useState(null);

  // 🆕 حالة الاتصال بالإنترنت
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [modalQueue, setModalQueue] = useState([]);
  const [incomingCallActive, setIncomingCallActive] = useState(false);

  const {
    myId, callStatus, localStream, remoteStream, remoteUserData,
    startCall, stopCall, switchCamera, toggleVideo, isVideoEnabled, getRemotePeerId,
    incomingCall, incomingCallerInfo, incomingCallType, acceptIncomingCall, rejectIncomingCall,
  } = usePeer();

  usePresence();
  const [isAdmin, setIsAdmin] = useState(false);

  // 🆕 مراقبة الاتصال بالإنترنت
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!user?.uid) { setIsAdmin(false); return; }
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => setIsAdmin(snap.exists() ? snap.data().isAdmin === true : false));
    return () => unsub();
  }, [user?.uid]);

  const processQueue = useCallback((queue) => {
    if (queue.length === 0) { if (!isAppInstalled) setShowInstallGuide(true); return; }
    const current = queue[0];
    setShowWelcomeModal(current === 'welcome');
    setShowUsernameModal(current === 'username');
    setShowInstallGuide(false);
  }, [isAppInstalled]);

  useEffect(() => {
    if (!profileLoaded) return;
    const newQueue = [];
    if (showWelcomeModal && !sessionStorage.getItem('vibecall_has_seen_welcome')) newQueue.push('welcome');
    if (showUsernameModal) newQueue.push('username');
    setModalQueue(newQueue);
  }, [profileLoaded, showWelcomeModal, showUsernameModal]);

  useEffect(() => { processQueue(modalQueue); }, [modalQueue, processQueue]);

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false); sessionStorage.setItem('vibecall_has_seen_welcome', 'true');
    setModalQueue(prev => prev.filter(item => item !== 'welcome'));
  };
  const handleUsernameClose = () => {
    setShowUsernameModal(false);
    setModalQueue(prev => prev.filter(item => item !== 'username'));
  };

  useEffect(() => {
    const checkInstalled = () => setIsAppInstalled(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone);
    checkInstalled();
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => { setIsAppInstalled(true); setDeferredPrompt(null); setShowInstallGuide(false); });
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  useEffect(() => {
    if (!showInstallGuide && !isAppInstalled && modalQueue.length === 0) {
      const timer = setTimeout(() => setShowInstallGuide(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [showInstallGuide, isAppInstalled, modalQueue]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (!fbUser) {
          setUser(null); setMyUsername(''); setProfileLoaded(false); setUsernameResolved(false); setShowUsernameModal(false); setLoading(false); setShowSplash(false); return;
        }
        setUser({ uid: fbUser.uid, email: fbUser.email, displayName: fbUser.displayName || '', photoURL: fbUser.photoURL || '', emailVerified: fbUser.emailVerified });
        setShowSplash(false); setLoading(true);
        const userRef = doc(db, 'users', fbUser.uid); const snap = await getDoc(userRef);
        if (!snap.exists()) {
          setMyUsername(''); setShowUsernameModal(true); setProfileLoaded(true); setUsernameResolved(true); setLoading(false); return;
        }
        const data = snap.data();
        if (data.status === 'banned') { setBanType('banned'); setBannedModalOpen(true); setProfileLoaded(true); setUsernameResolved(true); setLoading(false); return; }
        if (data.username && data.username.trim() !== '') { setMyUsername(data.username); localStorage.setItem('my_username', data.username); setShowUsernameModal(false); }
        else { setMyUsername(''); setShowUsernameModal(true); }
        const today = new Date().toISOString().split('T')[0]; const loginDates = data.loginDates || [];
        if (!loginDates.includes(today)) loginDates.push(today);
        await setDoc(userRef, { status: 'online', lastSeen: serverTimestamp(), loginDates: loginDates.slice(-30), loginCount: (data.loginCount || 0) + 1 }, { merge: true });
        setProfileLoaded(true); setUsernameResolved(true); setLoading(false);
        if (!sessionStorage.getItem('vibecall_has_seen_welcome')) { setShowWelcomeModal(true); sessionStorage.setItem('vibecall_has_seen_welcome', 'true'); }
      } catch (err) { console.error('Auth error:', err); setProfileLoaded(true); setUsernameResolved(true); setLoading(false); }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user?.uid || !profileLoaded || !myUsername) return;
    const userRef = doc(db, 'users', user.uid);
    const updateStatus = async (status) => { try { await setDoc(userRef, { status, lastSeen: serverTimestamp() }, { merge: true }); } catch (e) {} };
    updateStatus('online');
    const heartbeat = setInterval(() => updateStatus('online'), 30000);
    const handleVisibility = () => updateStatus(document.hidden ? 'offline' : 'online');
    const handlePageHide = () => updateStatus('offline');
    document.addEventListener('visibilitychange', handleVisibility); window.addEventListener('pagehide', handlePageHide);
    return () => { clearInterval(heartbeat); updateStatus('offline'); document.removeEventListener('visibilitychange', handleVisibility); window.removeEventListener('pagehide', handlePageHide); };
  }, [user?.uid, profileLoaded, myUsername]);

  const handleLogout = async () => {
    if (user?.uid) { try { await setDoc(doc(db, 'users', user.uid), { status: 'offline', lastSeen: serverTimestamp() }, { merge: true }); } catch (e) {} }
    sessionStorage.removeItem('vibecall_has_seen_welcome'); setUser(null); setProfileLoaded(false); setUsernameResolved(false); await signOut(auth);
  };

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (!profileLoaded) return;
      if (!snap.exists()) { setPendingBan(false); localStorage.removeItem('my_username'); setMyUsername(''); handleLogout(); return; }
      const data = snap.data();
      if (data.status === 'banned') { setBanType('banned'); setBannedModalOpen(true); return; }
      else { if (bannedModalOpen && banType === 'banned') setBannedModalOpen(false); if (pendingBan) setPendingBan(false); }
      if (!data.username || data.username.trim() === '') { if (myUsername !== '') { setMyUsername(''); localStorage.removeItem('my_username'); setShowUsernameModal(true); setUsernameResolved(false); } }
      else { if (data.username !== myUsername) { setMyUsername(data.username); localStorage.setItem('my_username', data.username); setShowUsernameModal(false); setUsernameResolved(true); } }
    });
    return () => unsub();
  }, [user?.uid, profileLoaded, pendingBan, bannedModalOpen, banType, myUsername]);

  const handleFirstClick = useCallback(() => {
    if (pendingBan && !banTriggered.current && !bannedModalOpen) { banTriggered.current = true; setBannedModalOpen(true); setPendingBan(false); }
  }, [pendingBan, bannedModalOpen]);
  useEffect(() => { document.addEventListener('click', handleFirstClick); return () => document.removeEventListener('click', handleFirstClick); }, [handleFirstClick]);

  const handleBannedModalClose = async () => {
    setBannedModalOpen(false); setPendingBan(false); banTriggered.current = false; localStorage.removeItem('my_username'); sessionStorage.clear(); setUser(null); await signOut(auth);
  };

  const handleUsernameConfirm = async (u) => {
    if (!user?.uid || !u.trim()) return;
    const username = u.trim().toLowerCase();
    try {
      const userRef = doc(db, 'users', user.uid); await setDoc(userRef, { username }, { merge: true });
      const usernameRef = doc(db, 'usernames', username); await setDoc(usernameRef, { uid: user.uid, createdAt: serverTimestamp() }, { merge: true });
      setMyUsername(username); localStorage.setItem('my_username', username); setUsernameResolved(true); handleUsernameClose();
    } catch (err) { console.error('Failed to save username:', err); alert('حدث خطأ في حفظ المعرف. حاول مرة أخرى.'); }
  };

  const handleSwitchAccount = async () => { localStorage.removeItem('my_username'); setMyUsername(''); setUsernameResolved(false); await handleLogout(); };
  const handleUpdateDisplayName = (d) => { setUser((p) => ({ ...p, displayName: d })); setShowNameModal(false); };
  const handleUpdateProfile = (u) => setUser((p) => ({ ...p, ...u }));

  const handleOpenCall = (contact, type = 'audio') => { setRemoteContact(contact); setCallType(type); setCallOpen(true); setIncomingCallActive(false); };
  const handleCloseCall = () => { setCallOpen(false); setRemoteContact(null); setIncomingCallActive(false); };
  const handleOpenChat = (contact) => { setCurrentChatContact(contact); navigateTo('chat'); };

  const handleAcceptIncoming = async () => {
    await acceptIncomingCall();
    if (incomingCallerInfo) {
      setRemoteContact({ uid: '', displayName: incomingCallerInfo.displayName, photoURL: incomingCallerInfo.photoURL, username: incomingCallerInfo.username });
      setCallType(incomingCallType); setCallOpen(true); setIncomingCallActive(true);
    }
  };

  const handleRejectIncoming = () => { rejectIncomingCall(); };

  const handleResetApp = async () => {
    if (!user?.uid) return;
    if (!window.confirm('سيتم حذف جميع بياناتك بشكل نهائي. هل أنت متأكد؟')) return;
    setLoading(true);
    try {
      const uid = user.uid; const userDoc = await getDoc(doc(db, 'users', uid)); const currentUsername = userDoc.exists() ? userDoc.data().username : localStorage.getItem('my_username');
      if (currentUsername) { await deleteDoc(doc(db, 'usernames', currentUsername.toLowerCase())).catch(() => {}); }
      const chatsQuery = query(collection(db, 'chats'), where('participants', 'array-contains', uid)); const chatsSnap = await getDocs(chatsQuery); const batch = writeBatch(db);
      chatsSnap.forEach((chatDoc) => batch.delete(doc(db, 'chats', chatDoc.id))); await batch.commit();
      await deleteDoc(doc(db, 'users', uid)).catch(() => {}); await deleteDoc(doc(db, 'peers', uid)).catch(() => {});
    } catch (err) { console.error(err); }
    finally { localStorage.clear(); sessionStorage.clear(); setMyUsername(''); setUsernameResolved(false); await signOut(auth); setUser(null); setLoading(false); }
  };

  const handleToggleMuteMic = () => { const v = !muteMicOnJoin; setMuteMicOnJoin(v); localStorage.setItem('muteMicOnJoin', v); };
  const handleToggleSpeaker = () => { const v = !speakerDefault; setSpeakerDefault(v); localStorage.setItem('speakerDefault', v); };

  const navigateTo = (screen) => { setNavHistory((prev) => [...prev, currentScreen]); setCurrentScreen(screen); };
  const handleBack = () => {
    if (navHistory.length > 0) { const prevScreen = navHistory[navHistory.length - 1]; setNavHistory((prev) => prev.slice(0, -1)); setCurrentScreen(prevScreen); }
    else { setCurrentScreen('mainMenu'); }
  };

  const handleWelcomeLearnMore = () => { handleWelcomeClose(); navigateTo('atheer'); };

  const handleSplashFinish = () => { setShowSplash(false); const hasSeen = localStorage.getItem('linkup_onboarding_seen'); if (!hasSeen) setShowOnboarding(true); };
  const handleFinishOnboarding = () => { localStorage.setItem('linkup_onboarding_seen', 'true'); setShowOnboarding(false); };

  useEffect(() => {
    const sizes = { small: '14px', medium: '16px', large: '18px', xlarge: '20px' }; document.documentElement.style.fontSize = sizes[fontSize] || '16px'; localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    const fonts = { tajawal: '"Tajawal", sans-serif', cairo: '"Cairo", sans-serif', rubik: '"Rubik", sans-serif', changa: '"Changa", sans-serif', 'ibm-plex': '"IBM Plex Sans Arabic", sans-serif' };
    const selectedFont = fonts[fontFamily] || '"Tajawal", sans-serif'; document.documentElement.style.fontFamily = selectedFont; document.body.style.fontFamily = selectedFont; localStorage.setItem('fontFamily', fontFamily);
  }, [fontFamily]);

  const handleOpenGroup = (group) => { setCurrentGroup(group); navigateTo('groupChat'); };
  const handleOpenGroupInfo = (group) => { setCurrentGroup(group); navigateTo('groupInfo'); };

  if (showOnboarding) return <OnboardingScreen onFinish={handleFinishOnboarding} />;
  if (bannedModalOpen) return <BannedModal open={bannedModalOpen} type={banType} onClose={handleBannedModalClose} />;
  if (showSplash) return <SplashScreen onFinish={handleSplashFinish} />;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <AuthScreen onLogin={() => {}} onForgotPassword={() => navigateTo('forgotpassword')} />;
  if (showVerifyEmail) return <VerifyEmailScreen onVerified={() => setShowVerifyEmail(false)} onRetry={() => {}} />;
  if (currentScreen === 'forgotpassword') return <ForgotPasswordScreen onBack={handleBack} />;
  if (currentScreen === 'resetpassword') return <ResetPasswordScreen onBack={handleBack} />;

  if (incomingCall && incomingCallerInfo && !incomingCallActive) {
    return <IncomingCallModal open={true} caller={incomingCallerInfo} callType={incomingCallType} onAccept={handleAcceptIncoming} onReject={handleRejectIncoming} />;
  }

  const headerTitle = {
    mainMenu: 'القائمة الرئيسية', profile: 'الملف الشخصي', settings: 'الإعدادات', contacts: 'جهات الاتصال',
    atheer: 'من هو أثير؟', about: 'من نحن', privacy: 'سياسة الخصوصية', terms: 'شروط الخدمة', data: 'إدارة البيانات',
    lock: 'قفل التطبيق', changeEmail: 'تغيير البريد', resetPasswordProfile: 'إعادة تعيين كلمة المرور', chat: 'المحادثة',
    admin: 'لوحة الإدارة', usermanagement: 'إدارة المستخدمين', notifications: 'الإشعارات', partner: 'تكوين شراكة',
    support: 'تواصل مع المطور', groups: 'المجموعات', createGroup: 'إنشاء مجموعة', groupChat: 'محادثة المجموعة', groupInfo: 'معلومات المجموعة',
  }[currentScreen] || 'LinkUp';

  // ✅ تعديل pagesWithOwnHeader ليشمل settings
  const pagesWithOwnHeader = ['atheer','about','privacy','support','createGroup','data','lock','changeEmail','resetPasswordProfile','forgotpassword','resetpassword','contacts','chat','groupChat','groupInfo','settings'];

  const renderContent = () => {
    if (currentScreen === 'mainMenu') return <MainMenuScreen onNavigate={navigateTo} username={myUsername} />;
    if (currentScreen === 'changeEmail') return <ChangeEmailScreen user={user} onBack={handleBack} onSuccess={setUser} />;
    if (currentScreen === 'resetPasswordProfile') return <ResetPasswordProfileScreen onBack={handleBack} onOpenForgotPassword={() => navigateTo('forgotpassword')} />;
    if (currentScreen === 'notifications') return <NotificationsScreen onBack={handleBack} />;
    if (currentScreen === 'support') return <SupportScreen onBack={handleBack} />;
    if (currentScreen === 'admin') return <AdminScreen onBack={handleBack} onOpenUserManagement={() => navigateTo('usermanagement')} />;
    if (currentScreen === 'usermanagement') return <UserManagementScreen onBack={handleBack} />;
    if (currentScreen === 'profile') return <ProfileScreen user={user} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} onChangeEmail={() => navigateTo('changeEmail')} onResetPassword={() => navigateTo('resetPasswordProfile')} onSwitchAccount={handleSwitchAccount} />;
    if (currentScreen === 'settings')
      return (
        <SettingsScreen
          onOpenAtheer={() => navigateTo('atheer')}
          onOpenAbout={() => navigateTo('about')}
          onOpenPrivacy={() => navigateTo('privacy')}
          onOpenTerms={() => navigateTo('terms')}
          onOpenDataManagement={() => navigateTo('data')}
          onOpenAppLock={() => navigateTo('lock')}
          onOpenProfile={() => navigateTo('profile')}
          onOpenSupport={() => navigateTo('support')}
          onOpenReport={() => navigateTo('support')}
          onResetApp={handleResetApp}
          muteMicOnJoin={muteMicOnJoin}
          speakerDefault={speakerDefault}
          onToggleMuteMic={handleToggleMuteMic}
          onToggleSpeaker={handleToggleSpeaker}
          fontSize={fontSize}
          fontFamily={fontFamily}
          onSelectFontSize={setFontSize}
          onSelectFontFamily={setFontFamily}
          isAdmin={isAdmin}
          onOpenAdmin={() => navigateTo('admin')}
          onOpenPartner={() => navigateTo('partner')}
        />
      );
    if (currentScreen === 'contacts') return <ContactsScreen onBack={handleBack} onChat={handleOpenChat} onCall={handleOpenCall} myUsername={myUsername} />;
    if (currentScreen === 'chat') return <ChatScreen contact={currentChatContact} onBack={handleBack} onCall={handleOpenCall} />;
    if (currentScreen === 'atheer') return <AtheerScreen onBack={handleBack} />;
    if (currentScreen === 'about') return <AboutScreen onBack={handleBack} />;
    if (currentScreen === 'privacy') return <PrivacyPolicyScreen onBack={handleBack} />;
    if (currentScreen === 'terms') return <TermsOfServiceScreen />;
    if (currentScreen === 'data') return <DataManagementScreen onBack={handleBack} />;
    if (currentScreen === 'lock') return <AppLockScreen onBack={handleBack} />;
    if (currentScreen === 'partner') return <PartnerScreen onBack={handleBack} />;
    if (currentScreen === 'createGroup') return <CreateGroupScreen onBack={handleBack} />;
    if (currentScreen === 'groups')
      return (
        <GroupsScreen
          onBack={handleBack}
          onOpenCreateGroup={() => navigateTo('createGroup')}
          onOpenGroup={handleOpenGroup}
        />
      );
    if (currentScreen === 'groupChat') return <GroupChatScreen group={currentGroup} onBack={handleBack} onOpenGroupInfo={handleOpenGroupInfo} />;
    if (currentScreen === 'groupInfo') return <GroupInfoScreen group={currentGroup} onBack={handleBack} onOpenChat={handleOpenChat} />;
    return <HomeScreen myId={myId} myUsername={myUsername} user={user} />;
  };

  const hideBottomNav = ['chat','notifications','support','usermanagement','admin','createGroup','groupChat','groupInfo','changeEmail','resetPasswordProfile','data','lock','partner','atheer','about','privacy','terms','forgotpassword','resetpassword'].includes(currentScreen);

  return (
    <>
      <DisplayNameModal open={showNameModal} suggestedName={user?.email?.split('@')[0] || ''} onConfirm={handleUpdateDisplayName} />
      <WelcomeModal open={showWelcomeModal} onClose={handleWelcomeClose} onLearnMore={handleWelcomeLearnMore} />
      <UsernameModal open={showUsernameModal} onConfirm={handleUsernameConfirm} userId={user?.uid} />
      <WarningModal open={warningModalOpen} message={warningMessage} onClose={() => setWarningModalOpen(false)} />

      {/* 🆕 شريط التنبيه بعدم وجود اتصال */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-yellow-400 text-black text-center py-2 text-sm font-bold shadow-md animate-pulse">
          ⚠️ لا يوجد اتصال بالإنترنت - بعض الميزات غير متاحة
        </div>
      )}

      {!isAppInstalled && showInstallGuide && modalQueue.length === 0 && (
        <InstallGuide onDismiss={() => setShowInstallGuide(false)} deferredPrompt={deferredPrompt} isInstalled={isAppInstalled} />
      )}

      <div className="min-h-screen flex flex-col bg-slate-50/50 text-gray-900">
        {/* ✅ إضافة استثناء settings صراحةً */}
        {!pagesWithOwnHeader.includes(currentScreen) && currentScreen !== 'mainMenu' && currentScreen !== 'chat' && currentScreen !== 'notifications' && currentScreen !== 'usermanagement' && currentScreen !== 'groups' && currentScreen !== 'groupChat' && currentScreen !== 'groupInfo' && currentScreen !== 'settings' && (
          <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/50 px-5 py-3 flex items-center shadow-sm" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100"><ArrowLeftIcon /></button>
            <h1 className="text-xl font-bold flex-1 text-right">{headerTitle}</h1>
            {!isAdmin && currentScreen !== 'notifications' && <button onClick={() => navigateTo('notifications')} className="p-2 rounded-full hover:bg-gray-100 relative"><BellIcon /></button>}
            {isAdmin && currentScreen !== 'admin' && <button onClick={() => navigateTo('admin')} className="p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 ml-2"><ShieldIcon /></button>}
          </header>
        )}
        <main className="flex-1 relative">{renderContent()}</main>
        {!hideBottomNav && (
          <BottomNav currentScreen={currentScreen} onNavigate={navigateTo} isAdmin={isAdmin} onOpenAdmin={() => navigateTo('admin')} onOpenUserManagement={() => navigateTo('usermanagement')} />
        )}
      </div>

      {callOpen && remoteContact && (
        <CallScreen
          open={callOpen} onClose={handleCloseCall} contact={remoteContact} muteMicOnJoin={muteMicOnJoin} callType={callType}
          callStatus={callStatus} localStream={localStream} remoteStream={remoteStream} remoteUserData={remoteUserData}
          startCall={startCall} stopCall={stopCall} switchCamera={switchCamera} toggleVideo={toggleVideo}
          isVideoEnabled={isVideoEnabled} getRemotePeerId={getRemotePeerId}
        />
      )}
      <Toaster richColors position="top-center" />
    </>
  );
}

export default App;