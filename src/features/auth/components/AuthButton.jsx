export default function AuthButton({ children, loading, ...props }) {
  return (
    <button
      {...props}
      disabled={loading}
      className="relative w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group"
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            جاري المعالجة...
          </>
        ) : children}
      </span>
    </button>
  );
}