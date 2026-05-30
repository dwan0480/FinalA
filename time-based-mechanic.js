// time-based-mechanic.js
// This code was written with help from ChatGPT. It creates timer-driven events:
// batches of lids open, labels flash, colours pulse, and the grid breathes on a rhythm.

const TIME_EVENT_INTERVAL = 3500;
const TIME_EVENT_DURATION = 1700;
const TIME_EVENT_TYPES = ["open-batch", "palette-flash", "scale-pulse", "label-flicker"];

let timeMechanicStart = 0;
let timeEventIndex = -1;
let timeEventType = TIME_EVENT_TYPES[0];
let timeEventProgress = 0;
let timeEventStrength = 0;

function setupTimeBasedMechanic() {
  timeMechanicStart = millis();
  timeEventIndex = -1;

  for (let i = 0; i < cans.length; i++) {
    const can = cans[i];

    can.timeOpenTarget = 0;
    can.timeOpenAmount = 0;
    can.timePulseAmount = 0;
    can.timePaletteAmount = 0;
    can.timeLabelFlashAmount = 0;

    // Staggered groups make the lids open like a timed factory sequence.
    can.timeBatch = i % 4;
  }
}

function updateTimeBasedMechanic() {
  const elapsed = millis() - timeMechanicStart;
  const nextEventIndex = floor(elapsed / TIME_EVENT_INTERVAL);
  const eventAge = elapsed % TIME_EVENT_INTERVAL;

  if (nextEventIndex !== timeEventIndex) {
    timeEventIndex = nextEventIndex;
    timeEventType = TIME_EVENT_TYPES[timeEventIndex % TIME_EVENT_TYPES.length];
  }

  timeEventProgress = constrain(eventAge / TIME_EVENT_DURATION, 0, 1);

  // millis() gives us a timer in milliseconds. When the current timed event is active,
  // sin() makes the effect rise and fall smoothly instead of switching on/off suddenly.
  if (eventAge < TIME_EVENT_DURATION) {
    timeEventStrength = sin(timeEventProgress * PI);
  } else {
    timeEventStrength = 0;
  }

  for (let i = 0; i < cans.length; i++) {
    updateTimeBasedCan(cans[i]);
  }
}

function updateTimeBasedCan(can) {
  let openTarget = 0;
  let pulseTarget = 0;
  let paletteTarget = 0;
  let labelTarget = 0;

  if (timeEventType === "open-batch") {
    const batchStart = can.timeBatch * 0.16;
    const batchEnd = batchStart + 0.42;
    const inBatch = timeEventProgress >= batchStart && timeEventProgress <= batchEnd;

    if (inBatch) {
      openTarget = 1;
      pulseTarget = timeEventStrength * 0.7;
    }
  } else if (timeEventType === "palette-flash") {
    paletteTarget = timeEventStrength;

    if (timeEventProgress < 0.65 && can.timeBatch === timeEventIndex % 4) {
      openTarget = 0.85;
    }
  } else if (timeEventType === "scale-pulse") {
    pulseTarget = timeEventStrength;

    if (timeEventStrength > 0.55) {
      openTarget = 0.55;
    }
  } else if (timeEventType === "label-flicker") {
    let flicker = timeEventStrength * 0.25;

    if (frameCount % 12 < 6) {
      flicker = timeEventStrength;
    }

    labelTarget = flicker;

    if (can.timeBatch === (timeEventIndex + floor(frameCount / 10)) % 4) {
      openTarget = flicker;
    }
  }

  can.timeOpenTarget = openTarget;
  can.timeOpenAmount = lerp(can.timeOpenAmount, can.timeOpenTarget, 0.13);
  can.timePulseAmount = lerp(can.timePulseAmount, pulseTarget, 0.16);
  can.timePaletteAmount = lerp(can.timePaletteAmount, paletteTarget, 0.12);
  can.timeLabelFlashAmount = lerp(can.timeLabelFlashAmount, labelTarget, 0.22);
}

function getTimeOpen(can) {
  return can.timeOpenAmount || 0;
}

function getTimePulse(can) {
  return can.timePulseAmount || 0;
}

function getTimePalette(can) {
  return can.timePaletteAmount || 0;
}

function getTimeLabelFlash(can) {
  return can.timeLabelFlashAmount || 0;
}

function getTimeFrameFlash() {
  return timeEventStrength || 0;
}
