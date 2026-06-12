# 🎞️ Lumière — Vintage Digital Photobooth

### 🔗 Live Demo: [https://ruhi1911.github.io/lumiere-photobooth/](https://ruhi1911.github.io/lumiere-photobooth/)
*(Note: Replace `ruhi1911` with your actual GitHub username once deployed!)*

---

**Lumière** is a complete, cinematic, and vintage-inspired digital photobooth website built entirely with **HTML5, CSS3, and Vanilla JavaScript (ES6+)**. It features live camera capture with retro film styling, custom frames, drag-and-drop stickers, and Web Audio API-synthesized sound effects, running completely client-side without any frameworks or build tools.

---

## ✨ Features

- **Illustrated Retro Facade**: A CSS-only vintage photobooth complete with a glowing sign, blinking marquee lights, a coin-insert slot, and interactive curtain flaps.
- **Synthesized Retro Audio**: Procedural sound chimes and clicks generated on-the-fly via the browser's Web Audio API. Includes a brass coin-drop sound, oscillator countdown beeps, mechanical shutter clicks, and printing stepper-motor hums.
- **Live Video Viewport**: Mirrored selfie view displaying your webcam feed with real-time vintage CSS filters applied (Kodak, Film Noir, Golden Hour, Lomo, Polaroid).
- **Physical Photo Upload**: Below the camera, you can drag/upload existing photo files, apply retro styling, and combine them into your session.
- **Capturing Countdown**: Full-screen overlay countdown with scaling number pops, pitch-perfect audio beeps, and screen flash effects on capture.
- **Customized Frames**: Choose from 6 different frame templates (Classic White, Film Strip with sprocket holes, Floral corners, Polaroid card, Neon Arcade, or Washi Tape overlays) and choose a custom accent color.
- **Photostrip Builder**: Arrange your shots in a classic vertical strip or a 2x2 grid, customize borders, write a cursive note (max 80 chars), and stamp the date.
- **Interactive Stickers**: Place, clear, and decorate your strip with adorable emoji stickers.
- **Print & Download Animation**: Slide-down printing animation accompanied by a muffled stepper-motor sound, saving a lossless PNG file named `lumiere-strip-[timestamp].png`.
- **Dreamy Outro Card**: Features a cute HTML/CSS character and a typewriter-animated greeting set to a arpeggiated music box arpeggio.

---

## 🛠️ Tech Stack & Requirements

- **Markup & Styling**: Semantic HTML5 & Vanilla CSS3 (with repeating SVG noise patterns, floating bokeh light blobs, and transitions).
- **Behavior**: Vanilla JavaScript (ES6+).
- **Audio**: Web Audio API (procedural synthesis, no audio asset files needed).
- **Camera Access**: `navigator.mediaDevices.getUserMedia` browser API.
- **Storage**: `localStorage` to pass photo buffers and customization parameters between pages.
- **Fonts**: Playfair Display (headings), Caveat (handwritten notes), and DM Sans (UI) via Google Fonts CDN.

---

## 🚀 Deployment to GitHub Pages

Since **Lumière** is a fully static client-side web application with no build steps, hosting it on GitHub Pages is incredibly simple.

### Step 1: Initialize Git and Commit
If Git is installed on your computer, run the following commands in the project folder:
```bash
git init
git add .
git commit -m "Initial commit of Lumière Photobooth website"
```

### Step 2: Create a Repository on GitHub
1. Go to [github.com](https://github.com/) and create a new repository named `lumiere-photobooth`.
2. Keep it **Public** (required for free GitHub Pages).
3. Leave "Initialize this repository with..." options unchecked.

### Step 3: Push to GitHub
Link your local folder to GitHub and push the code:
```bash
git remote add origin https://github.com/ruhi1911/lumiere-photobooth.git
git branch -M main
git push -u origin main
```
*(Remember to replace `ruhi1911` with your actual GitHub username!)*

### Step 4: Enable GitHub Pages
1. On your GitHub repository page, navigate to **Settings** (tab on the top).
2. On the left sidebar, click **Pages** (under the "Code and automation" section).
3. Under **Build and deployment**, set the Source to **Deploy from a branch**.
4. Choose the `main` branch and `/ (root)` folder, then click **Save**.
5. After a minute, refresh the page to find your live deployment link at the top of the Pages settings tab!
