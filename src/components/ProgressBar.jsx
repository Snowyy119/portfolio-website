import { useState, useEffect } from 'react';
import { useScroll, useSpring } from '../lib/motion-fix';

export default function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    return scrollYProgress.on('change', (v) => {
      const pct = Math.round(v * 100);
      // Only update if changed (avoids re-render on every scroll tick)
      setPercentage((prev) => (prev === pct ? prev : pct));
    });
  }, [scrollYProgress]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Bar */}
      <div
        className="h-px bg-white/80 origin-left"
        style={{ scaleX }}
      />
      {/* Percentage */}
      <div className="absolute top-1 right-4 text-[10px] font-light tracking-wider text-white/30">
        {percentage}%
      </div>
    </div>
  );
}