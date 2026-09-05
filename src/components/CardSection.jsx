import { motion } from '../lib/motion-fix';
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const cards = [
  {
    title: 'Visual Experiments',
    description: 'Real-time scenes where light, motion, and material collide — digital experiments built frame by frame.',
    image: '/1337H4Xrender.png',
    link: '/lab',
    linkText: 'EXPLORE LAB',
  },
  {
    title: 'Environments & Worlds',
    description: 'Cinematic environments and composed scenes — digital worlds shaped by form, light, and depth.',
    image: '/pg_kuwahara.webp',
    link: '/lab',
    linkText: 'SEE WORK',
  },
];

function TiltCard({ card }) {
  const ref = useRef(null);
  const rafRef = useRef(null);
  const navigate = useNavigate();

  const handleMouseMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Throttle with rAF
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (el) {
        el.style.transform = `perspective(1000px) rotateX(${y * -12}deg) rotateY(${x * 12}deg)`;
      }
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const el = ref.current;
    if (el) {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(card.link);
    }
  }, [card.link, navigate]);

  return (
    <motion.div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`${card.title} — ${card.linkText}`}
      onClick={() => navigate(card.link)}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="block p-8 border border-white/10 rounded-lg overflow-hidden group transition-colors duration-500 hover:border-white/30 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.15s ease-out',
      }}
    >
      {/* Image */}
      <div className="mb-6 rounded-md overflow-hidden aspect-[4/3]">
        <img
          src={card.image}
          alt={card.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          style={{ transform: 'translateZ(30px)' }}
        />
      </div>

      <h3 className="text-lg font-medium mb-3 text-white group-hover:text-white transition-colors">
        {card.title}
      </h3>
      <p className="text-sm font-normal text-white/70 leading-relaxed mb-6">
        {card.description}
      </p>
      <div className="flex items-center gap-2 text-xs tracking-widest text-white/80 group-hover:text-white transition-colors">
        <span>{card.linkText}</span>
        <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </motion.div>
  );
}

export default function CardSection() {
  return (
    <section className="py-20 px-6 w-full">
      <div className="max-w-5xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-16 w-full">
          <h2 className="text-2xl md:text-3xl font-normal text-white tracking-wide mb-3">
            Where Ideas Take Shape
          </h2>
          <p className="text-sm font-normal text-white/70">
            Experiments, creations, and the vision behind them.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <TiltCard key={card.title} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}