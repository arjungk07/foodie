import React, { useState, useEffect } from 'react';

export default function ZoomImage({ images = [] }) {
  const [activeImage, setActiveImage] = useState('');
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

  useEffect(() => {
    if (images.length > 0) {
      setActiveImage(images[0]?.url);
    }
  }, [images]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    
    // Calculate cursor positions inside the container element (0 to 100%)
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '250%' // magnification scale
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-slate-100 dark:bg-slate-800 skeleton-shimmer"></div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      
      {/* Main Image viewport container */}
      <div 
        className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-850 dark:bg-dark-card cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={activeImage}
          alt="Product details"
          className="h-full w-full object-cover object-center"
        />
        
        {/* Zoomed lens overlay */}
        <div
          style={zoomStyle}
          className="absolute inset-0 pointer-events-none rounded-2xl bg-no-repeat shadow-inner transition-opacity duration-150"
        />
      </div>

      {/* Thumbnails list */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.publicId || idx}
              onClick={() => setActiveImage(img.url)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white dark:bg-dark-card transition-all cursor-pointer ${
                activeImage === img.url ? 'border-emerald-500 scale-95' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <img src={img.url} alt={`detail-${idx}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
