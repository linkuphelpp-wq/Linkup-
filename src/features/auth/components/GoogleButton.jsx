import { ChromeIcon } from '../icons';

export default function GoogleButton({ onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full h-14 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/80 dark:border-gray-700/80 shadow-md hover:shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-3 font-medium text-gray-700 dark:text-gray-200 active:scale-[0.98] group"
    >
      <ChromeIcon />
      <span>المتابعة باستخدام Google</span>
    </button>
  );
}