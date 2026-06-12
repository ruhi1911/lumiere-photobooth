/* ============================================================================
 * filters.js — Vintage Filter Definitions
 * Digital Vintage Photobooth
 * ---------------------------------------------------------------------------
 * Export definitions of the 6 core filters used live on the video feed
 * and on the high-resolution canvas render.
 * ========================================================================= */

const vintageFilters = {
  original: {
    name: 'Original',
    css: 'none'
  },
  kodak: {
    name: 'Kodak',
    css: 'sepia(0.35) contrast(1.1) brightness(1.05) saturate(1.2)'
  },
  noir: {
    name: 'Film Noir',
    css: 'grayscale(1) contrast(1.3) brightness(0.95)'
  },
  golden: {
    name: 'Golden Hour',
    css: 'sepia(0.5) saturate(1.6) brightness(1.1) hue-rotate(-5deg)'
  },
  lomo: {
    name: 'Lomo',
    css: 'saturate(1.9) contrast(1.25) brightness(0.95) hue-rotate(8deg)'
  },
  polaroid: {
    name: 'Polaroid',
    css: 'sepia(0.2) contrast(1.05) brightness(1.1) saturate(0.9)'
  }
};

window.vintageFilters = vintageFilters;
