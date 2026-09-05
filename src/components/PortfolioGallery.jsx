import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { portfolioImages } from '../data/portfolioImages.js';

const categories = ['All', ...new Set(portfolioImages.map(img => img.category))];

function PortfolioGallery() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [loadedImages, setLoadedImages] = useState({});
  const [visibleImages, setVisibleImages] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const filtered = activeFilter === 'All'
      ? portfolioImages
      : portfolioImages.filter(img => img.category === activeFilter);
    setVisibleImages(filtered);
    setLoadedImages({});
  }, [activeFilter]);

  useEffect(() => {
    if (!observerRef.current) return;

    const handleIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('gallery-item-visible');
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => observerRef.current?.observe(item));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [visibleImages]);

  const handleImageLoad = (src) => {
    setLoadedImages(prev => ({ ...prev, [src]: true }));
  };

  const closeLightbox = (e) => {
    if (e.target === e.currentTarget) {
      setLightboxImage(null);
    }
  };

  return (
    <section className="portfolio-gallery" id="portfolio">
      <div className="gallery-header">
        <h2 className="gallery-title">Portfolio</h2>
        <p className="gallery-subtitle">A collection of renders, experiments, and visual explorations</p>
      </div>

      <div className="gallery-filters" role="group" aria-label="Filter portfolio by category">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
            onClick={() => setActiveFilter(cat)}
            aria-pressed={activeFilter === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {visibleImages.map((img, index) => (
          <div
            key={`${img.src}-${index}`}
            className="gallery-item"
            style={{ animationDelay: `${index * 0.05}s` }}
            role="button"
            tabIndex={0}
            aria-label={`View ${img.title}`}
            onClick={() => setLightboxImage(img)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setLightboxImage(img);
              }
            }}
          >
            <div className="gallery-item-inner">
              {!loadedImages[img.src] && (
                <div className="gallery-placeholder">
                  <div className="placeholder-shimmer" />
                </div>
              )}
              <img
                src={img.src}
                alt={img.title}
                loading="lazy"
                onLoad={() => handleImageLoad(img.src)}
                className={`gallery-image ${loadedImages[img.src] ? 'loaded' : ''}`}
              />
              <div className="gallery-overlay">
                <h3 className="gallery-item-title">{img.title}</h3>
                <span className="gallery-item-category">{img.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightboxImage &&
        createPortal(
          <div
            className="lightbox-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={lightboxImage.title}
            onClick={closeLightbox}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setLightboxImage(null);
            }}
            ref={(el) => {
              if (el) el.focus();
            }}
            tabIndex={-1}
          >
            <div className="lightbox-content">
              <button
                className="lightbox-close"
                onClick={() => setLightboxImage(null)}
                aria-label="Close image preview"
              >
                ✕
              </button>
              <img src={lightboxImage.src} alt={lightboxImage.title} />
              <div className="lightbox-info">
                <h3>{lightboxImage.title}</h3>
                <span>{lightboxImage.category}</span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}

export default PortfolioGallery;