// sketch.js
// 这个文件是总控制器。
// 它负责：创建画布、创建 32 个罐头数据、更新各个 mechanic 状态、循环调用绘图函数。
// 真正画罐头的细节放在 soup-can.js。
// Time-based mechanic 放在 time-based-mechanic.js。
// Audio mechanic 放在 audio-mechanic.js。
// 我的 user input 状态系统放在 user-input-mechanic.js。

let cans = [];
let font;
let seedValue = 42;
let mode = 0;
let showBackdoorHud = false;
let mechanicsEnabled = true;

let artScale = 1;
let artOffsetX = 0;
let artOffsetY = 0;

const ART_W = 1200;
const ART_H = 721;

// Museum-style interaction label.
// updateArtworkFit() reserves space for this panel so it does not cover the artwork.
let labelLayout = {
  x: 0,
  y: 0,
  w: 360,
  h: 238,
  mode: "side"
};

const soupNames = [
  "CLAM CHOWDER", "CHICKEN NOODLE", "CREAM OF VEGETABLE", "ONION",
  "GREEN PEA", "SCOTCH BROTH", "VEGETABLE", "SPLIT PEA",
  "VEGETABLE BEEF", "BEAN WITH BACON", "CHEDDAR CHEESE", "TOMATO RICE",
  "BEEF", "ASPARAGUS", "CREAM OF CELERY", "BLACK BEAN",
  "TURKEY NOODLE", "BEEF BROTH", "CHICKEN GUMBO", "TURKEY VEGETABLE",
  "CHILI BEEF", "VEGETABLE BEAN", "CREAM OF CHICKEN", "CREAM OF MUSHROOM",
  "PEPPER POT", "CHICKEN", "CONSOMME", "TOMATO",
  "MINESTRONE", "CHICKEN VEGETABLE", "BEEF NOODLE", "VEGETARIAN VEGETABLE"
];

function setup() {
  const cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent("sketch-holder");

  pixelDensity(min(2, window.devicePixelRatio || 1));
  textFont("Arial");

  // 组员原代码使用 HSB，这里保留。
  colorMode(HSB, 360, 100, 100, 100);

  setupAudioMechanic();
  buildGrid();
}

function buildGrid() {
  randomSeed(seedValue);
  noiseSeed(seedValue);

  cans = [];

  const cols = 8;
  const rows = 4;

  const marginX = ART_W * 0.03;
  const marginY = ART_H * 0.035;
  const gapX = ART_W * 0.015;
  const gapY = ART_H * 0.035;

  const cellW = (ART_W - marginX * 2 - gapX * (cols - 1)) / cols;
  const cellH = (ART_H - marginY * 2 - gapY * (rows - 1)) / rows;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;

      cans.push({
        i: i,
        x: marginX + x * (cellW + gapX),
        y: marginY + y * (cellH + gapY),
        w: cellW,
        h: cellH,
        label: soupNames[i],

        hueOffset: random(-18, 18),
        wobble: random(0.6, 1.7),
        grain: random(0.15, 0.85),

        // 罐头是否打开只由 time-based mechanic 管理。
        // 所以这里不再随机开盖，避免一开始就有罐头被打开。
        lidOpen: 0,

        crush: random(0.03, 0.42),
        rust: random(0.08, 0.86),
        damage: random(0.02, 0.68),
        openResponsiveness: random(0.15, 0.75),
        phase: random(TWO_PI),
        seed: random(1000)
      });
    }
  }

  // 给每一个 can 加上我的 user input 状态。
  setupTimeBasedMechanic();
  setupUserInputStates();
}

function draw() {
  updateArtworkFit();

  const t = millis() * 0.001;
  const audio = updateAudioMechanic();

  background(0, 0, 10);

  push();

  translate(artOffsetX, artOffsetY);
  scale(artScale);

  drawWall();

  // 每一帧更新我的 user input 状态系统。
  updateTimeBasedMechanic();
  updateUserInputStates();

  for (let i = 0; i < cans.length; i++) {
    drawFramedCan(cans[i], t, audio.level, audio.bass, audio.mid, audio.treble, audio.spectrum, audio.crack);
  }

  if (showBackdoorHud) {
    drawControls(audio.level, audio.bass, audio.mid, audio.treble);
  }

  pop();

  drawTopInstruction();
}

function updateArtworkFit() {
  const margin = 26;

  // Wide screen: reserve a right-side museum label zone.
  // The soup-can grid is fitted only into the remaining left area,
  // so the label never covers the artwork.
  if (width > 980) {
    labelLayout.mode = "side";
    labelLayout.w = constrain(width * 0.25, 320, 400);
    labelLayout.h = 238;
    labelLayout.x = width - labelLayout.w - margin;
    labelLayout.y = height - labelLayout.h - margin;

    const availableW = max(260, labelLayout.x - margin * 2);
    const availableH = max(190, height - margin * 2);

    artScale = min(availableW / ART_W, availableH / ART_H);
    artOffsetX = margin + (availableW - ART_W * artScale) * 0.5;
    artOffsetY = margin + (availableH - ART_H * artScale) * 0.5;
  }

  // Narrow screen: place the label below the artwork.
  // The soup-can grid is fitted into the area above the label.
  else {
    labelLayout.mode = "bottom";
    labelLayout.w = min(width - margin * 2, 560);
    labelLayout.h = 230;
    labelLayout.x = (width - labelLayout.w) * 0.5;
    labelLayout.y = height - labelLayout.h - margin;

    const availableW = max(260, width - margin * 2);
    const availableH = max(170, labelLayout.y - margin * 2);

    artScale = min(availableW / ART_W, availableH / ART_H);
    artOffsetX = margin + (availableW - ART_W * artScale) * 0.5;
    artOffsetY = margin + (availableH - ART_H * artScale) * 0.5;
  }

  // Safety for very small browser windows.
  artScale = max(0.10, artScale);
}

function artMouseX() {
  return (mouseX - artOffsetX) / artScale;
}

function artMouseY() {
  return (mouseY - artOffsetY) / artScale;
}

function drawWall() {
  noStroke();

  fill(28, 8, 96);
  rect(0, 0, ART_W, ART_H);

  // 简单墙面横纹。
  for (let i = 0; i < 70; i++) {
    const y = (i * 37) % ART_H;

    fill(35, 5, 88, 8);
    rect(0, y, ART_W, 2);
  }
}

function drawTopInstruction() {
  push();

  const x = labelLayout.x;
  const y = labelLayout.y;
  const panelW = labelLayout.w;
  const panelH = labelLayout.h;

  rectMode(CORNER);
  textAlign(LEFT, TOP);
  textStyle(NORMAL);
  noStroke();

  // Soft shadow.
  fill(0, 0, 0, 24);
  rect(x + 7, y + 9, panelW, panelH, 2);

  // Warm paper card.
  fill(42, 12, 96, 96);
  rect(x, y, panelW, panelH, 2);

  // Paper fibres.
  for (let i = 0; i < 130; i++) {
    const px = x + 10 + noise(i * 0.71, 1.3) * (panelW - 20);
    const py = y + 10 + noise(i * 0.37, 8.9) * (panelH - 20);
    const lineLen = noise(i * 0.19, 4.2) * 18 + 4;

    stroke(35, 10, 35, 6);
    strokeWeight(0.45);
    line(px, py, px + lineLen, py + noise(i * 0.23) * 2 - 1);
  }

  // Small paper speckles.
  for (let i = 0; i < 90; i++) {
    const px = x + noise(i * 1.91, 12.4) * panelW;
    const py = y + noise(i * 1.17, 23.6) * panelH;

    noStroke();
    fill(0, 0, 20, 5);
    circle(px, py, 1.1);
  }

  // Thin border and divider.
  noFill();
  stroke(0, 0, 18, 18);
  strokeWeight(1);
  rect(x, y, panelW, panelH, 2);
  line(x + 18, y + 63, x + panelW - 18, y + 63);

  noStroke();

  // Title.
  fill(0, 0, 10, 94);
  textStyle(BOLD);
  textSize(14);
  text("Interactive Soup Cans", x + 18, y + 18);

  // Artwork reference.
  textStyle(NORMAL);
  textSize(10.5);
  fill(0, 0, 22, 72);
  text("After Andy Warhol’s Campbell’s Soup Cans", x + 18, y + 40);

  // Description.
  fill(0, 0, 14, 88);
  textSize(10.5);
  textLeading(15);

  const description =
    "A coded reinterpretation of the repeated soup-can image. " +
    "Each can responds through time, mouse input, audio and controlled randomness.";

  text(description, x + 18, y + 78, panelW - 36, 46);

  // Interaction heading.
  fill(0, 0, 10, 92);
  textStyle(BOLD);
  textSize(10.5);
  text("How to interact", x + 18, y + 126);

  // Interaction instructions.
  textStyle(NORMAL);
  fill(0, 0, 16, 86);
  textSize(10);
  textLeading(14);

  const sourceMode = typeof getAudioSourceMode === "function" ? getAudioSourceMode() : "off";
  const instructions =
    "Move mouse: inspect cans\n" +
    "Click closed can: rattle / shake\n" +
    "Click opened can: flip / pour / burst\n" + +
    "M: microphone on / off   U: upload audio\n" +
    "Space: play / pause uploaded audio\n" +
    "C: close all   1–4: palette   R: rebuild\n" +
    "Audio source: " + sourceMode;

  text(instructions, x + 18, y + 145, panelW - 36, panelH - 152);

  // Bottom metadata line.
  textAlign(RIGHT, BOTTOM);
  textSize(9);
  fill(0, 0, 32, 56);
  text("time · input · audio · randomness", x + panelW - 18, y + panelH - 12);

  pop();
}

function mousePressed() {
  // 浏览器需要用户手势才能启动 Web Audio。
  startAudioMechanicOnUserGesture();

  // 我的 user input 点击逻辑。
  handleUserInputMousePressed();
}

function keyPressed() {
  if (key >= "1" && key <= "4") {
    mode = int(key) - 1;
  }

  if (key === "r" || key === "R") {
    seedValue = floor(random(100000));
    buildGrid();
  }

  if (key === " ") {
    toggleAudioPlayback();
  }

  if (key === "u" || key === "U") {
    openAudioUploadDialog();
  }

  // M 现在只负责开关麦克风实时输入，不再开关全部 mechanic。
  if (key === "m" || key === "M") {
    toggleMicrophoneInput();
  }

  if (key === "h" || key === "H") {
    showBackdoorHud = !showBackdoorHud;
  }

  // 我的 user input 键盘逻辑。
  handleUserInputKeyPressed(key);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buildGrid();
}
