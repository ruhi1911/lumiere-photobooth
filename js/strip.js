/* ============================================================================
 * strip.js — Photostrip Compositor and Customization Controller
 * Digital Vintage Photobooth
 * ---------------------------------------------------------------------------
 * Direct implementation of the photostrip rendering, interactive stickers,
 * note drawing, printing animations, and lossless PNG download.
 * ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const builderMainContent = document.getElementById('builderMainContent');
  const noPhotosFallback = document.getElementById('noPhotosFallback');
  const stripCanvas = document.getElementById('stripCanvas');
  const ctx = stripCanvas.getContext('2d');
  const stripCanvasContainer = document.getElementById('stripCanvasContainer');
  
  // Customization inputs
  const noteInput = document.getElementById('noteInput');
  const layoutPicker = document.getElementById('layoutPicker');
  const borderColorInput = document.getElementById('borderColorInput');
  const accentColorInput = document.getElementById('accentColorInput');
  const stickerPalette = document.getElementById('stickerPalette');
  const clearStickersBtn = document.getElementById('clearStickersBtn');
  
  // Print & Overlays
  const printDownloadBtn = document.getElementById('printDownloadBtn');
  const continueBtn = document.getElementById('continueBtn');
  const thankyouOverlay = document.getElementById('thankyouOverlay');
  const typewriterText = document.getElementById('typewriterText');
  const visitAgainBtn = document.getElementById('visitAgainBtn');
  const closeOverlayBtn = document.getElementById('closeOverlayBtn');

  // State
  let capturedPhotos = [];
  let loadedImages = [];
  let photoDate = '';
  let noteText = '';
  let activeLayout = 'vertical'; // 'vertical' | 'grid'
  let borderColor = '#E8C4C4';
  let accentColor = '#E8C4C4';
  let stickers = []; // Elements: { emoji, x, y } (percentages 0.0 to 1.0)
  let renderDebounceTimeout = null;

  // Curtain Open Transition
  const body = document.body;
  body.classList.add('transitioning');
  setTimeout(() => body.classList.remove('transitioning'), 50);

  // Load photos from localStorage
  function loadData() {
    try {
      const photosData = localStorage.getItem('capturedPhotos');
      const dateData = localStorage.getItem('photoDate');
      
      if (photosData) {
        capturedPhotos = JSON.parse(photosData);
      }
      
      photoDate = dateData || new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (capturedPhotos.length === 0) {
        // Show fallback
        builderMainContent.style.display = 'none';
        noPhotosFallback.style.display = 'block';
        return false;
      }
      
      builderMainContent.style.display = 'grid';
      noPhotosFallback.style.display = 'none';
      return true;
    } catch (err) {
      console.error('Failed to load photos data from localStorage:', err);
      builderMainContent.style.display = 'none';
      noPhotosFallback.style.display = 'block';
      return false;
    }
  }

  // Promise image loader helper
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image: ' + src));
      img.src = src;
    });
  }

  // Load all images and render
  async function initializeBuilder() {
    if (!loadData()) return;

    try {
      // Load all photos concurrently
      const loadPromises = capturedPhotos.map(p => loadImage(p.dataURL));
      loadedImages = await Promise.all(loadPromises);
      
      // Initial render
      triggerRender();
    } catch (err) {
      console.error('Error loading captured images: ', err);
    }
  }

  initializeBuilder();

  // Debounced rendering handler
  function triggerRender() {
    if (renderDebounceTimeout) {
      clearTimeout(renderDebounceTimeout);
    }
    renderDebounceTimeout = setTimeout(() => {
      renderStrip();
    }, 150);
  }

  // Main render routine
  function renderStrip() {
    if (loadedImages.length === 0) return;

    // Dimensions setup based on layout
    const n = loadedImages.length;
    let canvasW = 800;
    let canvasH = 2000;
    
    // Top margin, bottom margin, gap, inner column padding
    const topMargin = 70;
    const bottomMargin = 200;
    const gap = 20;

    if (activeLayout === 'vertical') {
      canvasW = 800;
      const leftMargin = 80;
      const printableW = canvasW - 2 * leftMargin;
      const photoH = Math.round(printableW * 0.75); // 4:3 aspect ratio
      
      canvasH = topMargin + n * photoH + (n - 1) * gap + bottomMargin;
      
      stripCanvas.width = canvasW;
      stripCanvas.height = canvasH;
      
      // Set display scale in DOM
      stripCanvas.style.width = '300px';
      stripCanvas.style.height = 'auto';

      // 1. Draw solid white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasW, canvasH);

      // 2. Draw each photo with its frame
      for (let i = 0; i < n; i++) {
        const py = topMargin + i * (photoH + gap);
        const photo = capturedPhotos[i];
        
        window.framesEngine.drawFrame(
          ctx, 
          loadedImages[i], 
          leftMargin, 
          py, 
          printableW, 
          photoH, 
          photo.frame, 
          photo.frameColor
        );
      }

    } else if (activeLayout === 'grid') {
      // 2x2 grid layout
      canvasW = 1200;
      const leftMargin = 100;
      const printableW = canvasW - 2 * leftMargin;
      const colW = Math.round((printableW - gap) / 2);
      const photoH = Math.round(colW * 0.75); // 4:3 ratio

      const numRows = Math.ceil(n / 2);
      canvasH = topMargin + numRows * photoH + (numRows - 1) * gap + bottomMargin;

      stripCanvas.width = canvasW;
      stripCanvas.height = canvasH;

      stripCanvas.style.width = '380px';
      stripCanvas.style.height = 'auto';

      // 1. Draw solid white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasW, canvasH);

      // 2. Draw photos in a 2x2 grid pattern
      for (let i = 0; i < n; i++) {
        const row = Math.floor(i / 2);
        const col = i % 2;
        
        const px = leftMargin + col * (colW + gap);
        const py = topMargin + row * (photoH + gap);
        const photo = capturedPhotos[i];

        window.framesEngine.drawFrame(
          ctx, 
          loadedImages[i], 
          px, 
          py, 
          colW, 
          photoH, 
          photo.frame, 
          photo.frameColor
        );
      }
    }

    // 3. Draw film sprocket holes repeating down margins
    ctx.fillStyle = borderColor;
    const sprocketW = 12;
    const sprocketH = 18;
    const sprocketRadius = 3;
    const sprocketGap = 45;
    const totalSprockets = Math.floor(canvasH / sprocketGap);

    for (let i = 0; i < totalSprockets; i++) {
      const sy = i * sprocketGap + (sprocketGap - sprocketH) / 2;
      if (sy < 15 || sy > canvasH - 25) continue; // safety bounds

      // Left margin holes
      const lx = 25;
      drawRoundedRect(ctx, lx, sy, sprocketW, sprocketH, sprocketRadius);
      ctx.fill();

      // Right margin holes
      const rx = canvasW - 25 - sprocketW;
      drawRoundedRect(ctx, rx, sy, sprocketW, sprocketH, sprocketRadius);
      ctx.fill();
    }

    // 4. Draw Footer watermark, date, and custom handwritten note
    const footerY = canvasH - 140;

    // Watermark
    ctx.fillStyle = '#CCCCCC';
    ctx.font = 'italic 11px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦ lumière booth ✦', canvasW / 2, footerY);

    // Date
    ctx.fillStyle = '#999999';
    ctx.font = 'normal 13px "DM Sans", sans-serif';
    ctx.fillText(photoDate, canvasW / 2, footerY + 25);

    // Handwritten Note
    if (noteText) {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 28px "Caveat", cursive';
      ctx.fillText(noteText, canvasW / 2, footerY + 65);
    }

    // 5. Draw interactive stickers
    stickers.forEach(sticker => {
      const sx = sticker.x * canvasW;
      const sy = sticker.y * canvasH;
      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.font = '36px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sticker.emoji, sx, sy);
      ctx.restore();
    });
  }

  // Rounded rectangle helper
  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Handle Note input changes
  noteInput.addEventListener('input', (e) => {
    noteText = e.target.value.substring(0, 80);
    triggerRender();
  });

  // Handle Strip Layout select
  layoutPicker.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    layoutPicker.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    activeLayout = btn.dataset.layout;
    triggerRender();
  });

  // Handle Colors inputs
  borderColorInput.addEventListener('input', (e) => {
    borderColor = e.target.value;
    triggerRender();
  });

  accentColorInput.addEventListener('input', (e) => {
    accentColor = e.target.value;
    triggerRender();
  });

  // Handle Stickers placement
  stickerPalette.addEventListener('click', (e) => {
    const btn = e.target.closest('.sticker-btn');
    if (!btn) return;

    const emoji = btn.dataset.emoji;
    
    // Add sticker at a random printable spot in the margin or gap
    // To ensure they look neat, let's distribute them randomly
    const rx = 0.1 + Math.random() * 0.8; // between 10% and 90% width
    const ry = 0.05 + Math.random() * 0.8; // between 5% and 85% height

    stickers.push({
      emoji: emoji,
      x: rx,
      y: ry
    });

    triggerRender();
  });

  // Clear stickers button
  clearStickersBtn.addEventListener('click', () => {
    stickers = [];
    triggerRender();
  });

  // Handle Print & Download action
  printDownloadBtn.addEventListener('click', () => {
    // 1. Play mechanical print sound
    if (window.audio) {
      window.audio.playMechanicalPrintSound();
    }

    // 2. Add slide down animation class
    stripCanvasContainer.classList.add('printing');

    // 3. Trigger download after 1800ms
    setTimeout(() => {
      // Remove printing class
      stripCanvasContainer.classList.remove('printing');

      // Generate lossless PNG data URL
      const dataURL = stripCanvas.toDataURL('image/png', 1.0);
      
      // Download file hook
      const filename = `lumiere-strip-${Date.now()}.png`;
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 1800);
  });

  // Handle Continue to Thank You overlay
  continueBtn.addEventListener('click', () => {
    // Show overlay
    thankyouOverlay.classList.add('active');

    // Start typewriter effect
    const message = `Thank you for stepping into our little world today 🎞️\n\nYou looked absolutely gorgeous.\nEvery photo tells a story — and yours? It's one for the ages.\n\nCome back soon, we'll keep the lights on for you 🌸`;
    typewriterText.innerHTML = '';
    let idx = 0;

    // Start background melody loop arpeggios
    if (window.audio) {
      window.audio.startBackgroundMusic();
    }

    function typeChar() {
      if (idx < message.length) {
        const char = message[idx];
        if (char === '\n') {
          typewriterText.innerHTML += '<br>';
        } else {
          typewriterText.innerHTML += char;
        }
        idx++;
        setTimeout(typeChar, 35);
      }
    }

    // Start typing
    typeChar();
  });

  // Visit again redirection
  visitAgainBtn.addEventListener('click', () => {
    // Stop background music
    if (window.audio) {
      window.audio.stopBackgroundMusic();
    }

    // Clear session
    localStorage.removeItem('capturedPhotos');

    // Close curtains
    body.classList.add('transitioning');

    // Navigate to index
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
  });

  // Close overlay action
  closeOverlayBtn.addEventListener('click', () => {
    // Stop background music
    if (window.audio) {
      window.audio.stopBackgroundMusic();
    }
    
    // Hide overlay
    thankyouOverlay.classList.remove('active');
  });
});
