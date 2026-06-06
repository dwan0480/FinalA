// audio-mechanic.js
// This file contains the Audio mechanic.
// It keeps all p5.sound setup, file upload, playback control, FFT analysis,
// amplitude analysis, and audio-driven pulse values outside sketch.js.

let audioFile;
let fft;
let amp;
let audioUpload;
let audioStarted = false;

let audioSpectrum = [];
let audioLevel = 0;
let audioBass = 0;
let audioMid = 0;
let audioTreble = 0;

// eventPulse is used by soup-can.js to create beat-like visual hits.
// It stays global so the visual drawing file can still read it directly.
let lastAudioPulse = 0;
let eventPulse = 0;

function setupAudioMechanic() {
  fft = new p5.FFT(0.82, 64);
  amp = new p5.Amplitude(0.85);

  audioUpload = createFileInput(handleAudioFile);
  audioUpload.hide();
}

function startAudioMechanicOnUserGesture() {
  if (!audioStarted) {
    userStartAudio();
    audioStarted = true;
  }
}

function updateAudioMechanic() {
  if (audioStarted) {
    audioSpectrum = fft.analyze();
  } else {
    audioSpectrum = [];
  }

  if (mechanicsEnabled && audioStarted) {
    audioLevel = amp.getLevel();
    audioBass = fft.getEnergy("bass") / 255;
    audioMid = fft.getEnergy("mid") / 255;
    audioTreble = fft.getEnergy("treble") / 255;
  } else {
    audioLevel = 0;
    audioBass = 0;
    audioMid = 0;
    audioTreble = 0;
  }

  updateAudioPulse();

  return {
    level: audioLevel,
    bass: audioBass,
    mid: audioMid,
    treble: audioTreble,
    spectrum: audioSpectrum
  };
}

function updateAudioPulse() {
  if (mechanicsEnabled && millis() - lastAudioPulse > 900) {
    lastAudioPulse = millis();
    eventPulse = random(0.35, 1);
  }

  eventPulse *= 0.92;
}

function handleAudioFile(file) {
  if (file.type !== "audio") {
    return;
  }

  if (audioFile) {
    audioFile.stop();
  }

  audioFile = loadSound(file.data, function () {
    audioFile.loop();
    fft.setInput(audioFile);
    amp.setInput(audioFile);
  });
}

function toggleAudioPlayback() {
  if (audioFile && audioFile.isPlaying()) {
    audioFile.pause();
  } else if (audioFile) {
    audioFile.loop();
  }
}

function openAudioUploadDialog() {
  if (audioUpload) {
    audioUpload.elt.click();
  }
}

function getAudioLevel() {
  return audioLevel || 0;
}

function getAudioBass() {
  return audioBass || 0;
}

function getAudioMid() {
  return audioMid || 0;
}

function getAudioTreble() {
  return audioTreble || 0;
}

function getAudioSpectrum() {
  return audioSpectrum || [];
}
