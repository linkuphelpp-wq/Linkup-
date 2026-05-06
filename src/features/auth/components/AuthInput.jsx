import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, UserIcon } from '../icons';

export default function AuthInput({ type, placeholder, value, onChange, iconType, isPassword, showPassword, onTogglePassword }) {
  const Icon = iconType === 'mail' ? MailIcon : iconType === 'lock' ? LockIcon : iconType === 'user' ? UserIcon : null;
  
  return (
    <div className="relative group">
      {Icon && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300">
          <Icon />
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full ${Icon ? 'pr-12' : 'pr-4'} pl-4 h-14 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-gray-200/80 dark:border-gray-700/80 text-base shadow-inner transition-all duration-300 outline-none
        focus:border-transparent focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:bg-white/80 dark:focus:bg-gray-800/80`}
      />
      {isPassword && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      )}
    </div>
  );
}