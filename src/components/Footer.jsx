import { motion } from '../lib/motion-fix';

export default function Footer() {
  return (
    <footer className="relative z-10 py-16 px-6 border-t border-white/10">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left: Brand + Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-xs text-white/30 tracking-wider"
        >
          <p className="text-white/50 font-light mb-1">MINEPHUC</p>
          <p>© 2026 Minephuc. All rights reserved.</p>
        </motion.div>

        {/* Right: Social Links */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-6"
        >
          <a
            href="https://www.instagram.com/mine.phuci"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-widest text-white/40 hover:text-white transition-colors"
          >
            INSTAGRAM
          </a>
          <a
            href="https://x.com/MinephucI"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-widest text-white/40 hover:text-white transition-colors"
          >
            X / TWITTER
          </a>
          <a
            href="https://www.twitch.tv/minephuc123"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-widest text-white/40 hover:text-white transition-colors"
          >
            TWITCH
          </a>
        </motion.div>
      </div>
    </footer>
  );
}