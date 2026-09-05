
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from '../lib/motion-fix';
import { createPortal } from 'react-dom';

const BASE = import.meta.env.BASE_URL;

const projects = [
  { id: 47, title: 'Tri Anamorph', image: BASE + '1337H4Xrender.png', featured: true },
  { id: 46, title: 'Organic Cell', image: BASE + 'aphrodite.png' },
  { id: 44, title: 'Gaussian Splat Assembly', image: BASE + 'BryanAgency.png' },
  { id: 43, title: 'The Cube', image: BASE + 'Gabecube.png' },
  { id: 42, title: 'Fluid Distortion Slider', image: BASE + 'pooltest.png' },
  { id: 37, title: 'Box Peek', image: BASE + 'Megalophobia1.png' },
  { id: 35, title: 'Water Text', image: BASE + 'pHOTO.png' },
  { id: 34, title: 'Sci-Fi Terrain', image: BASE + 'renderoffice.png' },
  { id: 33, title: 'Lightning Text', image: BASE + 'EliasRENDER2.png' },
  { id: 32, title: 'Reaction-Diffusion', image: BASE + 'Pixelsorted.png' },
  { id: 30, title: 'Flip Book', image: BASE + 'apple.png' },
  { id: 29, title: 'Lightning Arcs', image: BASE + 'renderarc.png' },
  { id: 28, title: 'Teleport', image: BASE + 'renderdeadhand.png' },
  { id: 27, title: 'Emoji Bounce', image: BASE + 'Scoutgoldpan.png' },
  { id: 25, title: 'Parasite Reach', image: BASE + 'Vice1.png' },
  { id: 24, title: 'Velocity Stretch', image: BASE + 'FracturedReality.png' },
  { id: 23, title: 'Wired Growth', image: BASE + '1337H4Xrender2.png' },
  { id: 20, title: 'Ghost Thread', image: BASE + 'backrooms2.png' },
  { id: 17, title: 'Fireworks', image: BASE + 'MinephucIFIVESEVEN.png' },
  { id: 14, title: 'Sci-Fi Tube', image: BASE + 'paranormal4.png' },
  { id: 13, title: 'Logo Particle Flow', image: BASE + 'renderagency1.png' },
  { id: 10, title: 'GPU Particles', image: BASE + 'Renderm4fade.png' },
  { id: 9, title: 'Liquid Glass Effect', image: BASE + 'Rendermileteawp.png' },
  { id: 7, title: 'Canvas Particles', image: BASE + 'TaggedDark2.png' },
  { id: 5, title: 'The ASCII Explorer', image: BASE + 'Vice2.png' },
  { id: 4, title: 'Portal Cube', image: BASE + 'apple.png' },
  { id: 3, title: 'Transmission', image: BASE + '1337H4Xrender.png' },
  { id: 2, title: '3D Gaussian Splatting', image: BASE + 'Gabecube.png' },
  { id: 1, title: 'Exploding Skeleton', image: BASE + 'pooltest.png' },
  { id: 48, title: 'ascii-art', image: BASE + 'ascii-art.png' },
  { id: 49, title: 'testpixel2.0000', image: BASE + 'testpixel2.0000.png' },
  { id: 50, title: 'voxel.0038', image: BASE + 'voxel.0038.png' },
  { id: 51, title: 'Mini Dust2', image: BASE + 'pg_mini_dust2.webp' },
  { id: 52, title: 'Mini Inferno', image: BASE + 'pg_mini_inferno.webp' },
];

const featured = projects.find(p => p.featured);
const gridProjects = projects;

// Derive the optimized 512px WebP thumbnail path from a full-resolution
// original (e.g. '/Christmas.png' -> '/thumbs/Christmas.webp').
function thumbUrl(originalPath) {
  const name = originalPath.split('/').pop().replace(/\.(png|jpg|jpeg|webp)$/i, '');
  return BASE + `thumbs/${name}.webp`;
}

function CrystalGrid({ projects, onSelect }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {projects.map((project, i) => (
        <motion.button
          key={project.id}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.02, duration: 0.4 }}
          whileHover={{ scale: 1.05, zIndex: 10 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect?.(project)}
          className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer w-[calc(50%-6px)] sm:w-[calc(33.3333%-8px)] md:w-[calc(25%-9px)] lg:w-[calc(20%-9.6px)]"
        >
          <img
            src={thumbUrl(project.image)}
            alt={project.title}
            loading="lazy"
            decoding="async"
            width="512"
            height="512"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <span className="text-[10px] font-medium text-white tracking-wide text-left leading-tight">
              {project.title}
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

function ListView({ projects, onSelect }) {
  return (
    <div className="flex flex-col gap-1">
      {projects.map((project, i) => (
        <motion.button
          key={project.id}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.02, duration: 0.3 }}
          onClick={() => onSelect?.(project)}
          className="flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
            <img
              src={thumbUrl(project.image)}
              alt={project.title}
              loading="lazy"
              decoding="async"
              width="512"
              height="512"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-white group-hover:text-white transition-colors">
              {project.title}
            </p>
            <p className="text-xs text-white/40">
              #{String(project.id).padStart(2, '0')}
            </p>
          </div>
          <span className="text-white/30 group-hover:text-white/60 transition-colors text-lg">→</span>
        </motion.button>
      ))}
    </div>
  );
}

export default function LabPage() {
  const [view, setView] = useState('CRYSTAL');
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <main id="main-content" className="min-h-screen">
      <div className="pt-24 pb-16 px-6 md:px-16 max-w-6xl mx-auto">
        {/* Page Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-4xl md:text-6xl font-extralight text-white tracking-tight mb-16"
        >
          RENDER BASEMENT
        </motion.h1>

        {/* Featured Project */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-16 p-8 border border-white/10 rounded-xl"
          >
            <div>
              <p className="text-xs text-white/40 tracking-widest mb-2">#{featured.id}</p>
              <h2 className="text-2xl md:text-3xl font-light text-white">{featured.title}</h2>
            </div>
            <motion.a
              href="https://www.twitch.tv/minephuc123"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 border border-white/30 rounded-full text-xs tracking-widest text-white hover:bg-white hover:text-black transition-all duration-300"
            >
              <span>VISIT LIVE</span>
              <span className="text-base">→</span>
            </motion.a>
          </motion.div>
        )}

        {/* Scroll hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-[10px] tracking-[0.3em] text-white/40 mb-8"
        >
          SCROLL TO SEE MORE
        </motion.p>

        {/* View Toggle */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setView('CRYSTAL')}
            className={`px-5 py-2 text-xs tracking-widest rounded-full border transition-all duration-300 ${
              view === 'CRYSTAL'
                ? 'bg-white text-black border-white font-semibold'
                : 'border-white/20 text-white/60 hover:border-white/50'
            }`}
          >
            CRYSTAL
          </button>
          <button
            onClick={() => setView('LIST')}
            className={`px-5 py-2 text-xs tracking-widest rounded-full border transition-all duration-300 ${
              view === 'LIST'
                ? 'bg-white text-black border-white font-semibold'
                : 'border-white/20 text-white/60 hover:border-white/50'
            }`}
          >
            LIST
          </button>
        </div>

        {/* Project Grid / List */}
        <AnimatePresence mode="wait">
          {view === 'CRYSTAL' ? (
            <motion.div
              key="crystal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CrystalGrid projects={gridProjects} onSelect={setSelectedProject} />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ListView projects={gridProjects} onSelect={setSelectedProject} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      {createPortal(
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-2xl"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="relative max-w-[85vw] max-h-[85vh] flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute -top-14 right-0 text-white/50 hover:text-white text-2xl transition-colors cursor-pointer bg-transparent border-none p-2"
                  aria-label="Close lightbox"
                >
                  ×
                </button>
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="max-w-[85vw] max-h-[75vh] object-contain rounded-xl shadow-2xl"
                />
                <div className="mt-5 text-center">
                  <h3 className="text-lg font-light text-white tracking-wide">{selectedProject.title}</h3>
                  <p className="text-xs text-white/40 tracking-widest mt-1">
                    #{String(selectedProject.id).padStart(2, '0')}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </main>
  );
}