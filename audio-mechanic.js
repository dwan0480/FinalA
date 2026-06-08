// audio-mechanic.js
// Audio mechanic: uploaded audio and live microphone input use the same FFT/amplitude pipeline.
// M toggles microphone input. U uploads an audio file. Space plays/pauses the uploaded file.
// This version keeps the black spectrum lines removed,
// uses medium sensitivity, and makes random bend deformation more visible.

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
let audioStereoLeft = 0;
let audioStereoRight = 0;
let audioStereoPan = 0;
let audioCrack = 0;
let audioCrackTarget = 0;

// Extra internal motion values.
// They are mixed back into level / bass / mid / treble / crack,
// so sketch.js and soup-can.js do not need to change.
let audioBend = 0;
let audioBendTarget = 0;
let audioBendSeed = 17.3;

let lastAudioPulse = 0;
let lastCrackTrigger = 0;
let lastBendTrigger = 0;
let lastAudioLevel = 0;

// soup-can.js reads this global value for beat-like impacts.
let eventPulse = 0;

function setupAudioMechanic() {
  fft = new p5.FFT(0.90, 128);
  amp = new p5.Amplitude(0.93);
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
    fft.analyze();

    const rawLevel = amp.getLevel();
    const rawBass = fft.getEnergy("bass") / 255;
    const rawMid = fft.getEnergy("mid") / 255;
    const rawTreble = fft.getEnergy("treble") / 255;

    // Medium sensitivity:
    // more responsive than the quiet version,
    // but still avoids reacting too much to small background noise.
    const baseLevel = shapeAudioIntensity(thresholdAudioValue(rawLevel, 0.060, 0.300), 1.08, 1.12);
    const baseBass = shapeAudioIntensity(thresholdAudioValue(rawBass, 0.36, 0.98), 1.04, 1.08);
    const baseMid = shapeAudioIntensity(thresholdAudioValue(rawMid, 0.34, 0.98), 0.86, 1.12);
    const baseTreble = shapeAudioIntensity(thresholdAudioValue(rawTreble, 0.46, 1.00), 0.58, 1.24);

    updateAudioStereo(active, baseLevel);

    updateAudioBend(active, baseLevel, baseBass, baseMid, baseTreble);

    // Stronger random bend mixed into the normal audio channels.
    // This makes the can feel more visibly crushed and bent.
    audioLevel = constrain(baseLevel + audioBend * 0.18, 0, 1);
    audioBass = constrain(baseBass + audioBend * 0.38, 0, 1);
    audioMid = constrain(baseMid + audioBend * 0.18, 0, 1);
    audioTreble = constrain(baseTreble + audioBend * 0.06, 0, 1);

    // Keep spectrum empty to avoid the black jagged-line effect.
    audioSpectrum = [];
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
    left: audioStereoLeft,
    right: audioStereoRight,
    pan: audioStereoPan,
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

function shapeAudioIntensity(value, gain, curve) {
  if (value <= 0) {
    return 0;
  }

  return constrain(pow(value, curve) * gain, 0, 1);
}


function updateAudioStereo(active, baseLevel) {
  if (!active) {
    audioStereoLeft = 0;
    audioStereoRight = 0;
    audioStereoPan = 0;
    return;
  }

  // Uploaded stereo audio:
  // read a tiny window from the SoundFile buffer and calculate left/right RMS.
  // This avoids changing the drawing system or adding extra p5 sound nodes.
  if (
    audioSourceMode === "file" &&
    audioFile &&
    audioFile.buffer &&
    audioFile.buffer.numberOfChannels > 1 &&
    typeof audioFile.currentTime === "function"
  ) {
    const buffer = audioFile.buffer;
    const leftData = buffer.getChannelData(0);
    const rightData = buffer.getChannelData(1);

    const sampleRate = buffer.sampleRate || 44100;
    const currentSample = floor(audioFile.currentTime() * sampleRate);
    const windowSize = 900;

    let leftSum = 0;
    let rightSum = 0;
    let count = 0;

    for (let i = 0; i < windowSize; i += 3) {
      const index = constrain(currentSample + i - floor(windowSize * 0.5), 0, leftData.length - 1);

      const l = leftData[index] || 0;
      const r = rightData[index] || 0;

      leftSum += l * l;
      rightSum += r * r;
      count++;
    }

    const leftRms = sqrt(leftSum / max(1, count));
    const rightRms = sqrt(rightSum / max(1, count));

    // Shape channel values so they match the existing visual intensity range.
    audioStereoLeft = shapeAudioIntensity(thresholdAudioValue(leftRms, 0.030, 0.220), 1.10, 0.92);
    audioStereoRight = shapeAudioIntensity(thresholdAudioValue(rightRms, 0.030, 0.220), 1.10, 0.92);

    const stereoSum = audioStereoLeft + audioStereoRight;
    audioStereoPan = stereoSum > 0.001
      ? constrain((audioStereoRight - audioStereoLeft) / stereoSum, -1, 1)
      : 0;
  }

  // Mic or mono file:
  // most browser mic inputs are mono, so left/right should stay balanced.
  else {
    audioStereoLeft = baseLevel;
    audioStereoRight = baseLevel;
    audioStereoPan = 0;
  }
}


function updateAudioBend(active, baseLevel, baseBass, baseMid, baseTreble) {
  if (!active) {
    audioBendTarget = 0;
    audioBend = lerp(audioBend, 0, 0.22);
    return;
  }

  const pressure = constrain(
    baseLevel * 0.48 +
    baseBass * 0.40 +
    baseMid * 0.08 +
    baseTreble * 0.04,
    0,
    1
  );

  // Randomness updates only on stronger moments,
  // not every frame, so it feels like sudden dents instead of messy jitter.
  if (pressure > 0.35 && millis() - lastBendTrigger > 240) {
    lastBendTrigger = millis();

    audioBendSeed += random(2.0, 8.0);
    const randomDent = noise(audioBendSeed, millis() * 0.00028);

    // Stronger bend target than the previous version.
    audioBendTarget = constrain(
      pressure * 0.46 + randomDent * pressure * 0.48,
      0,
      0.62
    );
  } else {
    audioBendTarget *= 0.94;
  }

  // Slightly faster response so the bend is easier to perceive.
  audioBend = lerp(audioBend, audioBendTarget, 0.105);
}

function updateAudioPulse() {
  const active = isAudioSourceActuallyActive();
  const transient = active ? max(0, audioLevel - lastAudioLevel) * 0.60 : 0;

  if (active && millis() - lastAudioPulse > 260) {
    const impact = constrain(
      audioLevel * 0.50 +
      audioBass * 0.40 +
      audioMid * 0.07 +
      audioTreble * 0.06 +
      audioBend * 0.22 +
      transient,
      0,
      1
    );

    if (impact > 0.44) {
      lastAudioPulse = millis();
      eventPulse = max(eventPulse, impact);
    }
  }

  eventPulse *= active ? 0.91 : 0.80;
  lastAudioLevel = active ? audioLevel : 0;
}

function updateAudioCrack() {
  const active = isAudioSourceActuallyActive();
  const transient = active ? max(0, audioLevel - lastAudioLevel) * 0.85 : 0;

  // Crack here means dent / broken deformation intensity.
  // It is still capped to avoid ugly fracture-line overload.
  const pressure = active
    ? constrain(
        audioLevel * 0.38 +
        audioBass * 0.38 +
        audioMid * 0.08 +
        audioTreble * 0.10 +
        audioBend * 0.36 +
        transient,
        0,
        1
      )
    : 0;

  if (pressure > 0.58 && millis() - lastCrackTrigger > 220) {
    lastCrackTrigger = millis();
    audioCrackTarget = constrain((pressure - 0.48) * 0.82, 0, 0.34);
  } else {
    audioCrackTarget *= active ? 0.91 : 0.72;
  }

  audioCrack = lerp(audioCrack, audioCrackTarget, active ? 0.105 : 0.18);
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
  audioStereoLeft = 0;
  audioStereoRight = 0;
  audioStereoPan = 0;
  audioCrack = 0;
  audioCrackTarget = 0;
  audioBend = 0;
  audioBendTarget = 0;
  eventPulse = 0;
  lastAudioLevel = 0;
}

function getAudioSourceMode() {
  return audioSourceMode;
}

function getAudioCrack() {
  return audioCrack || 0;
}
