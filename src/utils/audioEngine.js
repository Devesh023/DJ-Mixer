// Web Audio API Sound Engine for DJ Mixer Pro
// Synthesizes 24 Sound FX and 8 Drum Pads locally without external audio files.

let audioCtx = null;
let masterFxGain = null;
let analyserNode = null;

// Initialize Audio Context lazily on user gesture
export function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      
      masterFxGain = audioCtx.createGain();
      masterFxGain.gain.setValueAtTime(0.8, audioCtx.currentTime);

      analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 128;
      analyserNode.smoothingTimeConstant = 0.8;

      masterFxGain.connect(analyserNode);
      analyserNode.connect(audioCtx.destination);
    }
  }
  
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  return audioCtx;
}

export function getAnalyser() {
  getAudioContext();
  return analyserNode;
}

export function setMasterFxVolume(vol) {
  if (masterFxGain && audioCtx) {
    masterFxGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), audioCtx.currentTime);
  }
}

// Generate procedurally created white noise buffer
function createNoiseBuffer(ctx, durationSec = 1) {
  const bufferSize = ctx.sampleRate * durationSec;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// --- DRUM SYNTHESIZERS ---

export function playKick() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);

  gain.gain.setValueAtTime(1.0, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  // Click transient
  const clickOsc = ctx.createOscillator();
  const clickGain = ctx.createGain();
  clickOsc.type = 'triangle';
  clickOsc.frequency.setValueAtTime(300, now);
  clickOsc.frequency.exponentialRampToValueAtTime(50, now + 0.02);
  clickGain.gain.setValueAtTime(0.5, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

  clickOsc.connect(clickGain);
  clickGain.connect(masterFxGain);
  clickOsc.start(now);
  clickOsc.stop(now + 0.02);

  osc.connect(gain);
  gain.connect(masterFxGain);
  osc.start(now);
  osc.stop(now + 0.25);
}

export function playSnare() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Tone body
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
  oscGain.gain.setValueAtTime(0.7, now);
  oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

  osc.connect(oscGain);
  oscGain.connect(masterFxGain);
  osc.start(now);
  osc.stop(now + 0.15);

  // Noise snap
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx, 0.3);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1000, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.8, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(masterFxGain);

  noise.start(now);
  noise.stop(now + 0.2);
}

export function playClap() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx, 0.3);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, now);
  filter.Q.setValueAtTime(1.5, now);

  const gain = ctx.createGain();
  
  // Staggered burst envelope
  gain.gain.setValueAtTime(0, now);
  gain.gain.setValueAtTime(0.8, now);
  gain.gain.setValueAtTime(0.1, now + 0.015);
  gain.gain.setValueAtTime(0.9, now + 0.03);
  gain.gain.setValueAtTime(0.1, now + 0.045);
  gain.gain.setValueAtTime(1.0, now + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(masterFxGain);

  noise.start(now);
  noise.stop(now + 0.25);
}

export function playHiHat(open = false) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const duration = open ? 0.35 : 0.06;

  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx, duration + 0.05);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(7000, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(masterFxGain);

  noise.start(now);
  noise.stop(now + duration);
}

export function playTom() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.2);

  gain.gain.setValueAtTime(0.9, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.connect(gain);
  gain.connect(masterFxGain);

  osc.start(now);
  osc.stop(now + 0.25);
}

export function playCrash() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx, 1.2);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(4500, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.9, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(masterFxGain);

  noise.start(now);
  noise.stop(now + 1.2);
}

export function playRide() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc1.type = 'triangle';
  osc2.type = 'square';
  osc1.frequency.setValueAtTime(650, now);
  osc2.frequency.frequency = 940;

  filter.type = 'highpass';
  filter.frequency.setValueAtTime(5000, now);

  gain.gain.setValueAtTime(0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(masterFxGain);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.8);
  osc2.stop(now + 0.8);
}

export function playRimShot() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(850, now);
  gain.gain.setValueAtTime(0.8, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx, 0.04);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2000, now);
  filter.Q.setValueAtTime(5, now);

  noise.connect(filter);
  filter.connect(gain);

  osc.connect(gain);
  gain.connect(masterFxGain);

  osc.start(now);
  noise.start(now);
  osc.stop(now + 0.04);
  noise.stop(now + 0.04);
}

export function playPercussion() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

  gain.gain.setValueAtTime(0.8, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(gain);
  gain.connect(masterFxGain);

  osc.start(now);
  osc.stop(now + 0.09);
}

// --- 24 DJ SOUND EFFECTS SYNTHESIZERS ---

export function triggerSoundFX(effectId) {
  const ctx = getAudioContext();
  if (!ctx) return;

  switch (effectId) {
    case 'kick':
      playKick();
      break;
    case 'snare':
      playSnare();
      break;
    case 'clap':
      playClap();
      break;
    case 'hihat':
      playHiHat(false);
      break;
    case 'open_hihat':
      playHiHat(true);
      break;
    case 'rimshot':
      playRimShot();
      break;

    case 'bass': {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(45, now);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 0.4);

      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterFxGain);
      osc.start(now);
      osc.stop(now + 0.45);
      break;
    }

    case 'bass_drop': {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 1.2);

      gain.gain.setValueAtTime(1.0, now);
      gain.gain.linearRampToValueAtTime(0.8, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(masterFxGain);
      osc.start(now);
      osc.stop(now + 1.2);
      break;
    }

    case 'boom': {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);

      gain.gain.setValueAtTime(1.0, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterFxGain);
      osc.start(now);
      osc.stop(now + 0.7);
      break;
    }

    case 'air_horn': {
      // Classic DJ Reggae Air Horn (3 pitch slide oscillations)
      const now = ctx.currentTime;
      const freqs = [466.16, 587.33, 698.46]; // Bb4, D5, F5 chord
      const hornGain = ctx.createGain();
      hornGain.gain.setValueAtTime(0.7, now);
      hornGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq * 1.05, now + 0.1);
        osc.frequency.linearRampToValueAtTime(freq * 0.98, now + 0.4);
        osc.connect(hornGain);
        osc.start(now);
        osc.stop(now + 0.7);
      });

      hornGain.connect(masterFxGain);
      break;
    }

    case 'siren': {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      
      // Siren pitch cycle
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
      osc.frequency.linearRampToValueAtTime(500, now + 0.6);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.9);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

      osc.connect(gain);
      gain.connect(masterFxGain);
      osc.start(now);
      osc.stop(now + 1.0);
      break;
    }

    case 'bell': {
      const now = ctx.currentTime;
      const carrier = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      const mainGain = ctx.createGain();

      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(880, now); // A5

      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(880 * 2.4, now); // Metallic ratio

      modGain.gain.setValueAtTime(400, now);
      modGain.gain.exponentialRampToValueAtTime(0.1, now + 0.8);

      mainGain.gain.setValueAtTime(0.7, now);
      mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(mainGain);
      mainGain.connect(masterFxGain);

      carrier.start(now);
      modulator.start(now);
      carrier.stop(now + 0.8);
      modulator.stop(now + 0.8);
      break;
    }

    case 'laser': {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(masterFxGain);
      osc.start(now);
      osc.stop(now + 0.18);
      break;
    }

    case 'zap': {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'square';
      osc.frequency.setValueAtTime(1500, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, now);
      filter.Q.setValueAtTime(8, now);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterFxGain);
      osc.start(now);
      osc.stop(now + 0.14);
      break;
    }

    case 'whoosh': {
      const now = ctx.currentTime;
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 0.8);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(3500, now + 0.4);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.8);
      filter.Q.setValueAtTime(3, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.9, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterFxGain);
      noise.start(now);
      noise.stop(now + 0.8);
      break;
    }

    case 'impact': {
      const now = ctx.currentTime;
      // Sub boom
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.8);
      oscGain.gain.setValueAtTime(1.0, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(oscGain);
      oscGain.connect(masterFxGain);
      osc.start(now);
      osc.stop(now + 0.8);

      // Noise burst
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 0.8);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.7, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      noise.connect(noiseGain);
      noiseGain.connect(masterFxGain);
      noise.start(now);
      noise.stop(now + 0.5);
      break;
    }

    case 'crowd': {
      const now = ctx.currentTime;
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 1.5);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(1, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.6, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.5, now + 1.0);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterFxGain);
      noise.start(now);
      noise.stop(now + 1.5);
      break;
    }

    case 'applause': {
      const now = ctx.currentTime;
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 1.2);

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.7, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterFxGain);
      noise.start(now);
      noise.stop(now + 1.2);
      break;
    }

    case 'scratch': {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.1);
      osc.frequency.linearRampToValueAtTime(200, now + 0.22);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 0.25);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, now);

      noise.connect(filter);
      filter.connect(gain);
      osc.connect(gain);
      gain.connect(masterFxGain);

      osc.start(now);
      noise.start(now);
      osc.stop(now + 0.25);
      noise.stop(now + 0.25);
      break;
    }

    case 'reverse': {
      const now = ctx.currentTime;
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 0.6);

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3000, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.9, now + 0.55);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterFxGain);
      noise.start(now);
      noise.stop(now + 0.6);
      break;
    }

    case 'dj_drop': {
      // Modern DJ drop melody cascade
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(masterFxGain);
        osc.start(t);
        osc.stop(t + 0.15);
      });
      break;
    }

    case 'record_stop': {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.9);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.9);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterFxGain);
      osc.start(now);
      osc.stop(now + 0.9);
      break;
    }

    case 'vinyl_scratch': {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(1800, now + 0.06);
      osc.frequency.linearRampToValueAtTime(300, now + 0.12);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(masterFxGain);
      osc.start(now);
      osc.stop(now + 0.15);
      break;
    }

    case 'echo_hit': {
      const now = ctx.currentTime;
      // Synthesize punchy hit with delay
      const delay = ctx.createDelay();
      delay.delayTime.setValueAtTime(0.18, now);

      const feedback = ctx.createGain();
      feedback.gain.setValueAtTime(0.5, now);

      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(masterFxGain);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(130.81, now + 0.1);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(masterFxGain);
      gain.connect(delay);

      osc.start(now);
      osc.stop(now + 0.12);
      break;
    }

    default:
      console.warn(`Unknown sound FX: ${effectId}`);
  }
}
