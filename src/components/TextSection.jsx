import { motion, useInView } from '../lib/motion-fix';
import { useState, useRef, useEffect } from 'react';

const textContent = '-I blend 3D rendering, and compositing to bring ideas to life.   From modeling and texturing to cinematic, real-world                 integration, every frame is crafted with intent.';

function AnimatedLetter({ char, index, isInView }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20, rotateX: 90 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{
        delay: index * 0.012,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={{ display: 'inline-block' }}
    >
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  );
}

export default function TextSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-32 px-6" id="about">
      <div
        ref={ref}
        className="max-w-4xl mx-auto text-center"
        style={{ perspective: '800px' }}
      >
        <motion.p
          className="text-xl md:text-2xl lg:text-3xl font-light text-white/90 leading-relaxed"
          aria-label={textContent}
        >
          <span className="sr-only">{textContent}</span>
          <span aria-hidden="true" className="inline">
            {textContent.split('').map((char, i) => (
              <AnimatedLetter key={i} char={char} index={i} isInView={isInView} />
            ))}
          </span>
        </motion.p>
      </div>
    </section>
  );
}

export function ContactButton() {
  const [copied, setCopied] = useState(false);
  const email = 'snowyy80@gmail.com';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = email;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="py-20 px-6 flex flex-col items-center gap-4">
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCopy}
        className="relative px-12 py-4 border border-white/30 rounded-full text-sm tracking-widest text-white hover:bg-white hover:text-black transition-all duration-300"
      >
        {copied ? 'EMAIL COPIED! ✓' : 'CONTACT ME ✉️'}
      </motion.button>
      {copied && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-white/40 tracking-wider"
        >
          Email copied!
        </motion.span>
      )}
    </section>
  );
}