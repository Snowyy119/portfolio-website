import { motion } from '../lib/motion-fix';
import { Link } from 'react-router-dom';

const navItems = [
  { number: '01', label: 'HOME', to: '/' },
  { number: '02', label: 'LAB', to: '/lab' },
  { number: '03', label: 'ABOUT', to: '/about' },
];

const socials = [
  { label: 'Instagram', href: 'https://www.instagram.com/mine.phuci' },
  { label: 'X / Twitter', href: 'https://x.com/MinephucI' },
];

export default function SideNavigation({ menuOpen = false, onNavigate }) {
  const closedLeft = { opacity: 0, x: -30, pointerEvents: 'none' };
  const openLeft = { opacity: 1, x: 0, pointerEvents: 'auto' };
  const closedRight = { opacity: 0, x: 30, pointerEvents: 'none' };
  const openRight = { opacity: 1, x: 0, pointerEvents: 'auto' };

  return (
    <>
      {/* Left Navigation */}
      <motion.nav
        initial={false}
        animate={menuOpen ? openLeft : closedLeft}
        transition={{ duration: 0.5 }}
        className="fixed left-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-6"
      >
        {navItems.map((item, i) => (
          <Link
            key={item.label}
            to={item.to}
            onClick={() => onNavigate && onNavigate()}
            className="group relative flex items-center gap-3 text-white hover:opacity-70 transition-opacity"
          >
            <span className="text-xs font-light text-white/40 group-hover:text-white/70 transition-colors">
              {item.number}
            </span>
            <span className="text-xs tracking-widest font-light">
              {item.label}
            </span>
            <span className="absolute -left-8 w-0 h-px bg-white group-hover:w-4 transition-all duration-300" />
          </Link>
        ))}
      </motion.nav>

      {/* Right Socials */}
      <motion.div
        initial={false}
        animate={menuOpen ? openRight : closedRight}
        transition={{ duration: 0.5 }}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-center gap-4"
      >
        <span className="text-xs tracking-widest text-white/40 rotate-90 origin-center">
          SOCIALS
        </span>
        <div className="flex flex-col gap-3 mt-4">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-wider text-white/60 hover:text-white transition-colors"
            >
              {social.label}
            </a>
          ))}
        </div>
      </motion.div>
    </>
  );
}