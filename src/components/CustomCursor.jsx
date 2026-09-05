import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Only show on devices with fine pointer
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) {
      dot.style.display = 'none';
      ring.style.display = 'none';
      return;
    }

    let dotX = -100, dotY = -100;
    let ringX = -100, ringY = -100;
    let visible = false;

    const onMouseMove = (e) => {
      dotX = e.clientX;
      dotY = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
    };

    const onMouseLeave = () => {
      visible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };

    const onHover = (e) => {
      const target = e.target.closest('a, button, [role="button"], .filter-btn, .gallery-item');
      ring.classList.toggle('hover', !!target);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mouseover', onHover, { passive: true });

    let animId;
    let running = true;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!running) return;

      // Dot follows immediately
      dot.style.transform = `translate(${dotX - 3}px, ${dotY - 3}px)`;

      // Ring follows with delay
      ringX += (dotX - ringX) * 0.15;
      ringY += (dotY - ringY) * 0.15;
      const size = ring.classList.contains('hover') ? 20 : 14;
      ring.style.transform = `translate(${ringX - size}px, ${ringY - size}px)`;
    };
    animate();

    // Pause when tab hidden
    const onVisibilityChange = () => {
      running = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mouseover', onHover);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot" style={{ opacity: 0 }} aria-hidden="true" />
      <div ref={ringRef} className="custom-cursor-ring" style={{ opacity: 0 }} aria-hidden="true" />
    </>
  );
}