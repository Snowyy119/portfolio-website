import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import WebGLBackground from './components/WebGLBackground';
import CustomCursor from './components/CustomCursor';
import CRTOverlay from './components/CRTOverlay';
import Header from './components/Header';
import SideNavigation from './components/SideNavigation';
import ProgressBar from './components/ProgressBar';
import HomePage from './pages/HomePage';
import LabPage from './pages/LabPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* CRT Scanline Overlay */}
      <div className="crt-overlay" aria-hidden="true" />

      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:text-sm focus:rounded"
      >
        Skip to main content
      </a>

      {/* WebGL Background */}
      <WebGLBackground />

      {/* Custom Cursor */}
      <CustomCursor />

      {/* CRT Cursor Glow + Trail */}
      <CRTOverlay />

      {!loaded && <LoadingScreen onLoadingComplete={() => setLoaded(true)} />}
      {loaded && (
        <>
          <ProgressBar />
          <Header menuOpen={menuOpen} onMenuToggle={() => setMenuOpen(!menuOpen)} />
          <SideNavigation menuOpen={menuOpen} onNavigate={() => setMenuOpen(false)} />
          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/lab" element={<LabPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </div>
        </>
      )}
    </div>
  );
}
