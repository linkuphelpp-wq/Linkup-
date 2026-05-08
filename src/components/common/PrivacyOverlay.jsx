import { motion } from 'framer-motion';

export default function PrivacyOverlay() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] bg-white"
    />
  );
}