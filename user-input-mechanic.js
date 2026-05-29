// user-input-mechanic.js
// 这是我负责的 user input mechanic。
// 我把它单独放在这个文件里，是为了让项目结构更清楚。
// 我的 mechanic 主要包含三种输入：
// 1. 鼠标移动：靠近罐头时，罐头会放大和轻微旋转
// 2. 鼠标点击：点击罐头时，罐头会打开并倒出液体
// 3. 键盘输入：按 1 / 2 / 3 切换不同 Pop Art 配色，按 R 重置

let userInputCans = [];
let currentPaletteIndex = 0;

let palettes = [
  {
    name: "Classic Red and White",
    canvas: [248, 248, 244],
    red: [198, 22, 44],
    gold: [158, 125, 78],
    labelText: [205, 30, 42],
    liquid: [220, 75, 45]
  },
  {
    name: "Bright Pop Art",
    canvas: [255, 250, 235],
    red: [255, 45, 130],
    gold: [255, 215, 0],
    labelText: [30, 90, 255],
    liquid: [255, 180, 40]
  },
  {
    name: "Comic Book Mode",
    canvas: [245, 248, 255],
    red: [235, 30, 35],
    gold: [255, 230, 80],
    labelText: [25, 25, 25],
    liquid: [70, 190, 255]
  }
];

function setupUserInputMechanic(cansFromSketch) {
  // 这里接收 sketch.js 里面创建好的罐头数组。
  // 我不在这里重新创建罐头，因为所有 mechanic 最好作用在同一批对象上。
  userInputCans = cansFromSketch;
}

function updateUserInputMechanic() {
  for (let i = 0; i < userInputCans.length; i++) {
    let can = userInputCans[i];

    // 计算鼠标和罐头中心点之间的距离。
    let d = dist(mouseX, mouseY, can.x, can.y);

    // 鼠标影响范围。范围越大，越容易触发 hover。
    let hoverRange = can.panelW * 0.72;

    if (d < hoverRange) {
      // 鼠标越靠近，hoverPower 越大。
      let hoverPower = map(d, 0, hoverRange, 1, 0);
      hoverPower = constrain(hoverPower, 0, 1);

      can.hoverTarget = hoverPower;
    } else {
      can.hoverTarget = 0;
    }
  }
}

function handleUserInputMousePressed() {
  for (let i = 0; i < userInputCans.length; i++) {
    let can = userInputCans[i];

    if (can.containsMouse()) {
      // 点击后切换打开状态。
      // 这样再次点击可以关闭，方便测试和展示。
      can.isOpened = !can.isOpened;

      // 点中的瞬间给一个 hover feedback。
      can.hoverTarget = 1;
    }
  }
}

function handleUserInputKeyPressed(pressedKey) {
  if (pressedKey === "1") {
    currentPaletteIndex = 0;
  }

  if (pressedKey === "2") {
    currentPaletteIndex = 1;
  }

  if (pressedKey === "3") {
    currentPaletteIndex = 2;
  }

  if (pressedKey === "r" || pressedKey === "R") {
    resetUserInputMechanic();
  }
}

function resetUserInputMechanic() {
  for (let i = 0; i < userInputCans.length; i++) {
    userInputCans[i].isOpened = false;
    userInputCans[i].openAmount = 0;
    userInputCans[i].liquidAmount = 0;
    userInputCans[i].hoverTarget = 0;
    userInputCans[i].hoverAmount = 0;
  }
}

function getCurrentPalette() {
  return palettes[currentPaletteIndex];
}

function getCurrentPaletteName() {
  return palettes[currentPaletteIndex].name;
}