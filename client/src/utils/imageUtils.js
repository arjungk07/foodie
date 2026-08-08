/**
 * Lightweight SVG Data URI fallback for broken product images.
 */
export const FALLBACK_PRODUCT_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';

/**
 * Handles image load errors by assigning a lightweight local fallback image.
 * Prevents infinite error loops.
 */
export const handleImageError = (e) => {
  if (e.target && e.target.src !== FALLBACK_PRODUCT_IMAGE) {
    e.target.src = FALLBACK_PRODUCT_IMAGE;
  }
};
