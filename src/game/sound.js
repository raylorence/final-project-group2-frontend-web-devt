let audioCtx = null;
let isMuted = localStorage.getItem("game_muted") === "true";

// Initialize the audio context
export function initAudio() {
  if (audioCtx) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();
}

// Unlock audio on first user interaction (browser requirement)
export function unlockAudio() {
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

export function toggleMute() {
  isMuted = !isMuted;
  localStorage.setItem("game_muted", isMuted);
  return isMuted;
}

export function getMuteState() {
  return isMuted;
}

// --- SYNTHESIZER HELPERS ---
function playOsc(type, freqStart, freqEnd, duration, volume) {
  if (!audioCtx || isMuted) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, audioCtx.currentTime);
  if (freqEnd !== freqStart) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, audioCtx.currentTime + duration);
  }

  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playNoise(duration, volume, filterFreq) {
  if (!audioCtx || isMuted) return;
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = filterFreq;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  noise.start();
}

// --- SOUND TRIGGERS ---

export function playShoot() {
  const randomFreq = 680 + (Math.random() * 80 - 40);
  playOsc("triangle", randomFreq, 180, 0.07, 0.15);
}

export function playHit() {
  playNoise(0.04, 0.1, 800);
  playOsc("sine", 140, 140, 0.04, 0.1);
}

export function playKill(type) {
  if (type === "fast") {
    playOsc("sine", 800, 400, 0.1, 0.2); 
  } else if (type === "tank") {
    playOsc("sawtooth", 200, 40, 0.2, 0.3); 
    playNoise(0.15, 0.2, 400);
  } else if (type === "splitter") {
    playOsc("sine", 600, 300, 0.08, 0.15);
    setTimeout(() => playOsc("sine", 700, 350, 0.08, 0.15), 60); 
  }
}

export function playHurt() {
  playOsc("sawtooth", 150, 40, 0.25, 0.3); 
  playNoise(0.2, 0.2, 1000);
}

export function playGameOver() {
  if (!audioCtx || isMuted) return;
  
  // Clinical flatline
  playOsc("sine", 1000, 1000, 0.8, 0.15); 
  
  // Dark descending drone
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(220, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(55, audioCtx.currentTime + 1.5);
  
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 1.5);
}

let lastHeartbeat = 0;
export function playHeartbeat(elapsed) {
  if (!audioCtx || isMuted) return;
  
  // Repeat every 800ms
  if (elapsed - lastHeartbeat < 800) return;
  lastHeartbeat = elapsed;

  // "Lub" (High thump)
  playOsc("triangle", 140, 140, 0.12, 0.6);
  
  // "Dub" (Lower thump, slightly delayed)
  setTimeout(() => {
    playOsc("triangle", 110, 110, 0.15, 0.5);
  }, 180); 
}