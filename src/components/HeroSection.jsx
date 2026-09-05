import { useEffect, useState } from 'react';
import { motion } from '../lib/motion-fix';

const titleWords = ['M i n e p h u c'];
const subtitle = '3D artist crafting renders, CGI, and visual worlds — from modeling to cinematic compositing.';

const letterAnimation = {
  hidden: { opacity: 0, y: 40, rotateX: 90 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      delay: 1 + i * 0.03,
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export default function HeroSection() {
  let letterIndex = 0;
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20"
      style={{ perspective: reducedMotion ? undefined : '1000px' }}
      id="main-content"
    >
      {/* Title */}
      <h1 className="text-center leading-tight mb-8" aria-label="Minephuc">
        <div className="flex flex-col items-center gap-2" aria-hidden="true">
          {titleWords.map((word, wordIdx) => (
            <div key={wordIdx} className="flex flex-wrap justify-center">
              {word.split('').map((letter) => (
                <motion.span
                  key={`${wordIdx}-${letter}-${letterIndex}`}
                  custom={letterIndex++}
                  variants={letterAnimation}
                  initial={reducedMotion ? 'visible' : 'hidden'}
                  animate="visible"
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight tracking-[0.2em] text-white"
                  style={{ display: 'inline-block' }}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              ))}
            </div>
          ))}
        </div>
      </h1>

      {/* Subtitle */}
      <motion.p
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="text-center text-sm md:text-base font-normal text-white/70 max-w-md mx-auto mb-12"
      >
        {subtitle}
      </motion.p>

      {/* Scroll Indicator */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-12 flex flex-col items-center gap-3"
      >
        <motion.div
          animate={reducedMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent"
        />
        <span className="text-[10px] tracking-[0.3em] text-white/60 font-normal">
          scroll to explore
        </span>
      </motion.div>
    </section>
  );
}