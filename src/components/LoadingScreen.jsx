import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '../lib/motion-fix';

const letters = ['L', 'O', 'A', 'D', 'I', 'N', 'G'];

export default function LoadingScreen({ onLoadingComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onLoadingComplete, 800);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
          <div className="flex gap-2 text-4xl md:text-6xl font-light tracking-widest">
            {letters.map((letter, i) => (
              <motion.span
                key={letter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.15,
                  duration: 0.5,
                  ease: 'easeOut',
                }}
                exit={{ opacity: 0, y: -20, transition: { delay: i * 0.05, duration: 0.3 } }}
                className="text-white"
              >
                {letter}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}