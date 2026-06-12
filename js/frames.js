/* ============================================================================
 * frames.js — Retro Frame Drawing Engine
 * Digital Vintage Photobooth
 * ---------------------------------------------------------------------------
 * Provides functions to render frame styles on a Canvas 2D Context.
 * ========================================================================= */

const framesEngine = {
  /**
   * Draws a photo with a selected frame style onto the context.
   * 
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context.
   * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} img - Photo image source.
   * @param {number} x - Bounding box x-coordinate.
   * @param {number} y - Bounding box y-coordinate.
   * @param {number} w - Bounding box width.
   * @param {number} h - Bounding box height.
   * @param {string} style - Frame style ("classic-white", "film-strip", etc.).
   * @param {string} color - Custom accent color (hex string).
   */
  drawFrame(ctx, img, x, y, w, h, style = 'classic-white', color = '#E8C4C4') {
    ctx.save();

    // Default border width based on width
    const b = w * 0.05; 

    // Handle styles
    if (style === 'classic-white') {
      // White background card
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y, w, h);

      // Draw photo inside
      const px = x + b;
      const py = y + b;
      const pw = w - 2 * b;
      const ph = h - 2 * b;
      ctx.drawImage(img, px, py, pw, ph);

      // Fine inner outline
      ctx.strokeStyle = 'rgba(26, 20, 16, 0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, pw, ph);

    } else if (style === 'film-strip') {
      // Black background card
      ctx.fillStyle = '#1A1410';
      ctx.fillRect(x, y, w, h);

      // Cutout coordinates (extra left/right margins for sprocket holes)
      const px = x + b * 1.8;
      const py = y + b;
      const pw = w - 3.6 * b;
      const ph = h - 2 * b;
      ctx.drawImage(img, px, py, pw, ph);

      // Draw film sprocket holes (rounded rects) on the left/right margins
      ctx.fillStyle = '#FFF8F0'; // Cream background matching holes
      const numHoles = 5;
      const holeW = b * 0.5;
      const holeH = b * 0.5;
      const holeSpacing = ph / (numHoles + 1);

      for (let i = 1; i <= numHoles; i++) {
        const holeY = py + i * holeSpacing - holeH / 2;
        
        // Left hole
        const holeLx = x + (b * 1.8 - holeW) / 2;
        ctx.beginPath();
        ctx.rect(holeLx, holeY, holeW, holeH);
        ctx.fill();

        // Right hole
        const holeRx = x + w - (b * 1.8 + holeW) / 2;
        ctx.beginPath();
        ctx.rect(holeRx, holeY, holeW, holeH);
        ctx.fill();
      }

    } else if (style === 'floral-pastel') {
      // White background card
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y, w, h);

      // Draw photo inside
      const px = x + b;
      const py = y + b;
      const pw = w - 2 * b;
      const ph = h - 2 * b;
      ctx.drawImage(img, px, py, pw, ph);

      // Soft floral borders
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(px, py, pw, ph);

      // Draw "❀" corner symbols
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.max(16, Math.round(w * 0.06))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const offset = b / 2;
      ctx.fillText('❀', x + offset, y + offset); // Top Left
      ctx.fillText('❀', x + w - offset, y + offset); // Top Right
      ctx.fillText('❀', x + offset, y + h - offset); // Bottom Left
      ctx.fillText('❀', x + w - offset, y + h - offset); // Bottom Right

    } else if (style === 'polaroid') {
      // Classic Polaroid: thicker border at the bottom
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y, w, h);

      // Draw photo inside
      const px = x + b;
      const py = y + b;
      const pw = w - 2 * b;
      const ph = h - 3.2 * b; // Leaves 2.2*b at the bottom
      ctx.drawImage(img, px, py, pw, ph);

      // Inner outline
      ctx.strokeStyle = 'rgba(26, 20, 16, 0.06)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, pw, ph);

    } else if (style === 'neon-arcade') {
      // Dark arcade background
      ctx.fillStyle = '#120F1C';
      ctx.fillRect(x, y, w, h);

      // Draw photo inside
      const px = x + b;
      const py = y + b;
      const pw = w - 2 * b;
      const ph = h - 2 * b;
      ctx.drawImage(img, px, py, pw, ph);

      // Glowing Neon border
      ctx.shadowColor = color || '#FF1493';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = color || '#FF1493';
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
      ctx.strokeRect(px, py, pw, ph);

    } else if (style === 'washi-tape') {
      // White background card
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y, w, h);

      // Draw photo inside
      const px = x + b;
      const py = y + b;
      const pw = w - 2 * b;
      const ph = h - 2 * b;
      ctx.drawImage(img, px, py, pw, ph);

      // Draw tape strips at corners
      ctx.fillStyle = color ? hexToRgba(color, 0.7) : 'rgba(200, 216, 192, 0.7)';
      
      const tapeW = w * 0.18;
      const tapeH = w * 0.06;

      // Top Left Tape
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-Math.PI / 6);
      ctx.fillRect(-tapeW / 2, -tapeH / 2, tapeW, tapeH);
      ctx.restore();

      // Top Right Tape
      ctx.save();
      ctx.translate(px + pw, py);
      ctx.rotate(Math.PI / 6);
      ctx.fillRect(-tapeW / 2, -tapeH / 2, tapeW, tapeH);
      ctx.restore();

      // Bottom Left Tape
      ctx.save();
      ctx.translate(px, py + ph);
      ctx.rotate(Math.PI / 6);
      ctx.fillRect(-tapeW / 2, -tapeH / 2, tapeW, tapeH);
      ctx.restore();

      // Bottom Right Tape
      ctx.save();
      ctx.translate(px + pw, py + ph);
      ctx.rotate(-Math.PI / 6);
      ctx.fillRect(-tapeW / 2, -tapeH / 2, tapeW, tapeH);
      ctx.restore();
    }

    ctx.restore();
  }
};

// Helper: Convert hex to RGBA
function hexToRgba(hex, alpha) {
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

window.framesEngine = framesEngine;
