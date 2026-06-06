// audio-mechanic.js
// Audio mechanic: uploaded audio and live microphone input use the same FFT/amplitude pipeline.
// M toggles microphone input. U uploads an audio file. Space plays/pauses the uploaded file.
// Low-volume / low-frequency sounds are thresholded so they do not create strong visual effects.

let audioFile;
let micInput;
let fft;
let amp;
let audioUpload;

let audioStarted = false;
let audioSourceMode = "off"; // "off", "file", or "mic"

let audioSpectrum = [];
let audioLevel = 0;
let audioBass = 0;
let audioMid = 0;
let audioTreble = 0;
let audioCrack = 0;
let audioCrackTarget = 0;

let lastAudioPulse = 0;
let lastCrackTrigger = 0;

// soup-can.js reads this global value for beat-like impacts.
let eventPulse = 0;

function setupAudioMechanic() {
  fft = new p5.FFT(0.82, 128);
  amp = new p5.Amplitude(0.86);
  micInput = new p5.AudioIn();

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
  const active = isAudioSourceActuallyActive();

  if (active) {
    const rawSpectrum = fft.analyze();

    const rawLevel = amp.getLevel();
    const rawBass = fft.getEnergy("bass") / 255;
    const rawMid = fft.getEnergy("mid") / 255;
    const rawTreble = fft.getEnergy("treble") / 255;

    // Thresholds make quiet background sound much less obvious.
    // Only clearer sound energy becomes visible in the cans.
    audioLevel = thresholdAudioValue(rawLevel, 0.055, 0.26);
    audioBass = thresholdAudioValue(rawBass, 0.34, 0.94);
    audioMid = thresholdAudioValue(rawMid, 0.30, 0.92);
    audioTreble = thresholdAudioValue(rawTreble, 0.36, 0.94);

    // Keep the audio-line drawing quiet when the sound is quiet.
    // This prevents small room noise or low rumble from creating visible lines.
    if (audioLevel <= 0.001 && audioBass <= 0.001 && audioMid <= 0.001 && audioTreble <= 0.001) {
      audioSpectrum = [];
    } else {
      audioSpectrum = rawSpectrum.map(function (value) {
        return thresholdAudioValue(value / 255, 0.18, 0.92) * 255;
      });
    }
  } else {
    resetAudioValues();
  }

  updateAudioPulse();
  updateAudioCrack();

  return {
    level: audioLevel,
    bass: audioBass,
    mid: audioMid,
    treble: audioTreble,
    spectrum: audioSpectrum,
    crack: audioCrack
  };
}

function isAudioSourceActuallyActive() {
  if (!audioStarted || audioSourceMode === "off") {
    return false;
  }

  if (audioSourceMode === "file") {
    return audioFile && audioFile.isPlaying();
  }

  if (audioSourceMode === "mic") {
    return true;
  }

  return false;
}

function thresholdAudioValue(value, floorValue, ceilingValue) {
  if (value < floorValue) {
    return 0;
  }

  const mapped = map(value, floorValue, ceilingValue, 0, 1);
  return constrain(mapped, 0, 1);
}

function updateAudioPulse() {
  const active = isAudioSourceActuallyActive();

  if (active && millis() - lastAudioPulse > 220) {
    // Require both enough volume and frequency energy before making a visible hit.
    const impact = constrain(audioLevel * 0.65 + audioBass * 0.22 + audioTreble * 0.42, 0, 1);

    if (impact > 0.38) {
      lastAudioPulse = millis();
      eventPulse = max(eventPulse, impact);
    }
  }

  eventPulse *= 0.88;
}

function updateAudioCrack() {
  const active = isAudioSourceActuallyActive();

  // Crack/squeeze is intentionally stricter than normal audio movement.
  // It mainly appears when the sound is loud AND contains high-frequency energy.
  const pressure = active
    ? constrain(audioLevel * 0.62 + audioTreble * 0.86 + audioMid * 0.10, 0, 1.2)
    : 0;

  if (pressure > 0.72 && millis() - lastCrackTrigger > 90) {
    lastCrackTrigger = millis();
    audioCrackTarget = constrain((pressure - 0.64) * 2.0, 0, 1);
  } else {
    audioCrackTarget *= 0.82;
  }

  audioCrack = lerp(audioCrack, audioCrackTarget, 0.22);
}

function handleAudioFile(file) {
  if (file.type !== "audio") {
    return;
  }

  startAudioMechanicOnUserGesture();

  if (audioFile) {
    audioFile.stop();
  }

  if (audioSourceMode === "mic") {
    micInput.stop();
  }

  audioFile = loadSound(file.data, function () {
    audioSourceMode = "file";
    audioFile.loop();
    fft.setInput(audioFile);
    amp.setInput(audioFile);
  });
}

function toggleAudioPlayback() {
  startAudioMechanicOnUserGesture();

  if (!audioFile) {
    return;
  }

  if (audioSourceMode === "mic") {
    micInput.stop();
  }

  audioSourceMode = "file";
  fft.setInput(audioFile);
  amp.setInput(audioFile);

  if (audioFile.isPlaying()) {
    audioFile.pause();
  } else {
    audioFile.loop();
  }
}

function openAudioUploadDialog() {
  startAudioMechanicOnUserGesture();

  if (audioUpload) {
    audioUpload.elt.click();
  }
}

function toggleMicrophoneInput() {
  startAudioMechanicOnUserGesture();

  if (audioSourceMode === "mic") {
    micInput.stop();
    audioSourceMode = "off";
    resetAudioValues();
    return;
  }

  if (audioFile && audioFile.isPlaying()) {
    audioFile.pause();
  }

  micInput.start(
    function () {
      audioSourceMode = "mic";
      fft.setInput(micInput);
      amp.setInput(micInput);
    },
    function () {
      audioSourceMode = "off";
      resetAudioValues();
    }
  );
}

function resetAudioValues() {
  audioSpectrum = [];
  audioLevel = 0;
  audioBass = 0;
  audioMid = 0;
  audioTreble = 0;
  audioCrack = 0;
  audioCrackTarget = 0;
  eventPulse = 0;
}

function getAudioSourceMode() {
  return audioSourceMode;
}

function getAudioCrack() {
  return audioCrack || 0;
}
