// Draws one complete framed can. And reads values from user input, time-based, audio, and Perlin mechanics.
// It keeps the detailed can drawing separate from sketch.js.
// This code was written with help from ChatGPT. And the function uses p5 transformations such as push(), pop(), translate(), radians(),
// rotate(), and scale().
function drawFramedCan(can, t, level, bass, mid, treble, spectrum, crack) {
  const mxArt = artMouseX();
  const myArt = artMouseY();

  const hover = getInputHover(can);
  const selected = getInputSelected(can);
  const clickShake = getInputShake(can);
  const timePulse = getTimePulse(can);

  // Updated ststus of user input.
  const rattle = getInputRattle(can);
  const flip = getInputFlip(can);
  const squeeze = getInputSqueeze(can);

  const n = noise(can.seed, mechanicsEnabled ? t * 0.7 : 0.7);
  const crackImpact = crack || 0;

  const jump = mechanicsEnabled
    ? (noise(can.seed + 1, t * 8) - 0.5 + eventPulse * 0.25 + crackImpact * 0.45) * (1.2 + bass * 10 + crackImpact * 20) * can.w / 140
    : 0;

  const shake = mechanicsEnabled
    ? sin(t * (10 + treble * 36 + crackImpact * 32) + can.phase) * (0.35 + treble * 3.6 + hover * 4 + crackImpact * 8)
    : 0;

  const mx = map(mxArt, 0, ART_W, -1, 1);
  const my = map(myArt, 0, ART_H, -1, 1);

  const inputTiltDirection = can.inputTiltDirection || 1;


  const rattleRot = sin(frameCount * 0.9) * rattle * 15;
  const flipRot = flip * 220;

  const inputRot =
    (hover * 2.4 + selected * 1.2 + clickShake * 4) * inputTiltDirection +
    rattleRot +
    flipRot;

  const originalRot = mechanicsEnabled ? (mx * 1.8 + sin(t + can.phase) * 0.6) : 0;
  const rot = radians(originalRot + inputRot);

  push();

  translate(can.x, can.y);
  drawFrame(can);
  drawUserInputStateOutline(can);

  pop();

  push();

  // Shake
  let rattleX = sin(frameCount * 1.2) * rattle * 8;
  let rattleY = cos(frameCount * 1.4) * rattle * 4;

  translate(
    can.x + can.w / 2 + jump + shake + clickShake * 4 + rattleX,
    can.y + can.h / 2 + my * hover * 5 - selected * 3 + rattleY
  );

  rotate(rot);
  scale(1 + hover * 0.045 + selected * 0.035 + clickShake * 0.035 + timePulse * 0.055 + rattle * 0.025);

  if (squeeze > 0.02) {
    let squeezeWave = abs(sin(frameCount * 0.28));

    let squeezeX = 1 + squeeze * 0.26 + squeezeWave * squeeze * 0.10;
    let squeezeY = 1 - squeeze * 0.18 - squeezeWave * squeeze * 0.10;

    scale(squeezeX, squeezeY);
  }

  // Audio pressure: only strong sound creates visible squeeze.
  // Low volume / low frequency values are thresholded in audio-mechanic.js.
  if (mechanicsEnabled && crackImpact > 0.02) {
    scale(1 - crackImpact * 0.13, 1 + crackImpact * 0.075);
  }

  translate(-can.w / 2, -can.h / 2);

  drawCan(can, t, level, bass, mid, treble, n, hover, spectrum, crackImpact);

  pop();
}

function drawFrame(can) {
  const bw = can.w * 0.055;
  const frameHue = getPerlinHue(can);

  noStroke();

  // Outer frame
  fill(frameHue, 35, 25);
  rect(0, 0, can.w, can.h, 1);

  // Inner frame
  fill(frameHue, 45, 40);
  rect(bw * 0.35, bw * 0.35, can.w - bw * 0.7, can.h - bw * 0.7, 1);

  //Shadow
  fill(frameHue, 30, 15, 25);
  rect(bw * 0.95, bw * 0.95, can.w - bw * 1.4, can.h - bw * 1.4, 1);

  // Wall paper
  fill(frameHue, 8, 96);
  rect(bw, bw, can.w - bw * 2, can.h - bw * 2, 1);
}

function drawCan(can, t, level, bass, mid, treble, n, hover, spectrum, crackImpact) {
  const pad = can.w * 0.17;
  const x = pad;
  const y = can.h * 0.08;
  const w = can.w - pad * 2;
  const h = can.h * 0.82;

  const timePalette = getTimePalette(can);
  const timeLabelFlash = getTimeLabelFlash(can);
  const redHue = getPerlinHue(can);
  const paperHue = 36 + can.grain * 10 + treble * 5;
  const lineAmp = 1 + bass * 3 + hover * 1.5;


  const timeOpen = getTimeOpen(can);
  const openAmt = constrain(timeOpen, 0, 1);

// Read the degree of crushing from the user input and let the can body deform accordingly.
  const inputSqueeze = getInputSqueeze(can);

  const crushAmt = constrain(
    can.crush + level * 0.9 + eventPulse * 0.06 + crackImpact * 0.72 + inputSqueeze * 0.32,
    0,
    0.95
  );

  const rustAmt = constrain(can.rust + n * 0.18 + treble * 0.08, 0, 1);

  const damageAmt = constrain(
    can.damage + bass * 0.12 + hover * 0.1 + crackImpact * 0.75 + inputSqueeze * 0.22,
    0,
    1
  );

  const dent = crushAmt * w * 0.12;
  const waist = mechanicsEnabled ? sin(t * 1.8 + can.phase) * level * w * 0.05 : 0;

  push();

  if (mechanicsEnabled) {
    translate(0, level * sin(t * 20 + can.phase) * 9);
  }

  noStroke();
  fill(0, 0, 0, 22);
  ellipse(can.w * 0.54, can.h * 0.91, w * (0.88 - crushAmt * 0.08), h * 0.08);

  const leftTop = x + dent * 0.35;
  const rightTop = x + w - dent * 0.18;
  const leftMid = x + dent + waist;
  const rightMid = x + w - dent * 0.75 + waist * 0.35;
  const leftBot = x + dent * 0.25;
  const rightBot = x + w - dent * 0.3;

  fill(redHue, 85, getPerlinBrightness(can));

  beginShape();
  vertex(leftTop, y + h * 0.09);
  bezierVertex(x - dent * 0.25, y + h * 0.34, leftMid, y + h * 0.62, leftBot, y + h * 0.92);
  bezierVertex(x + w * 0.32, y + h * 0.99, x + w * 0.68, y + h * 0.99, rightBot, y + h * 0.92);
  bezierVertex(rightMid, y + h * 0.62, x + w + dent * 0.12, y + h * 0.34, rightTop, y + h * 0.09);
  bezierVertex(x + w * 0.68, y + h * 0.16, x + w * 0.32, y + h * 0.16, leftTop, y + h * 0.09);
  endShape(CLOSE);

  drawMetalSheen(can, x, y, w, h, crushAmt, rustAmt);
  drawLabelPaper(can, x, y, w, h, paperHue, redHue, n, mid, crushAmt);
  drawTexture(can, x, y, w, h, redHue, n, level, treble, rustAmt, damageAmt);
  drawAudioLines(x, y, w, h, spectrum, lineAmp);
  drawDents(can, x, y, w, h, crushAmt, damageAmt);
  drawRust(can, x, y, w, h, rustAmt);
  drawCracks(can, x, y, w, h, crackImpact, damageAmt);
  drawLid(can, x, y, w, h, openAmt, rustAmt, treble);

  fill(32, 32, 56 + eventPulse * 24);
  ellipse(
    x + w * 0.5 + waist * 0.2,
    y + h * 0.55,
    w * (0.2 + bass * 0.045),
    w * (0.2 + bass * 0.045)
  );

  fill(0, 0, 96, 94 - timeLabelFlash * 48);
  textAlign(CENTER, CENTER);
  textStyle(ITALIC);
  textSize(max(10, w * 0.18));
  text("Campbell's", x + w * 0.5 + waist * 0.12, y + h * 0.34);

  textStyle(NORMAL);
  textSize(max(5, w * 0.055));
  text("CONDENSED", x + w * 0.5, y + h * 0.44);

  fill(
    getPerlinLabelHue(can),
    75,
    getPerlinLabelBrightness(can)
  );

  textStyle(BOLD);
  textSize(max(6, w * 0.09));
  drawStackedLabel(can.label, x + w * 0.5, y + h * 0.70, w * 0.9, h * 0.2);

  fill(0, 0, 18, 90);
  textSize(max(10, w * 0.17 + bass * 4));
  text("SOUP", x + w * 0.5, y + h * 0.88);

  drawBottomRim(x, y, w, h, crushAmt, rustAmt);


  drawUserInputLiquid(can, x, y, w, h);
  drawUserInputBurst(can, x, y, w, h);

  pop();
}
// Source: https://p5js.org/reference/p5/arc/
function drawBottomRim(x, y, w, h, crushAmt, rustAmt) {
  const cx = x + w / 2;
  const cy = y + h * 0.925;
  const rimW = w * (0.96 - crushAmt * 0.08);
  const rimH = h * 0.105;

  noFill();

  strokeWeight(max(1, w * 0.014));

  stroke(0, 0, 96, 16);
  arc(cx, cy - rimH * 0.08, rimW * 0.82, rimH * 0.58, PI * 1.05, PI * 1.95);

  stroke(0, 0, 16, 72);
  arc(cx, cy, rimW, rimH, 0.06, PI - 0.06);

  stroke(22, 62, 34, rustAmt * 24);
  arc(cx, cy + rimH * 0.03, rimW * 0.9, rimH * 0.78, 0.14, PI * 0.88);
}

function drawMetalSheen(can, x, y, w, h, crushAmt, rustAmt) {
  noFill();

  for (let i = 0; i < 22; i++) {
    const px = x + map(i, 0, 21, w * 0.04, w * 0.96);
    const stripe = noise(can.seed + 10, i * 0.23);

    stroke(205, 4, 92 - stripe * 28 - rustAmt * 10, 10 + stripe * 16);
    strokeWeight(1);

    line(
      px + sin(i) * crushAmt * 4,
      y + h * 0.12,
      px - sin(i * 0.7) * crushAmt * 6,
      y + h * 0.91
    );
  }
}
// https://p5js.org/reference/p5/beginShape/, https://p5js.org/reference/p5/bezierVertex/
function drawLabelPaper(can, x, y, w, h, paperHue, redHue, n, mid, crushAmt) {
  const pinch = crushAmt * w * 0.08;

  noStroke();

  fill(paperHue, 16 + n * 6, 91);

  beginShape();
  vertex(x + pinch * 0.5, y + h * 0.18);
  bezierVertex(x + w * 0.25, y + h * 0.15, x + w * 0.73, y + h * 0.19, x + w - pinch * 0.2, y + h * 0.18);
  vertex(x + w - pinch, y + h * 0.91);
  bezierVertex(x + w * 0.7, y + h * 0.95, x + w * 0.29, y + h * 0.94, x + pinch, y + h * 0.91);
  endShape(CLOSE);

  fill(
    redHue,
    70,
    70 + mid * 12
  );

  beginShape();
  vertex(x + pinch * 0.4, y + h * 0.22);
  bezierVertex(x + w * 0.25, y + h * (0.17 + n * 0.025), x + w * 0.75, y + h * (0.25 - n * 0.02), x + w - pinch * 0.2, y + h * 0.22);
  vertex(x + w - pinch * 0.55, y + h * 0.53);
  bezierVertex(x + w * 0.75, y + h * (0.58 + mid * 0.025), x + w * 0.25, y + h * (0.48 - mid * 0.025), x + pinch * 0.55, y + h * 0.53);
  endShape(CLOSE);
}

function drawTexture(can, x, y, w, h, hueBase, n, level, treble, rustAmt, damageAmt) {
  strokeWeight(1);

  for (let i = 0; i < 28; i++) {
    const yy = y + h * (0.15 + i * 0.029);
    const wave = noise(can.seed + 20, i * 0.34, mechanicsEnabled ? frameCount * 0.006 : 0.25) - 0.5;
    const alpha = 8 + treble * 12 + rustAmt * 8;

    stroke((hueBase + i * 1.4) % 360, 30, 24 + i * 0.55, alpha);
    line(x + wave * 5, yy, x + w - wave * 4, yy + level * 9);
  }

  noStroke();

  for (let i = 0; i < 70; i++) {
    const px = x + noise(can.seed + i * 0.7, 1.1) * w;
    const py = y + noise(can.seed + i * 0.7, 6.4) * h;
    const speck = noise(can.seed + i, frameCount * 0.003);

    fill(36, 18 + rustAmt * 35, 35 + speck * 48, 4 + treble * 5 + damageAmt * 4);
    circle(px, py, 0.7 + speck * 1.8);
  }
}

function drawDents(can, x, y, w, h, crushAmt, damageAmt) {
  noFill();

  for (let i = 0; i < 5; i++) {
    const dy = y + h * (0.28 + noise(can.seed + i, 3) * 0.52);
    const cx = x + w * (0.22 + noise(can.seed + i, 9) * 0.56);
    const dw = w * (0.18 + noise(can.seed + i, 12) * 0.28) * crushAmt;
    const dh = h * (0.025 + damageAmt * 0.035);

    stroke(205, 6, 18, 22 + damageAmt * 28);
    strokeWeight(1);
    arc(cx, dy, dw, dh, PI * 0.05, PI * 0.95);

    stroke(0, 0, 96, 8);
    arc(cx, dy + dh * 0.42, dw * 0.9, dh, PI * 1.08, PI * 1.85);
  }

  stroke(0, 0, 16, 45 * damageAmt);

  for (let i = 0; i < 3; i++) {
    const sx = x + w * noise(can.seed + 40, i);
    const sy = y + h * noise(can.seed + 44, i);

    line(
      sx,
      sy,
      sx + w * (noise(can.seed + 48, i) - 0.5) * 0.22,
      sy + h * (noise(can.seed + 50, i) - 0.5) * 0.14
    );
  }
}

function drawRust(can, x, y, w, h, rustAmt) {
  noStroke();

  for (let i = 0; i < 18; i++) {
    const edgeBias = i % 3 === 0 ? 0.08 : noise(can.seed + 60, i);

    const px = x + w * (i % 2 ? 1 - edgeBias : edgeBias);
    const py = y + h * noise(can.seed + 64, i);
    const r = w * (0.018 + noise(can.seed + 68, i) * 0.055) * rustAmt;

    fill(22 + noise(can.seed + 70, i) * 14, 70, 34, 14 + rustAmt * 42);
    ellipse(px, py, r * 1.5, r);

    fill(11, 80, 20, 10 + rustAmt * 25);
    ellipse(px + r * 0.2, py + r * 0.1, r * 0.6, r * 0.38);
  }
}

function drawCracks(can, x, y, w, h, crackImpact, damageAmt) {
  if (crackImpact < 0.04) {
    return;
  }

  push();
  noFill();

  const crackCount = 2 + floor(crackImpact * 5);

  for (let i = 0; i < crackCount; i++) {
    const startX = x + w * (0.22 + noise(can.seed + 230, i) * 0.56);
    const startY = y + h * (0.25 + noise(can.seed + 240, i) * 0.52);
    const len = w * (0.12 + crackImpact * 0.34 + noise(can.seed + 250, i) * 0.14);
    const angle = -0.9 + noise(can.seed + 260, i) * 1.8;

    stroke(0, 0, 8, 22 + crackImpact * 62 + damageAmt * 14);
    strokeWeight(0.7 + crackImpact * 1.35);

    beginShape();

    for (let j = 0; j < 5; j++) {
      const step = j / 4;
      const jag = (noise(can.seed + i * 13, j * 2.1, frameCount * 0.02) - 0.5) * w * 0.07 * crackImpact;
      const px = startX + cos(angle) * len * step + jag;
      const py = startY + sin(angle) * len * step + (noise(can.seed + 300, i, j) - 0.5) * h * 0.07 * crackImpact;

      vertex(px, py);
    }

    endShape();

    stroke(0, 0, 96, 8 + crackImpact * 18);
    strokeWeight(0.55);
    line(startX + 1.4, startY + 1.2, startX + cos(angle) * len * 0.72 + 1.4, startY + sin(angle) * len * 0.72 + 1.2);
  }

  pop();
}

function drawLid(can, x, y, w, h, openAmt, rustAmt, treble) {
  const cy = y + h * 0.085;

  noStroke();

  fill(0, 0, 10, 20 + openAmt * 45);
  ellipse(x + w / 2, cy + h * 0.012, w * 0.86, h * 0.11);

  fill(205, 4, 70);
  ellipse(x + w / 2, cy, w * 0.94, h * 0.16);

  fill(205, 3, 89);
  ellipse(x + w / 2, cy - h * 0.004, w * 0.78, h * 0.1);

  fill(205, 6, 55);
  ellipse(x + w / 2, cy, w * 0.5, h * 0.052);

  if (openAmt > 0.08) {
    fill(0, 0, 8, 68);
    ellipse(
      x + w / 2,
      cy + h * 0.014,
      w * (0.58 + openAmt * 0.18),
      h * (0.06 + openAmt * 0.035)
    );

    push();

    translate(x + w * 0.5, cy - h * openAmt * 0.15);
    rotate(-0.5 - openAmt * 0.65 + (mechanicsEnabled ? sin(frameCount * 0.05 + can.phase) * treble * 0.04 : 0));

    fill(205, 5, 80 - rustAmt * 16);
    ellipse(w * 0.18, 0, w * 0.55, h * 0.095);

    stroke(0, 0, 15, 35);
    strokeWeight(1);
    line(-w * 0.03, 0, w * 0.35, h * 0.01);

    noStroke();
    fill(22, 65, 35, rustAmt * 35);
    ellipse(w * 0.27, h * 0.005, w * 0.09, h * 0.022);

    pop();
  }
}

function drawAudioLines(x, y, w, h, spectrum, lineAmp) {
  if (!spectrum.length) {
    return;
  }

  noFill();
  stroke(0, 0, 15, 55);
  strokeWeight(1);

  beginShape();

  for (let i = 0; i < 18; i++) {
    const e = spectrum[i * 2] / 255;
    vertex(x + map(i, 0, 17, 0, w), y + h * 0.96 - e * h * 0.12 * lineAmp);
  }

  endShape();
}

// Splits a long soup name into multiple lines.
// Source: https://p5js.org/reference/p5/textWidth/
function drawStackedLabel(label, cx, cy, maxW, maxH) {
  const words = label.split(" ");
  const lines = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;

    if (textWidth(test) < maxW || !line) {
      line = test;
    } else {
      lines.push(line);
      line = word;
    }
  }

  lines.push(line);

  const lh = maxH / max(3, lines.length);

  for (let i = 0; i < lines.length; i++) {
    text(lines[i], cx, cy + (i - (lines.length - 1) / 2) * lh);
  }
}
///This panel explains the keyboard controls and audio/time/input/randomness values.
function drawControls(level, bass, mid, treble) {
  const panelW = min(420, width - 28);
  const x = 14;
  const y = height - 82;

  noStroke();

  fill(0, 0, 8, 72);
  rect(x, y, panelW, 68, 6);

  fill(0, 0, 96);
  textAlign(LEFT, TOP);
  textStyle(NORMAL);
  textSize(12);

  text("Click: start audio / upload track   1-4: palette   R: rebuild   Space: play / pause", x + 12, y + 10);
  text("Audio = level/frequency; Time = events; Noise = colour/texture; Mouse = input reaction.", x + 12, y + 28);

  drawMeter(x + 12, y + 50, panelW - 24, level, bass, mid, treble);
}

function drawMeter(x, y, w, level, bass, mid, treble) {
  const values = [level * 5, bass, mid, treble];
  const hues = [12, 44, 180, 300];

  for (let i = 0; i < 4; i++) {
    fill(hues[i], 80, 88);
    rect(x + i * (w / 4), y, constrain(values[i], 0, 1) * (w / 4 - 8), 8, 2);
  }
}