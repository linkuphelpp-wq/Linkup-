import { motion } from 'framer-motion';
import './Logo.css';

export default function Logo({ withText = true, size = 'md' }) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 38, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-3xl' },
  };
  const currentSize = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-2xl opacity-60" />
        <motion.div
          whileHover={{ scale: 1.05 }}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-white/30 shadow-xl"
        >
          <svg width={currentSize.icon} height={currentSize.icon} viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <path d="M22 24C23.5 22.5 24 20 24 16C24 12 23.5 9.5 22 8" stroke="url(#iconGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 24C8.5 22.5 8 20 8 16C8 12 8.5 9.5 10 8" stroke="url(#iconGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 24H18C19.1046 24 20 23.1046 20 22V10C20 8.89543 19.1046 8 18 8H14C12.8954 8 12 8.89543 12 10V22C12 23.1046 12.8954 24 14 24Z" fill="url(#iconGrad)" fillOpacity="0.15" stroke="url(#iconGrad)" strokeWidth="2" strokeLinejoin="round" />
            <rect x="13" y="12" width="6" height="4" rx="1" fill="url(#iconGrad)" fillOpacity="0.3" />
            <path d="M26 14C27 15.5 27 16.5 26 18" stroke="url(#iconGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <path d="M6 14C5 15.5 5 16.5 6 18" stroke="url(#iconGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          </svg>
        </motion.div>
      </div>

      {withText && (
        <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <span className={`${currentSize.text} font-extrabold tracking-tight relative`}>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Vibe
            </span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent shimmer">
              Call
            </span>
          </span>
        </motion.div>
      )}
    </div>
  );
}