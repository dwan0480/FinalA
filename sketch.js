// sketch.js
// 这个文件是整个项目的主控制文件。
// 我把画罐头的代码放在 soup-can.js，把我的 user input 机制放在 user-input-mechanic.js。
// 这样结构比较清楚，也符合 final project 要求的 modular code。

let soupCans = [];

// 这里先做 9 个不同口味，形成 3 x 3 的 Warhol-style grid。
// 后面如果小组想扩展成 4 x 4 或更多，只要改这里和 createSoupCanGrid() 就可以。
let soupFlavours = [
  "TOMATO",
  "CHICKEN NOODLE",
  "ONION",
  "GREEN PEA",
  "VEGETABLE",
  "BEEF",
  "CELERY",
  "MUSHROOM",
  "BLACK BEAN"
];

function setup() {
  createCanvas(windowWidth, windowHeight);

  rectMode(CENTER);
  ellipseMode(CENTER);
  textAlign(CENTER, CENTER);

  // 创建 3 x 3 罐头网格
  createSoupCanGrid();

  // 初始化我的 user input mechanic
  setupUserInputMechanic(soupCans);
}

function draw() {
  drawBackground();

  drawHeader();

  // 先更新我的 user input 状态，比如鼠标靠近、点击、键盘换色
  updateUserInputMechanic();

  // 之后组员可以在这里接入他们自己的 mechanic：
  // updateAudioMechanic();
  // updateTimeMechanic();
  // updatePerlinRandomMechanic();

  // 画所有罐头
  for (let i = 0; i < soupCans.length; i++) {
    soupCans[i].update();
    soupCans[i].display();
  }

  drawFooterInstructions();
}

function createSoupCanGrid() {
  soupCans = [];

  let cols = 3;
  let rows = 3;

  // 顶部留给标题，底部留给操作说明
  let topSpace = 105;
  let bottomSpace = 65;

  let usableHeight = height - topSpace - bottomSpace;

  let cellW = width / cols;
  let cellH = usableHeight / rows;

  // panel 是每个罐头后面的“画布框”
  // 这里根据窗口大小自动计算，避免画面太挤
  let panelW = min(cellW * 0.58, cellH * 0.78);
  let panelH = panelW * 1.15;

  let canW = panelW * 0.50;
  let canH = panelH * 0.70;

  let index = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let x = cellW * col + cellW / 2;
      let y = topSpace + cellH * row + cellH / 2;

      let flavour = soupFlavours[index];

      let newCan = new SoupCan(x, y, panelW, panelH, canW, canH, flavour);
      soupCans.push(newCan);

      index++;
    }
  }
}

function drawBackground() {
  background(242, 239, 232);

  // 这里画一些非常淡的 Pop Art dot texture，让背景不那么空。
  // 这不是复杂算法，只是两个 for loop。
  noStroke();

  for (let x = 20; x < width; x += 36) {
    for (let y = 20; y < height; y += 36) {
      fill(220, 30);
      ellipse(x, y, 4, 4);
    }
  }
}

function drawHeader() {
  push();

  noStroke();

  fill(25);
  textSize(26);
  textStyle(BOLD);
  text("Interactive Soup Can Grid", width / 2, 34);

  fill(80);
  textSize(13);
  textStyle(NORMAL);
  text("User Input Mechanic: hover, click, and keyboard colour modes", width / 2, 62);

  // 当前配色模式显示出来，方便演示时说明
  fill(120);
  textSize(12);
  text("Current palette: " + getCurrentPaletteName(), width / 2, 84);

  pop();
}

function drawFooterInstructions() {
  push();

  noStroke();
  fill(40);
  textSize(13);

  let instructionText = "Move mouse near a can = focus effect  |  Click a can = open and pour  |  Press 1 / 2 / 3 = change palette  |  Press R = reset";
  text(instructionText, width / 2, height - 28);

  pop();
}

function mousePressed() {
  // 鼠标点击交给 user-input-mechanic.js 处理。
  handleUserInputMousePressed();
}

function keyPressed() {
  // 键盘输入也交给 user-input-mechanic.js 处理。
  handleUserInputKeyPressed(key);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // 窗口变化后重新排版，保证 responsive。
  createSoupCanGrid();

  // 因为罐头重新创建了，所以也要重新交给 user input mechanic。
  setupUserInputMechanic(soupCans);
}