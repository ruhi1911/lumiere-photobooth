/* ============================================================================
 * audio.js — Web Audio API Synthesis Engine
 * Digital Vintage Photobooth
 * ---------------------------------------------------------------------------
 * Every sound in the photobooth is generated procedurally with oscillators,
 * noise buffers, and filters. No external audio files are needed.
 * ========================================================================= */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.bgMusicInterval = null;
    this.isMusicPlaying = false;
    this._musicDelay = null;
  }

  /**
   * Initialize or resume the AudioContext. Must be called from a user gesture.
   */
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Helper: Generate a white noise buffer.
   */
  _noiseBuffer(duration) {
    if (!this.ctx) return null;
    const length = Math.ceil(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      channel[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Coin drop chime.
   */
  playCoinSound() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Layer 1: Chime
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.linearRampToValueAtTime(1200, now + 0.12);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1).connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // Layer 2: Metallic Overtone (delayed)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, now + 0.06);
    osc2.frequency.linearRampToValueAtTime(2100, now + 0.15);
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.15, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2).connect(this.ctx.destination);
    osc2.start(now + 0.06);
    osc2.stop(now + 0.55);
  }

  /**
   * Short beep.
   * @param {number} pitch - frequency in Hz
   */
  playBeep(pitch = 440) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Shutter click sound.
   */
  playShutterSound() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const noiseBuffer = this._noiseBuffer(0.12);
    if (!noiseBuffer) return;

    // Noise burst through filter
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.Q.setValueAtTime(2, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    noiseNode.connect(filter).connect(gain).connect(this.ctx.destination);
    noiseNode.start(now);
    noiseNode.stop(now + 0.12);

    // Sharp click transient
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2000, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.02);
    oscGain.gain.setValueAtTime(0.4, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(oscGain).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Mechanical printing sound.
   * Series of 8 short white noise bursts, 70ms apart.
   */
  playMechanicalPrintSound() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const burstDuration = 0.04; // 40ms each
    const delay = 0.07; // 70ms interval

    for (let i = 0; i < 8; i++) {
      const burstTime = now + (i * delay);
      const noiseBuffer = this._noiseBuffer(burstDuration);
      if (!noiseBuffer) continue;

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;

      // Filter to make it sound slightly mechanical/muffled
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, burstTime);
      filter.Q.setValueAtTime(4, burstTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, burstTime);
      gain.gain.exponentialRampToValueAtTime(0.001, burstTime + burstDuration - 0.005);

      noiseNode.connect(filter).connect(gain).connect(this.ctx.destination);
      noiseNode.start(burstTime);
      noiseNode.stop(burstTime + burstDuration);
    }
  }

  /**
   * Arpeggiated background music loop.
   */
  startBackgroundMusic() {
    this.init();
    if (!this.ctx || this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    const chords = [
      [261.63, 329.63, 392.00, 493.88],   // Cmaj7
      [220.00, 261.63, 329.63, 392.00],   // Am7
      [174.61, 220.00, 261.63, 329.63],   // Fmaj7
      [196.00, 246.94, 293.66, 349.23],   // G7
    ];

    if (!this._musicDelay) {
      const delay = this.ctx.createDelay(1.0);
      delay.delayTime.setValueAtTime(0.4, this.ctx.currentTime);

      const feedback = this.ctx.createGain();
      feedback.gain.setValueAtTime(0.3, this.ctx.currentTime);

      const master = this.ctx.createGain();
      master.gain.setValueAtTime(0.08, this.ctx.currentTime);

      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(master);
      master.connect(this.ctx.destination);

      this._musicDelay = { delay, feedback, master };
    }

    let chordIdx = 0;
    let noteIdx = 0;

    this.bgMusicInterval = setInterval(() => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freq = chords[chordIdx][noteIdx];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      if (this._musicDelay) {
        gain.connect(this._musicDelay.delay);
      }

      osc.start(now);
      osc.stop(now + 0.65);

      noteIdx++;
      if (noteIdx >= chords[chordIdx].length) {
        noteIdx = 0;
        chordIdx = (chordIdx + 1) % chords.length;
      }
    }, 400);
  }

  stopBackgroundMusic() {
    if (this.bgMusicInterval) {
      clearInterval(this.bgMusicInterval);
      this.bgMusicInterval = null;
    }
    this.isMusicPlaying = false;
  }
}

const audio = new AudioEngine();
window.audio = audio;
