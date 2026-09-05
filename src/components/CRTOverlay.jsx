import { useEffect, useRef } from 'react';

const TRAIL_MAX = 40;

export default function CRTOverlay() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener('resize', resize);

    // Trail buffer: array of {x, y, life}
    const trail = [];
    let mouseX = -999;
    let mouseY = -999;
    let mouseActive = false;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;

      // Push to trail
      trail.push({ x: mouseX, y: mouseY, life: 1.0 });
      if (trail.length > TRAIL_MAX) trail.shift();
    };

    const onMouseLeave = () => {
      mouseActive = false;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave);

    let animId;

    const draw = () => {
      animId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, w, h);
      if (!mouseActive) return;

      // ─── CURSOR GLOW (radial gradient) ───
      const glowRadius = 120;
      const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, glowRadius);
      grad.addColorStop(0, 'rgba(140, 220, 255, 0.12)');
      grad.addColorStop(0.3, 'rgba(100, 190, 255, 0.06)');
      grad.addColorStop(0.7, 'rgba(80, 160, 255, 0.02)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(mouseX - glowRadius, mouseY - glowRadius, glowRadius * 2, glowRadius * 2);

      // ─── CURSOR TRAIL ───
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.life *= 0.94;
        if (p.life < 0.01) continue;

        const r = 8 + p.life * 20;
        const alpha = p.life * 0.08;
        const tGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        tGrad.addColorStop(0, `rgba(140, 220, 255, ${alpha})`);
        tGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = tGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Remove dead trail points
      while (trail.length > 0 && trail[0].life < 0.01) {
        trail.shift();
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9998] pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
      aria-hidden="true"
    />
  );
}