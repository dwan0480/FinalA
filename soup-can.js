// soup-can.js
// 这个文件专门负责画面视觉。
// 它保留组员代码里更精细的罐头绘制方式：frame、label、金属质感、锈迹、凹痕、开盖等。
// sketch.js 只负责调用这里的 drawFramedCan()。

function drawFramedCan(can, t, level, bass, mid, treble, spectrum) {
  const mxArt = artMouseX();
  const myArt = artMouseY();

  const hover = getInputHover(can);
  const selected = getInputSelected(can);
  const clickShake = getInputShake(can);
  const timePulse = getTimePulse(can);

  const n = noise(can.seed, mechanicsEnabled ? t * 0.7 : 0.7);

  const jump = mechanicsEnabled
    ? (noise(can.seed + 1, t * 8) - 0.5 + eventPulse * 0.3) * (2 + bass * 14) * can.w / 140
    : 0;

  const shake = mechanicsEnabled
    ? sin(t * (10 + treble * 44) + can.phase) * (0.6 + treble * 5 + hover * 4)
    : 0;

  const mx = map(mxArt, 0, ART_W, -1, 1);
  const my = map(myArt, 0, ART_H, -1, 1);

  const inputTiltDirection = can.inputTiltDirection || 1;

  // 原有的旋转 + 我的 hover/selected/click 状态旋转。
  const inputRot = (hover * 2.4 + selected * 1.2 + clickShake * 4) * inputTiltDirection;
  const originalRot = mechanicsEnabled ? (mx * 1.8 + sin(t + can.phase) * 0.6) : 0;
  const rot = radians(originalRot + inputRot);

  push();

  translate(can.x, can.y);
  drawFrame(can);
  drawUserInputStateOutline(can);

  pop();

  push();

  translate(
    can.x + can.w / 2 + jump + shake + clickShake * 4,
    can.y + can.h / 2 + my * hover * 5 - selected * 3
  );

  rotate(rot);

  // hover / selected 会让罐头微微放大。
  scale(1 + hover * 0.045 + selected * 0.035 + clickShake * 0.035 + timePulse * 0.055);

  translate(-can.w / 2, -can.h / 2);

  drawCan(can, t, level, bass, mid, treble, n, hover, spectrum);

  pop();
}

function drawFrame(can) {
  const bw = can.w * 0.055;
  const timeFlash = getTimeFrameFlash();

  noStroke();

  fill(24 + timeFlash * 28, 34 + timeFlash * 22, 38 + timeFlash * 22);
  rect(0, 0, can.w, can.h, 1);

  fill(24 + timeFlash * 42, 44 + timeFlash * 24, 58 + timeFlash * 18);
  rect(bw * 0.35, bw * 0.35, can.w - bw * 0.7, can.h - bw * 0.7, 1);

  fill(25, 18, 18, 28);
  rect(bw * 0.95, bw * 0.95, can.w - bw * 1.4, can.h - bw * 1.4, 1);

  fill(190, 6, 92);
  rect(bw, bw, can.w - bw * 2, can.h - bw * 2, 1);
}

function drawCan(can, t, level, bass, mid, treble, n, hover, spectrum) {
  const pad = can.w * 0.17;
  const x = pad;
  const y = can.h * 0.08;
  const w = can.w - pad * 2;
  const h = can.h * 0.82;

  const timePalette = getTimePalette(can);
  const timeLabelFlash = getTimeLabelFlash(can);
  const redHue = (354 + can.hueOffset + mode * 26 + mid * 32 + timePalette * 115) % 360;
  const paperHue = 36 + can.grain * 10 + treble * 5 + timePalette * 42;
  const lineAmp = 1 + bass * 3 + hover * 1.5;

  const userOpen = getInputOpen(can);
  const timeOpen = getTimeOpen(can);

  // 降低随机开盖，让点击开盖成为主要视觉结果。
  const openAmt = constrain(
    can.lidOpen * 0.12 + userOpen * 0.88 + timeOpen * 0.72 + bass * can.openResponsiveness * 0.28 + hover * 0.08,
    0,
    1
  );

  const crushAmt = constrain(can.crush + level * 1.7 + eventPulse * 0.08, 0, 0.72);
  const rustAmt = constrain(can.rust + n * 0.18 + treble * 0.12, 0, 1);
  const damageAmt = constrain(can.damage + bass * 0.22 + hover * 0.1, 0, 1);

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

  fill(205, 5, 78);

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
  drawLid(can, x, y, w, h, openAmt, rustAmt, treble);

  // 我的 user input 点击结果：倒出液体。
  drawUserInputLiquid(can, x, y, w, h);

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
  text(timeLabelFlash > 0.45 ? "LIMITED TIME" : "CONDENSED", x + w * 0.5, y + h * 0.44);

  fill((redHue + timeLabelFlash * 80) % 360, 65 + timeLabelFlash * 25, 62 + timeLabelFlash * 25);
  textStyle(BOLD);
  textSize(max(6, w * 0.09));
  drawStackedLabel(can.label, x + w * 0.5, y + h * 0.70, w * 0.9, h * 0.2);

  fill(0, 0, 18, 90);
  textSize(max(10, w * 0.17 + bass * 4));
  text("SOUP", x + w * 0.5, y + h * 0.88);

  drawBottomRim(x, y, w, h, crushAmt, rustAmt);

  pop();
}

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

  fill(redHue, 76, 64 + mid * 18);

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

  text("点击：启动音频并上传曲目   1-4：切换配色   R：重置随机种子   空格：播放/暂停", x + 12, y + 10);
  text("音频=音量/频段；时间=事件脉冲；噪声+随机=纹理/跳动；鼠标=悬停震动和倾斜。", x + 12, y + 28);

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
