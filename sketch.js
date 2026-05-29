// sketch.js
// 这个文件是总控制器。
// 它负责：创建画布、创建 32 个罐头数据、更新音频数据、更新 user input 状态、循环调用绘图函数。
// 真正画罐头的细节放在 soup-can.js。
// 我的 user input 状态系统放在 user-input-mechanic.js。

let cans = [];
let font;
let audioFile;
let fft;
let amp;
let audioUpload;
let started = false;
let seedValue = 42;
let mode = 0;
let lastBeat = 0;
let eventPulse = 0;
let showBackdoorHud = false;
let mechanicsEnabled = false;

let artScale = 1;
let artOffsetX = 0;
let artOffsetY = 0;

const ART_W = 1200;
const ART_H = 721;

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

  setupAudio();
  setupHiddenUpload();
  buildGrid();
}

function setupAudio() {
  fft = new p5.FFT(0.82, 64);
  amp = new p5.Amplitude(0.85);
}

function setupHiddenUpload() {
  audioUpload = createFileInput(handleFile);
  audioUpload.hide();
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

        // 原代码里有随机开盖。
        // 后面在 drawCan() 里会降低随机开盖的影响，
        // 让“用户点击开盖”成为更明显的 user input 结果。
        lidOpen: random() < 0.34 ? random(0.35, 0.95) : random(0, 0.12),

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
  setupUserInputStates();
}

function draw() {
  updateArtworkFit();

  const t = millis() * 0.001;
  const spectrum = started ? fft.analyze() : [];

  const level = mechanicsEnabled && started ? amp.getLevel() : 0;
  const bass = mechanicsEnabled && started ? fft.getEnergy("bass") / 255 : 0;
  const mid = mechanicsEnabled && started ? fft.getEnergy("mid") / 255 : 0;
  const treble = mechanicsEnabled && started ? fft.getEnergy("treble") / 255 : 0;

  if (mechanicsEnabled && millis() - lastBeat > 900) {
    lastBeat = millis();
    eventPulse = random(0.35, 1);
  }

  eventPulse *= 0.92;

  background(0, 0, 10);

  push();

  translate(artOffsetX, artOffsetY);
  scale(artScale);

  drawWall();

  // 每一帧更新我的 user input 状态系统。
  updateUserInputStates();

  for (const can of cans) {
    drawFramedCan(can, t, level, bass, mid, treble, spectrum);
  }

  if (showBackdoorHud) {
    drawControls(level, bass, mid, treble);
  }

  pop();

  drawTopInstruction();
}

function updateArtworkFit() {
  artScale = min(width / ART_W, height / ART_H);
  artOffsetX = (width - ART_W * artScale) * 0.5;
  artOffsetY = (height - ART_H * artScale) * 0.5;
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

  noStroke();
  fill(0, 0, 98, 88);
  rect(14, 14, 610, 44, 8);

  fill(0, 0, 15);
  textAlign(LEFT, CENTER);
  textSize(13);
  textStyle(NORMAL);
  text(
    "User Input: hover cans, click to open/pour, C = close all, M = toggle mechanics, 1-4 = palette",
    28,
    36
  );

  pop();
}

function mousePressed() {
  // 保留原来的点击启动音频逻辑。
  if (!started) {
    userStartAudio();
    started = true;
  }

  // 我的 user input 点击逻辑。
  handleUserInputMousePressed();
}

function handleFile(file) {
  if (file.type !== "audio") {
    return;
  }

  if (audioFile) {
    audioFile.stop();
  }

  audioFile = loadSound(file.data, () => {
    audioFile.loop();
    fft.setInput(audioFile);
    amp.setInput(audioFile);
  });
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
    if (audioFile && audioFile.isPlaying()) {
      audioFile.pause();
    } else if (audioFile) {
      audioFile.loop();
    }
  }

  if (key === "u" || key === "U") {
    audioUpload.elt.click();
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