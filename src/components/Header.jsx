import { useState, useEffect, useRef } from 'react';
import { motion } from '../lib/motion-fix';
import { Link } from 'react-router-dom';

// Shared audio-reactivity state, read by WebGLBackground each frame.
// Kept on `window` so it stays confined to Header.jsx + WebGLBackground.jsx
// (no new module, no global event architecture, no new dependencies).
const audioReactiveState =
  window.__audioReactivity ||
  (window.__audioReactivity = { active: false, bass: 0, mids: 0, highs: 0, level: 0 });

export default function Header({ menuOpen, onMenuToggle }) {
  const [soundOn, setSoundOn] = useState(false);
  const [bars, setBars] = useState([0, 0, 0, 0]);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const analyserRef = useRef(null);
  const frequencyDataRef = useRef(null);
  const analyserRafRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (analyserRafRef.current) cancelAnimationFrame(analyserRafRef.current);
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch {}
      }
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch {}
      }
      audioReactiveState.active = false;
    };
  }, []);

  const startBarsAnimation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setBars([
        Math.random() * 8 + 2,
        Math.random() * 8 + 2,
        Math.random() * 8 + 2,
        Math.random() * 8 + 2,
      ]);
    }, 150);
  };

  const stopBarsAnimation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setBars([0, 0, 0, 0]);
  };

  // ─── Audio reactivity (Web Audio analyser) ───
  const stopAnalysisLoop = () => {
    if (analyserRafRef.current) {
      cancelAnimationFrame(analyserRafRef.current);
      analyserRafRef.current = null;
    }
  };

  const startAnalysisLoop = () => {
    stopAnalysisLoop();
    const loop = () => {
      try {
        const analyser = analyserRef.current;
        const data = frequencyDataRef.current;
        if (analyser && data && audioReactiveState.active) {
          analyser.getByteFrequencyData(data);
          const binCount = data.length;
          const bassEnd = Math.max(1, Math.floor(binCount * 0.12));
          const midEnd = Math.floor(binCount * 0.5);

          let bass = 0;
          for (let i = 0; i < bassEnd; i++) bass += data[i];
          bass /= bassEnd * 255;

          let mids = 0;
          for (let i = bassEnd; i < midEnd; i++) mids += data[i];
          mids /= (midEnd - bassEnd) * 255;

          let highs = 0;
          for (let i = midEnd; i < binCount; i++) highs += data[i];
          highs /= (binCount - midEnd) * 255;

          const level = (bass + mids + highs) / 3;
          const k = 0.18;
          audioReactiveState.bass += (bass - audioReactiveState.bass) * k;
          audioReactiveState.mids += (mids - audioReactiveState.mids) * k;
          audioReactiveState.highs += (highs - audioReactiveState.highs) * k;
          audioReactiveState.level += (level - audioReactiveState.level) * k;
        }
      } catch {
        // Best-effort only — never let analysis break playback.
      }
      analyserRafRef.current = requestAnimationFrame(loop);
    };
    analyserRafRef.current = requestAnimationFrame(loop);
  };

  const ensureAudioGraph = () => {
    if (mediaSourceRef.current) return true; // already connected — reuse
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return false;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      const ctx = audioCtxRef.current;
      if (!analyserRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;
      }
      // MediaElementSourceNode can only be created once per element.
      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyserRef.current);
      analyserRef.current.connect(ctx.destination); // keep audio audible
      mediaSourceRef.current = source;
      return true;
    } catch {
      return false;
    }
  };

  const toggleSound = () => {
    if (!audioRef.current) {
      // Create the looping background track on first user interaction.
      const el = new Audio('/audio/artmylife-winter-lo-fi-458274.mp3');
      el.loop = true;
      el.volume = 0.5;
      audioRef.current = el;
    }

    if (soundOn) {
      // Pause (fully reversible).
      audioRef.current.pause();
      setSoundOn(false);
      stopBarsAnimation();
      stopAnalysisLoop();
      audioReactiveState.active = false;
    } else {
      // Play / resume.
      const p = audioRef.current.play();
      if (p !== undefined) {
        p.catch((err) => {
          console.error('[Header] Audio play() rejected:', err);
          // Media may not be loaded yet — retry once it is
          audioRef.current.addEventListener('canplay', () => {
            audioRef.current.play().catch(() => {});
          }, { once: true });
        });
      }
      setSoundOn(true);
      startBarsAnimation();

      // Best-effort audio reactivity (analysis only — never blocks playback).
      try {
        if (ensureAudioGraph()) {
          const ctx = audioCtxRef.current;
          if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
          if (analyserRef.current && !frequencyDataRef.current) {
            frequencyDataRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
          }
          if (analyserRef.current && frequencyDataRef.current) {
            audioReactiveState.active = true;
            startAnalysisLoop();
          }
        }
      } catch {
        // Web Audio unavailable → music still plays, reactivity simply disabled.
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center p-6 md:p-8">
      {/* Left: Logo */}
      <div className="flex-1 flex items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            to="/"
            className="text-xs font-light tracking-widest text-white hover:opacity-70 transition-opacity inline-block"
            aria-label="Minephuc"
          >
            M
          </Link>
        </motion.div>
      </div>

      {/* Center: Nav Links */}
      <nav className="flex items-center gap-6 md:gap-8 flex-none">
        <Link
          to="/about"
          className="hidden md:block text-[10px] tracking-widest text-white/70 hover:text-white transition-colors font-light"
        >
          ABOUT
        </Link>
        <Link
          to="/lab"
          className="hidden md:block text-[10px] tracking-widest text-white/70 hover:text-white transition-colors font-light"
        >
          LAB
        </Link>
      </nav>

      {/* Right: Sound + Menu */}
      <div className="flex-1 flex items-center justify-end gap-4">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={toggleSound}
          className="group relative flex items-center gap-2 w-10 h-10 rounded-full border border-white/20 hover:border-white/50 transition-colors justify-center"
          aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
        >
          <div className="flex items-end gap-0.5 h-3">
            {bars.map((h, i) => (
              <div
                key={i}
                className="w-0.5 bg-white/60 rounded-full transition-all duration-150"
                style={{ height: soundOn ? `${h}px` : '2px' }}
              />
            ))}
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={onMenuToggle}
          className="flex flex-col items-end gap-0.5"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <motion.span
            animate={{ opacity: menuOpen ? 0 : 1 }}
            className="text-[10px] tracking-widest text-white font-light"
          >
            MENU
          </motion.span>
          <motion.span
            animate={{ opacity: menuOpen ? 1 : 0 }}
            className="text-[10px] tracking-widest text-white/60 font-light"
          >
            CLOSE
          </motion.span>
        </motion.button>
      </div>
    </header>
  );
}
