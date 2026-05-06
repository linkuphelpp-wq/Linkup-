import { useState } from 'react';

// أيقونات SVG (نفس المستخدمة سابقاً)
const UsersIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const UsersRoundIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/></svg>);
const SettingsIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>);

const NavItem = ({ icon: Icon, label, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative flex flex-col items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip احترافي */}
      <span
        className={`absolute -top-12 transition-all duration-200 bg-black/80 dark:bg-white/90 backdrop-blur-md text-white dark:text-black text-[11px] px-3 py-1.5 rounded-full font-bold shadow-xl border border-white/10 whitespace-nowrap ${
          isHovered ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      >
        {label}
      </span>

      {/* زر الأيقونة بتأثير التمدد */}
      <div
        onClick={onClick}
        className="
          w-12 h-12 md:w-14 md:h-14
          flex items-center justify-center
          bg-white/10 dark:bg-white/5 
          backdrop-blur-lg
          rounded-full 
          border border-white/20 dark:border-white/10
          text-gray-700 dark:text-gray-200
          transition-all duration-300 ease-out
          hover:w-16 hover:h-16 hover:-translate-y-3 
          hover:bg-white dark:hover:bg-white 
          hover:text-black dark:hover:text-black
          hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)]
          cursor-pointer
          active:scale-90
        "
      >
        <Icon />
      </div>
    </div>
  );
};

export default function BottomNav({ onContacts, onGroups, onSettings }) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div
        className="
          flex items-end gap-3 px-5 py-4 
          bg-black/10 dark:bg-white/5 
          backdrop-blur-2xl 
          rounded-[3rem] 
          border border-white/20 dark:border-white/10 
          shadow-[0_20px_50px_rgba(0,0,0,0.3)]
        "
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <NavItem icon={UsersIcon} label="جهات الاتصال" onClick={onContacts} />
        <NavItem icon={UsersRoundIcon} label="المجموعات" onClick={onGroups} />
        <NavItem icon={SettingsIcon} label="الإعدادات" onClick={onSettings} />
      </div>
    </div>
  );
}