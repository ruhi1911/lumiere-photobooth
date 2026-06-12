/* ============================================================================
 * camera.js — Camera Init, Countdown, Capture, and Upload Logic
 * Digital Vintage Photobooth
 * ---------------------------------------------------------------------------
 * Direct implementation of webcam access, filter previews, custom frame updates,
 * sequenced captures with Audio Engine beeps, and file uploads.
 * ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const video = document.getElementById('cameraVideo');
  const captureCanvas = document.getElementById('captureCanvas');
  const captureCtx = captureCanvas.getContext('2d');
  const startSessionBtn = document.getElementById('startSessionBtn');
  const makeStripBtn = document.getElementById('makeStripBtn');
  const cameraViewport = document.getElementById('cameraViewportContainer');
  const cameraStatusText = document.getElementById('cameraStatusText');
  const countdownOverlay = document.getElementById('countdownOverlay');
  const countdownNumber = document.getElementById('countdownNumber');
  const flashOverlay = document.getElementById('flashOverlay');
  const thumbnailsContainer = document.getElementById('thumbnailsContainer');
  const previewCountText = document.getElementById('previewCountText');
  
  // Customization controls
  const filterPickerGrid = document.getElementById('filterPickerGrid');
  const framePickerGrid = document.getElementById('framePickerGrid');
  const frameColorInput = document.getElementById('frameColorInput');
  const photoUploadInput = document.getElementById('photoUploadInput');
  
  // State variables
  let localStream = null;
  let capturedPhotos = []; // elements: { dataURL, filter, frame, frameColor }
  let targetShots = 4; // default from checked radio
  let currentFilter = 'original';
  let currentFrameStyle = 'classic-white';
  let currentFrameColor = '#E8C4C4';
  let isCapturing = false;

  // Curtain Open Transition
  const body = document.body;
  body.classList.add('transitioning');
  setTimeout(() => body.classList.remove('transitioning'), 50);

  // Initialize camera access
  async function initWebcam() {
    try {
      cameraStatusText.innerHTML = '📷 Requesting camera access...';
      cameraStatusText.className = 'status-indicator';
      
      const constraints = {
        video: {
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          facingMode: 'user'
        },
        audio: false
      };
      
      localStream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = localStream;
      
      video.onloadedmetadata = () => {
        cameraStatusText.innerHTML = '✅ Camera ready!';
        cameraStatusText.className = 'status-indicator ready';
        startSessionBtn.removeAttribute('disabled');
      };
    } catch (err) {
      console.error('Webcam initialization failed: ', err);
      cameraStatusText.innerHTML = '❌ Camera blocked or offline. Please allow access in browser settings.';
      cameraStatusText.className = 'status-indicator error';
      // startSessionBtn remains disabled, but they can still upload photos!
    }
  }

  initWebcam();

  // Handle Vintage Filter selection
  filterPickerGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    // Set active class
    filterPickerGrid.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update filter selection
    currentFilter = btn.dataset.filter;
    const filterPreset = window.vintageFilters[currentFilter];
    
    if (filterPreset) {
      // Apply CSS filter live on video element
      video.style.filter = filterPreset.css;
    }
  });

  // Handle Frame style selection
  framePickerGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.frame-btn');
    if (!btn) return;

    // Set active class
    framePickerGrid.querySelectorAll('.frame-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Remove old frame classes
    cameraViewport.className = 'camera-container-wrapper';

    // Add new frame class
    currentFrameStyle = btn.dataset.frame;
    cameraViewport.classList.add('frame-' + currentFrameStyle);

    // Toggle special washi-tape corner graphics in DOM
    const washiOverlays = cameraViewport.querySelectorAll('.washi-overlay');
    washiOverlays.forEach(overlay => {
      overlay.style.display = (currentFrameStyle === 'washi-tape') ? 'block' : 'none';
    });
  });

  // Handle custom frame color picker
  frameColorInput.addEventListener('input', (e) => {
    currentFrameColor = e.target.value;
    cameraViewport.style.setProperty('--frame-color', currentFrameColor);
  });

  // Handle total photo count change (3 or 4)
  document.querySelectorAll('input[name="photoCount"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      targetShots = parseInt(e.target.value);
      updatePreviewUI();
    });
  });

  // Update Preview UI (Thumbnails & Counter)
  function updatePreviewUI() {
    previewCountText.textContent = `${capturedPhotos.length} / ${targetShots}`;
    
    // Clear thumbnails
    thumbnailsContainer.innerHTML = '';
    
    // Fill active thumbnails
    for (let i = 0; i < targetShots; i++) {
      const thumb = document.createElement('div');
      thumb.className = 'preview-thumbnail';
      
      if (i < capturedPhotos.length) {
        const img = document.createElement('img');
        img.src = capturedPhotos[i].dataURL;
        thumb.appendChild(img);
      } else {
        thumb.classList.add('preview-thumbnail-empty');
        thumb.textContent = '✦';
      }
      thumbnailsContainer.appendChild(thumb);
    }

    // Toggle start session / make strip buttons
    if (capturedPhotos.length >= targetShots) {
      startSessionBtn.style.display = 'none';
      makeStripBtn.style.display = 'block';
    } else {
      startSessionBtn.style.display = 'block';
      makeStripBtn.style.display = 'none';
    }
  }

  // Handle File Uploads
  photoUploadInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    let loadedCount = 0;
    files.forEach(file => {
      if (capturedPhotos.length >= targetShots) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Process uploaded photo on canvas at full resolution
          captureCanvas.width = img.width;
          captureCanvas.height = img.height;
          captureCtx.clearRect(0, 0, img.width, img.height);
          
          // Apply current vintage filter
          const filterPreset = window.vintageFilters[currentFilter];
          captureCtx.filter = filterPreset ? filterPreset.css : 'none';
          
          // Draw image
          captureCtx.drawImage(img, 0, 0, img.width, img.height);

          // Get DataURL and save
          const dataURL = captureCanvas.toDataURL('image/png', 1.0);
          capturedPhotos.push({
            dataURL: dataURL,
            filter: currentFilter,
            frame: currentFrameStyle,
            frameColor: currentFrameColor
          });

          // Save to localStorage
          localStorage.setItem('capturedPhotos', JSON.stringify(capturedPhotos));
          localStorage.setItem('photoDate', new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }));

          updatePreviewUI();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    photoUploadInput.value = '';
  });

  // Start capture sequence
  startSessionBtn.addEventListener('click', async () => {
    if (isCapturing) return;
    isCapturing = true;
    startSessionBtn.setAttribute('disabled', 'true');
    
    // Unlock/init audio context
    if (window.audio) {
      window.audio.init();
    }

    const shotsNeeded = targetShots - capturedPhotos.length;
    for (let s = 0; s < shotsNeeded; s++) {
      // 1. Countdown overlay active
      countdownOverlay.classList.add('active');

      // 3 beeps, 1s apart: 3 -> 2 -> 1 -> SMILE
      const steps = ['3', '2', '1', 'SMILE! 😄'];
      const pitches = [440, 550, 660];

      for (let i = 0; i < steps.length; i++) {
        countdownNumber.textContent = steps[i];
        countdownNumber.className = 'countdown-number pop';
        
        // Play oscillator beep for 3, 2, 1
        if (i < 3 && window.audio) {
          window.audio.playBeep(pitches[i]);
        }

        // Wait 1 second (minus visual animation styling window)
        await delay(1000);
        countdownNumber.className = 'countdown-number';
      }

      // Hide countdown overlay
      countdownOverlay.classList.remove('active');

      // 2. Play mechanical shutter and flash overlay
      if (window.audio) {
        window.audio.playShutterSound();
      }
      flashOverlay.classList.add('active');
      await delay(200);
      flashOverlay.classList.remove('active');

      // 3. Draw current video frame onto canvas at FULL video resolution
      const videoWidth = video.videoWidth || 1280;
      const videoHeight = video.videoHeight || 720;
      captureCanvas.width = videoWidth;
      captureCanvas.height = videoHeight;

      captureCtx.save();
      
      // Clear the canvas
      captureCtx.clearRect(0, 0, videoWidth, videoHeight);

      // Mirror horizontally
      captureCtx.translate(videoWidth, 0);
      captureCtx.scale(-1, 1);

      // Apply vintage filter
      const filterPreset = window.vintageFilters[currentFilter];
      captureCtx.filter = filterPreset ? filterPreset.css : 'none';

      // Draw the video frame
      captureCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
      captureCtx.restore();

      // Store image object
      const dataURL = captureCanvas.toDataURL('image/png', 1.0);
      capturedPhotos.push({
        dataURL: dataURL,
        filter: currentFilter,
        frame: currentFrameStyle,
        frameColor: currentFrameColor
      });

      // Save to localStorage
      localStorage.setItem('capturedPhotos', JSON.stringify(capturedPhotos));
      localStorage.setItem('photoDate', new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));

      // Update previews
      updatePreviewUI();

      // If we finished all shots, exit early
      if (capturedPhotos.length >= targetShots) {
        break;
      }

      // Status pause between captures (2 seconds)
      cameraStatusText.innerHTML = `✨ Nice! Next shot in 2s...`;
      cameraStatusText.className = 'status-indicator';
      await delay(2000);
      cameraStatusText.innerHTML = `✅ Camera ready!`;
      cameraStatusText.className = 'status-indicator ready';
    }

    isCapturing = false;
    startSessionBtn.removeAttribute('disabled');

    if (capturedPhotos.length >= targetShots && window.audio) {
      window.audio.playMechanicalPrintSound();
    }
  });

  // Navigate to strip builder
  makeStripBtn.addEventListener('click', () => {
    // Close curtains
    body.classList.add('transitioning');
    
    // Navigate
    setTimeout(() => {
      window.location.href = 'strip.html';
    }, 800);
  });

  // Helper Delay
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
});
