let audioCtx = null;
let buffers = {};

const soundUrls = {
  shoot: "/sounds/shoot.wav",
  hit: "/sounds/hit.wav",
  hurt: "/sounds/hurt.wav",
  gameover: "/sounds/gameover.wav",
};

export function initAudio() {
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

export function playSound(name) {
  // If audio context isn't ready or the sound hasn't loaded yet, skip
  if (!audioCtx || !buffers[name]) return;

  // Browser autoplay policy: resume context if suspended
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  // Create a source node and play the buffered sound
  const source = audioCtx.createBufferSource();
  source.buffer = buffers[name];
  
  // Adjust volume
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = 0.3; // 30% volume

  // (Optional) Make the shoot sound play slightly faster/higher pitched
  if (name === "shoot") {
    source.playbackRate.value = 1.1; 
  }

  // Connect and play
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  source.start(0); // Start immediately
}