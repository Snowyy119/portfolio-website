import { motion } from '../lib/motion-fix';

const skills = [
  'Unreal Engine',
  'Blender',
  '3D Modeling',
  'Texturing',
  '3D Rendering',
  'CGI & Compositing',
  'Graphic Design',
  'Photoshop',
  'DaVinci Resolve',
];

export default function AboutPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <div className="pt-24 pb-16 px-6 md:px-16 max-w-4xl mx-auto">
        {/* Page Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-4xl md:text-6xl font-extralight text-white tracking-tight mb-16"
        >
          Who Am I ?
        </motion.h1>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-16"
        >
           <p className="text-lg md:text-xl font-light text-white/90 leading-relaxed mb-6">
            I'm Minephuc — a self-taught 3D artist focused on rendering, CGI, and visual storytelling.
           </p>
           <p className="text-base md:text-lg font-normal text-white/60 leading-relaxed">
            I create ambitious cinematic and game-ready work, from modeling and texturing to compositing real and virtual worlds.
           </p>
        </motion.div>

        {/* Philosophy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mb-16 p-8 border border-white/10 rounded-xl"
        >
          <h2 className="text-sm tracking-widest text-white/40 mb-4">PHILOSOPHY</h2>
          <p className="text-base font-light text-white/80 leading-relaxed">
            I blend 3D rendering, CGI, and compositing to craft expressive, cinematic visuals.
            I'm drawn to ambitious work — animated series, games, and cinematic CGI that push visual boundaries.
          </p>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mb-16"
        >
          <h2 className="text-sm tracking-widest text-white/40 mb-6">TOOLKIT</h2>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill, i) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.05, duration: 0.3 }}
                className="px-4 py-2 border border-white/15 rounded-full text-xs tracking-wider text-white/70"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col items-start gap-4"
        >
          <h2 className="text-sm tracking-widest text-white/40">CONNECT</h2>
          <div className="flex flex-col gap-3">
            <a
              href="https://x.com/MinephucI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              X / Twitter →
            </a>
            <a
              href="https://www.instagram.com/mine.phuci"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Instagram →
            </a>
            <a
              href="https://www.twitch.tv/minephuc123"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Twitch →
            </a>
          </div>
        </motion.div>
      </div>
    </main>
  );
}