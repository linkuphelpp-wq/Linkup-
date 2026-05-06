export default function AtheerContentWrapper({ title, subtitle, children }) {
  return (
    <div className="min-h-screen py-24 px-6 relative overflow-hidden bg-white text-gray-900">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none blur-[120px] bg-blue-200/40" />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] text-gray-900">{title}</h1>
          <p className="font-bold tracking-widest uppercase text-xs md:text-sm text-blue-600">{subtitle}</p>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-transparent mx-auto mt-6 rounded-full" />
        </div>
        <div className="grid gap-8">{children}</div>
      </div>
    </div>
  );
}

export const InfoCard = ({ leading, text }) => (
  <div className="p-8 rounded-[2.5rem] border backdrop-blur-xl transition-all duration-500 group bg-gray-100/80 border-gray-200 hover:border-blue-400/50">
    <h2 className="text-xl font-bold mb-3 group-hover:translate-x-2 transition-transform text-blue-600">{leading}</h2>
    <p className="leading-relaxed text-lg text-gray-600">{text}</p>
  </div>
);