// audio-mechanic.js
// Audio Source Collection mechanic.
// This file keeps microphone input and uploaded audio in one shared audio pipeline.
// Both sources drive the same FFT / amplitude analysis and the same squeeze + crack visual effect.

let audioFile;
let micInput;
let fft;
let amp;
let audioUpload;

let audioStarted = false;
let audioSourceMode = "off"; // "off", "file", or "mic"
let audioEffectsEnabled = true;
let audioFileLoaded = false;

let audioSpectrum = [];
let audioLevel = 0;
let audioBass = 0;
let audioMid = 0;
let audioTreble = 0;

// Higher values are used by soup-can.js to create can squeeze / crack impact.
let audioCrack = 0;
let audioCrackTarget = 0;
let lastCrackTrigger = 0;

// eventPulse is used by soup-can.js to create beat-like visual hits.
// It stays global so the visual drawing file can still read it directly.
let lastAudioPulse = 0;
let eventPulse = 0;

// HTML controls. These are positioned outside the artwork area by sketch.js.
let audioPanel;
let micButton;
let uploadButton;
let filePlayButton;
let effectButton;
let stopButton;
let audioStatusText;
let audioMeterBars = [];
let audioSourceBadge;

function setupAudioMechanic() {
  fft = new p5.FFT(0.78, 128);
  amp = new p5.Amplitude(0.82);
  micInput = new p5.AudioIn();

  audioUpload = createFileInput(handleAudioFile);
  audioUpload.hide();

  createAudioControlPanel();
  updateAudioControlPanel();
}

function createAudioControlPanel() {
  audioPanel = createDiv();
  audioPanel.id("audio-source-collection-panel");
  audioPanel.style("position", "absolute");
  audioPanel.style("z-index", "20");
  audioPanel.style("box-sizing", "border-box");
  audioPanel.style("padding", "14px 16px");
  audioPanel.style("border", "1px solid rgba(30, 25, 20, 0.18)");
  audioPanel.style("border-radius", "3px");
  audioPanel.style("background", "rgba(247, 241, 229, 0.96)");
  audioPanel.style("box-shadow", "7px 9px 18px rgba(0,0,0,0.17)");
  audioPanel.style("font-family", "Arial, Helvetica, sans-serif");
  audioPanel.style("color", "#201b16");
  audioPanel.style("user-select", "none");

  const titleRow = createDiv();
  titleRow.parent(audioPanel);
  titleRow.style("display", "flex");
  titleRow.style("align-items", "center");
  titleRow.style("justify-content", "space-between");
  titleRow.style("gap", "10px");
  titleRow.style("margin-bottom", "4px");

  const title = createDiv("Audio Source Collection");
  title.parent(titleRow);
  title.style("font-size", "13px");
  title.style("font-weight", "700");
  title.style("letter-spacing", "0.02em");

  audioSourceBadge = createDiv("OFF");
  audioSourceBadge.parent(titleRow);
  audioSourceBadge.style("font-size", "9px");
  audioSourceBadge.style("font-weight", "700");
  audioSourceBadge.style("letter-spacing", "0.08em");
  audioSourceBadge.style("padding", "3px 6px");
  audioSourceBadge.style("border", "1px solid rgba(30,25,20,0.18)");
  audioSourceBadge.style("background", "rgba(255,255,255,0.45)");

  const note = createDiv("Choose one source. Mic and uploaded audio share the same squeeze + crack effect.");
  note.parent(audioPanel);
  note.style("font-size", "10px");
  note.style("line-height", "1.25");
  note.style("opacity", "0.72");
  note.style("margin-bottom", "10px");

  const sourceLabel = createDiv("Source");
  sourceLabel.parent(audioPanel);
  sourceLabel.style("font-size", "9px");
  sourceLabel.style("font-weight", "700");
  sourceLabel.style("letter-spacing", "0.08em");
  sourceLabel.style("text-transform", "uppercase");
  sourceLabel.style("opacity", "0.58");
  sourceLabel.style("margin-bottom", "5px");

  const sourceRow = createDiv();
  sourceRow.parent(audioPanel);
  sourceRow.style("display", "grid");
  sourceRow.style("grid-template-columns", "1fr 1fr");
  sourceRow.style("gap", "7px");
  sourceRow.style("margin-bottom", "8px");

  micButton = makeAudioButton("Live Mic");
  micButton.parent(sourceRow);
  micButton.mousePressed(enableMicrophoneInput);

  uploadButton = makeAudioButton("Upload / U");
  uploadButton.parent(sourceRow);
  uploadButton.mousePressed(openAudioUploadDialog);

  const controlLabel = createDiv("Playback + effect");
  controlLabel.parent(audioPanel);
  controlLabel.style("font-size", "9px");
  controlLabel.style("font-weight", "700");
  controlLabel.style("letter-spacing", "0.08em");
  controlLabel.style("text-transform", "uppercase");
  controlLabel.style("opacity", "0.58");
  controlLabel.style("margin", "7px 0 5px 0");

  const controlRow = createDiv();
  controlRow.parent(audioPanel);
  controlRow.style("display", "grid");
  controlRow.style("grid-template-columns", "1fr 1fr");
  controlRow.style("gap", "7px");
  controlRow.style("margin-bottom", "8px");

  filePlayButton = makeAudioButton("Play File");
  filePlayButton.parent(controlRow);
  filePlayButton.mousePressed(toggleAudioPlayback);

  effectButton = makeAudioButton("Effect On");
  effectButton.parent(controlRow);
  effectButton.mousePressed(toggleAudioEffects);

  stopButton = makeAudioButton("Stop Source");
  stopButton.parent(audioPanel);
  stopButton.style("width", "100%");
  stopButton.style("margin-bottom", "8px");
  stopButton.mousePressed(stopAudioInput);

  const meter = createDiv();
  meter.parent(audioPanel);
  meter.style("display", "grid");
  meter.style("grid-template-columns", "repeat(4, 1fr)");
  meter.style("gap", "5px");
  meter.style("margin", "2px 0 7px 0");

  audioMeterBars = [];
  for (let i = 0; i < 4; i++) {
    const wrap = createDiv();
    wrap.parent(meter);
    wrap.style("height", "6px");
    wrap.style("background", "rgba(30, 25, 20, 0.14)");
    wrap.style("overflow", "hidden");
    wrap.style("border-radius", "8px");

    const bar = createDiv();
    bar.parent(wrap);
    bar.style("height", "100%");
    bar.style("width", "0%");
    bar.style("background", "rgba(45, 35, 25, 0.72)");
    bar.style("border-radius", "8px");
    audioMeterBars.push(bar);
  }

  audioStatusText = createDiv("Source: off | Press U to upload a file");
  audioStatusText.parent(audioPanel);
  audioStatusText.style("font-size", "9.5px");
  audioStatusText.style("opacity", "0.64");
  audioStatusText.style("line-height", "1.2");
}

function makeAudioButton(label) {
  const btn = createButton(label);
  btn.style("font-size", "10px");
  btn.style("padding", "6px 7px");
  btn.style("border", "1px solid rgba(30, 25, 20, 0.22)");
  btn.style("border-radius", "2px");
  btn.style("background", "rgba(255,255,255,0.48)");
  btn.style("color", "#201b16");
  btn.style("cursor", "pointer");
  btn.style("font-family", "Arial, Helvetica, sans-serif");
  return btn;
}

function setButtonActive(btn, active) {
  if (!btn) return;
  btn.style("font-weight", active ? "700" : "400");
  btn.style("background", active ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.48)");
  btn.style("box-shadow", active ? "inset 0 0 0 1px rgba(30,25,20,0.22)" : "none");
}

function updateAudioControlPanelLayout() {
  if (!audioPanel || typeof audioControlLayout === "undefined") {
    return;
  }

  audioPanel.position(audioControlLayout.x, audioControlLayout.y);
  audioPanel.size(audioControlLayout.w, audioControlLayout.h);
}

function startAudioMechanicOnUserGesture() {
  if (!audioStarted) {
    userStartAudio();
    audioStarted = true;
  }
}

function enableMicrophoneInput() {
  startAudioMechanicOnUserGesture();

  if (audioFile && audioFile.isPlaying()) {
    audioFile.pause();
  }

  micInput.start(
    function () {
      audioSourceMode = "mic";
      audioEffectsEnabled = true;
      mechanicsEnabled = true;
      fft.setInput(micInput);
      amp.setInput(micInput);
      updateAudioControlPanel("Source: live microphone");
    },
    function () {
      audioSourceMode = "off";
      updateAudioControlPanel("Microphone permission was not allowed.");
    }
  );
}

function openAudioUploadDialog() {
  startAudioMechanicOnUserGesture();

  if (audioUpload) {
    audioUpload.elt.click();
  }
}

function handleAudioFile(file) {
  if (file.type !== "audio") {
    updateAudioControlPanel("Please choose an audio file.");
    return;
  }

  startAudioMechanicOnUserGesture();

  if (audioFile) {
    audioFile.stop();
  }

  if (audioSourceMode === "mic" && micInput) {
    micInput.stop();
  }

  audioFileLoaded = false;
  updateAudioControlPanel("Loading uploaded audio...");

  audioFile = loadSound(file.data, function () {
    audioFileLoaded = true;
    audioSourceMode = "file";
    audioEffectsEnabled = true;
    mechanicsEnabled = true;
    fft.setInput(audioFile);
    amp.setInput(audioFile);
    audioFile.loop();
    updateAudioControlPanel("Source: uploaded file | playing");
  });
}

function toggleAudioPlayback() {
  startAudioMechanicOnUserGesture();

  if (audioSourceMode === "mic") {
    updateAudioControlPanel("Mic is live. File playback is disabled while mic is selected.");
    return;
  }

  if (!audioFile || !audioFileLoaded) {
    updateAudioControlPanel("No uploaded file yet. Press U or click Upload / U.");
    return;
  }

  audioSourceMode = "file";
  audioEffectsEnabled = true;
  mechanicsEnabled = true;
  fft.setInput(audioFile);
  amp.setInput(audioFile);

  if (audioFile.isPlaying()) {
    audioFile.pause();
    updateAudioControlPanel("Source: uploaded file | paused");
  } else {
    audioFile.loop();
    updateAudioControlPanel("Source: uploaded file | playing");
  }
}

function toggleAudioEffects() {
  audioEffectsEnabled = !audioEffectsEnabled;
  mechanicsEnabled = audioEffectsEnabled && audioSourceMode !== "off";
  updateAudioControlPanel();
}

function stopAudioInput() {
  if (audioFile) {
    audioFile.stop();
  }

  if (micInput) {
    micInput.stop();
  }

  audioSourceMode = "off";
  mechanicsEnabled = false;
  audioLevel = 0;
  audioBass = 0;
  audioMid = 0;
  audioTreble = 0;
  audioCrack = 0;
  audioCrackTarget = 0;
  eventPulse = 0;
  updateAudioControlPanel("Source: off | Press U to upload or choose Live Mic");
}

function updateAudioMechanic() {
  const hasActiveSource = audioSourceMode !== "off";
  const effectsActive = mechanicsEnabled && audioEffectsEnabled && audioStarted && hasActiveSource;

  if (audioStarted && hasActiveSource) {
    audioSpectrum = fft.analyze();
  } else {
    audioSpectrum = [];
  }

  if (effectsActive) {
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
  updateAudioCrack();
  updateAudioControlPanel();

  return {
    level: audioLevel,
    bass: audioBass,
    mid: audioMid,
    treble: audioTreble,
    spectrum: audioSpectrum,
    crack: audioCrack
  };
}

function updateAudioPulse() {
  const active = mechanicsEnabled && audioEffectsEnabled && audioSourceMode !== "off";

  // Loud low frequencies create body movement; sharp high frequencies add impact.
  if (active && millis() - lastAudioPulse > 240) {
    const impact = constrain(audioLevel * 4.2 + audioBass * 0.55 + audioTreble * 0.35, 0, 1);

    if (impact > 0.38) {
      lastAudioPulse = millis();
      eventPulse = max(eventPulse, impact);
    }
  }

  eventPulse *= 0.90;
}

function updateAudioCrack() {
  const active = mechanicsEnabled && audioEffectsEnabled && audioSourceMode !== "off";

  // High volume + high frequency is treated as a sharp pressure hit.
  // This triggers stronger can squeezing and crack lines.
  const pressure = active ? constrain(audioLevel * 5.2 + audioTreble * 0.85 + audioMid * 0.22, 0, 1.35) : 0;

  if (pressure > 0.72 && millis() - lastCrackTrigger > 90) {
    lastCrackTrigger = millis();
    audioCrackTarget = constrain((pressure - 0.48) * 1.25, 0, 1);
  } else {
    audioCrackTarget *= 0.86;
  }

  audioCrack = lerp(audioCrack, audioCrackTarget, 0.24);
}

function updateAudioControlPanel(customStatus) {
  if (!audioPanel) {
    return;
  }

  setButtonActive(micButton, audioSourceMode === "mic");
  setButtonActive(uploadButton, audioSourceMode === "file");

  if (effectButton) {
    effectButton.html(audioEffectsEnabled ? "Effect On" : "Effect Off");
    effectButton.style("background", audioEffectsEnabled ? "rgba(255,255,255,0.58)" : "rgba(160,150,135,0.22)");
  }

  if (filePlayButton) {
    const playLabel = audioFile && audioFile.isPlaying() ? "Pause File" : "Play File";
    filePlayButton.html(playLabel);
    filePlayButton.attribute("title", "Controls the uploaded audio file only. Mic is live when selected.");
  }

  if (audioSourceBadge) {
    const badge = audioSourceMode === "mic" ? "MIC" : audioSourceMode === "file" ? "FILE" : "OFF";
    audioSourceBadge.html(badge);
  }

  const values = [audioLevel * 5, audioBass, audioMid, audioTreble + audioCrack * 0.5];
  for (let i = 0; i < audioMeterBars.length; i++) {
    const pct = floor(constrain(values[i], 0, 1) * 100);
    audioMeterBars[i].style("width", pct + "%");
  }

  if (audioStatusText) {
    let sourceText = customStatus;

    if (!sourceText) {
      if (audioSourceMode === "mic") {
        sourceText = `Live mic → squeeze/crack | crack: ${nf(audioCrack, 1, 2)}`;
      } else if (audioSourceMode === "file") {
        const state = audioFile && audioFile.isPlaying() ? "playing" : "paused";
        sourceText = `Uploaded file → ${state} | crack: ${nf(audioCrack, 1, 2)}`;
      } else {
        sourceText = "Source: off | Press U to upload or choose Live Mic";
      }
    }

    audioStatusText.html(sourceText);
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

function getAudioCrack() {
  return audioCrack || 0;
}
