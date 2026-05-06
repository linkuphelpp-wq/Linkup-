export default function AuthCard({ children }) {
  return (
    <div className="relative w-full max-w-md rounded-3xl p-[2px] bg-gradient-to-br from-blue-500/50 via-purple-500/50 to-pink-500/50 animate-gradient">
      <div className="h-full w-full backdrop-blur-2xl bg-white/70 dark:bg-gray-950/70 rounded-3xl p-8 shadow-2xl shadow-blue-500/20">
        {children}
      </div>
    </div>
  );
}