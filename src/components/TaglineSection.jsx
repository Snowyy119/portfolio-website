import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from '../lib/motion-fix';

const taglines = [
  'Model. Render. Compose.',
  'From concept to frame.',
  'Ideas, in three dimensions.',
];

const philosophies = [
  'It starts with a vision.',
  'Light gives life to form.',
  'Every render tells a story.',
];

export default function TaglineSection() {
  const [index, setIndex] = useState(0);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % taglines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section ref={sectionRef} className="py-32 px-6 flex flex-col items-center justify-center gap-16">
      {/* Rotating Taglines */}
      <div className="relative h-24 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.h2
            key={index}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-3xl md:text-5xl font-extralight text-white text-center"
          >
            {taglines[index]}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* Philosophy Text */}
      <div className="relative h-32 flex flex-col items-center justify-center gap-4">
        {philosophies.map((text, i) => (
          <motion.p
            key={text}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.2, duration: 0.8 }}
            className="text-sm md:text-base font-normal text-white/70 text-center"
          >
            {text}
          </motion.p>
        ))}
      </div>
    </section>
  );
}