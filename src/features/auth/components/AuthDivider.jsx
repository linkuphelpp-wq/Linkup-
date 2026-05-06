export default function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200/50 dark:border-gray-700/50"></div>
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm px-3 text-sm text-gray-500 dark:text-gray-400 font-medium">أو</span>
      </div>
    </div>
  );
}