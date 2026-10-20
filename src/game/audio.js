let audioCtx = null;
let buffers = {};
let isMuted = localStorage.getItem("game_muted") === "true"; // Load saved setting
let lastShootTime = 0;

const soundUrls = {
  shoot: "/sounds/shoot.wav",
  hit: "/sounds/hit.wav",
  hurt: "/sounds/hurt.wav",
  gameover: "/sounds/gameover.wav",
};

export function initAudio() {
    if (audioCtx) return;
  // Create the Audio Context
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();

  // Load and decode all sounds into memory
  Object.entries(soundUrls).forEach(([name, url]) => {
    fetch(url)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => audioCtx.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        buffers[name] = audioBuffer;
      })
      .catch((err) => console.error(`Failed to load sound: ${name}`, err));
  });
}

export function toggleMute() {
  isMuted = !isMuted;
  localStorage.setItem("game_muted", isMuted);
  return isMuted;
}

export function getMuteState() {
  return isMuted;
}

export function playSound(name) {
   if (isMuted) return;

  // If the context crashed or was closed, rebuild it
  if (!audioCtx || audioCtx.state === "closed") {
    console.warn("AudioContext crashed or closed. Rebuilding...");
    initAudio(); 
    return; // Skip this sound, let the next one play
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffers[name];

  const gainNode = audioCtx.createGain();
  gainNode.gain.value = name === "gameover" ? 0.6 : 0.3;

  if (name === "shoot") {
    const now = performance.now();
    if (now - lastShootTime < 180) return; // Prevent spam
    lastShootTime = now;
  }

  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // --- CRITICAL FIX: Clean up nodes when the sound finishes ---
  source.onended = () => {
    source.disconnect();
    gainNode.disconnect();
  };

  source.start(audioCtx.currentTime + 0.01);
}