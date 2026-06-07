// user-input-mechanic.js
// This user input mechanic was revised with ChatGPT assistance.
// 这个文件是我负责的 User Input Mechanic。
// 新机制：罐头是否打开只由 time-based mechanic 管理。
// 用户输入只负责根据罐头当前状态触发不同反应：
// 1. 点击未打开的罐头：摇晃 / 抖动，但不打开。
// 2. 点击 time-based 已经打开的罐头：慢慢倒过来、从罐口流汁、轻微压扁、爆出汁液点。
// 这样不会抢组员的 time-based / audio / Perlin 机制。

let INPUT_IDLE = "idle";
let INPUT_HOVERED = "hovered";
let INPUT_RATTLE = "rattle";
let INPUT_POURING = "pouring";

function setupUserInputStates() {
  // 给每一个 can 添加 user input 需要的状态变量。
  for (let i = 0; i < cans.length; i++) {
    let can = cans[i];

    can.inputState = INPUT_IDLE;

    // 鼠标 hover 状态
    can.inputHoverTarget = 0;
    can.inputHoverAmount = 0;

    // 点击未打开罐头时：摇晃
    can.inputRattleTarget = 0;
    can.inputRattleAmount = 0;

    // 点击已打开罐头时：倒过来
    can.inputFlipTarget = 0;
    can.inputFlipAmount = 0;

    // 点击已打开罐头时：压扁
    can.inputSqueezeTarget = 0;
    can.inputSqueezeAmount = 0;

    // 点击已打开罐头时：流汁
    can.inputJuiceTarget = 0;
    can.inputJuiceAmount = 0;

    // 点击已打开罐头时：爆汁点
    can.inputBurstTarget = 0;
    can.inputBurstAmount = 0;

    // 点击反馈
    can.inputClickPulse = 0;

    // 点击已打开罐头后的动作计时器。
    // 让倒转、流汁、压扁效果保持一段时间。
    can.inputActionTimer = 0;
    can.inputActionDuration = 90;

    // 每个罐头摇晃方向不同，避免全部动作一样。
    can.inputTiltDirection = random([-1, 1]);

    // 爆汁点的位置。
    can.inputBurstDots = [];

    for (let j = 0; j < 8; j++) {
      can.inputBurstDots.push({
        x: random(-1, 1),
        y: random(-1, 1),
        size: random(0.4, 1.2)
      });
    }
  }
}

function updateUserInputStates() {
  let mx = artMouseX();
  let my = artMouseY();

  for (let i = 0; i < cans.length; i++) {
    let can = cans[i];

    let centerX = can.x + can.w / 2;
    let centerY = can.y + can.h / 2;

    let d = dist(mx, my, centerX, centerY);
    let hoverRange = min(can.w, can.h) * 0.58;

    // 鼠标靠近时，进入 hover 状态。
    if (d < hoverRange) {
      let hoverPower = map(d, 0, hoverRange, 1, 0);
      hoverPower = constrain(hoverPower, 0, 1);

      can.inputHoverTarget = hoverPower;

      if (can.inputState === INPUT_IDLE) {
        can.inputState = INPUT_HOVERED;
      }
    } else {
      can.inputHoverTarget = 0;

      if (can.inputState === INPUT_HOVERED) {
        can.inputState = INPUT_IDLE;
      }
    }

    // 用 lerp 做平滑动画。
    // flip 值小一点，所以倒过来的速度会更慢。
    can.inputHoverAmount = lerp(can.inputHoverAmount, can.inputHoverTarget, 0.16);
    can.inputRattleAmount = lerp(can.inputRattleAmount, can.inputRattleTarget, 0.22);
    can.inputFlipAmount = lerp(can.inputFlipAmount, can.inputFlipTarget, 0.055);
    can.inputSqueezeAmount = lerp(can.inputSqueezeAmount, can.inputSqueezeTarget, 0.16);
    can.inputJuiceAmount = lerp(can.inputJuiceAmount, can.inputJuiceTarget, 0.12);
    can.inputBurstAmount = lerp(can.inputBurstAmount, can.inputBurstTarget, 0.14);

    // 点击反馈慢慢消失。
    can.inputClickPulse *= 0.86;

    // 未打开罐头的摇晃动作会自动回落。
    can.inputRattleTarget *= 0.82;

    // 如果正在执行“已打开罐头被点击”的动作，就保持一段时间。
    if (can.inputActionTimer > 0) {
      can.inputActionTimer--;

      can.inputState = INPUT_POURING;

      can.inputFlipTarget = 1;
      can.inputJuiceTarget = 1;
      can.inputBurstTarget = 1;

      // 压扁不是固定值，而是有“挤压—回弹”的变化。
      let squeezeWave = sin(frameCount * 0.22);
      can.inputSqueezeTarget = 0.65 + abs(squeezeWave) * 0.35;
    } else {
      // 动作结束后，效果慢慢消失。
      can.inputFlipTarget *= 0.96;
      can.inputSqueezeTarget *= 0.84;
      can.inputJuiceTarget *= 0.90;
      can.inputBurstTarget *= 0.82;
    }

    // 动画结束后回到 idle 或 hovered。
    if (
      can.inputRattleAmount < 0.03 &&
      can.inputFlipAmount < 0.03 &&
      can.inputJuiceAmount < 0.03 &&
      can.inputSqueezeAmount < 0.03 &&
      can.inputActionTimer <= 0
    ) {
      if (can.inputHoverAmount > 0.05) {
        can.inputState = INPUT_HOVERED;
      } else {
        can.inputState = INPUT_IDLE;
      }
    }
  }
}

function handleUserInputMousePressed() {
  let clickedCan = getCanUnderMouse();

  if (clickedCan !== null) {
    // 点击时只读取 time-based 的开盖状态。
    // user input 不负责打开罐头。
    let isOpen = isCanOpenForUserInput(clickedCan);

    if (isOpen) {
      // 如果 time-based 已经让罐头打开：
      // 触发倒转、流汁、压扁、爆汁。
      clickedCan.inputState = INPUT_POURING;

      clickedCan.inputFlipTarget = 1;
      clickedCan.inputFlipAmount = 0.05;

      clickedCan.inputJuiceTarget = 1;
      clickedCan.inputJuiceAmount = 0.35;

      clickedCan.inputSqueezeTarget = 1;
      clickedCan.inputSqueezeAmount = 0.30;

      clickedCan.inputBurstTarget = 1;
      clickedCan.inputBurstAmount = 0.45;

      clickedCan.inputClickPulse = 1;
      clickedCan.inputActionTimer = clickedCan.inputActionDuration;
    } else {
      // 如果罐头没有打开：
      // 只摇晃，不打开。
      clickedCan.inputState = INPUT_RATTLE;

      clickedCan.inputRattleTarget = 1;
      clickedCan.inputRattleAmount = 1;

      clickedCan.inputClickPulse = 1;
    }
  }
}

function handleUserInputKeyPressed(k) {
  // C = 清除我的 user input 效果。
  // 不会影响 time-based / audio / perlin。
  if (k === "c" || k === "C") {
    clearAllUserInputEffects();
  }
}

function clearAllUserInputEffects() {
  for (let i = 0; i < cans.length; i++) {
    let can = cans[i];

    can.inputState = INPUT_IDLE;

    can.inputRattleTarget = 0;
    can.inputRattleAmount = 0;

    can.inputFlipTarget = 0;
    can.inputFlipAmount = 0;

    can.inputSqueezeTarget = 0;
    can.inputSqueezeAmount = 0;

    can.inputJuiceTarget = 0;
    can.inputJuiceAmount = 0;

    can.inputBurstTarget = 0;
    can.inputBurstAmount = 0;

    can.inputClickPulse = 0;
    can.inputActionTimer = 0;
  }
}

function isCanOpenForUserInput(can) {
  // 罐头是否打开，只读取 time-based mechanic。
  // 这样 mouse hover 和 user input 都不会自己打开罐头。
  let timeOpen = getTimeOpen(can);

  if (timeOpen > 0.35) {
    return true;
  } else {
    return false;
  }
}

function getCanUnderMouse() {
  let mx = artMouseX();
  let my = artMouseY();

  // 从后往前找，避免以后图层重叠时点错。
  for (let i = cans.length - 1; i >= 0; i--) {
    let can = cans[i];

    if (
      mx > can.x &&
      mx < can.x + can.w &&
      my > can.y &&
      my < can.y + can.h
    ) {
      return can;
    }
  }

  return null;
}

// 下面这些 get 函数给 soup-can.js 使用。

function getInputHover(can) {
  return can.inputHoverAmount || 0;
}

function getInputSelected(can) {
  // 新版本不再用 selected 作为主要状态。
  // 但 soup-can.js 仍然会读取这个函数，所以保留它。
  if (can.inputState === INPUT_POURING) {
    return 1;
  }

  return 0;
}

function getInputOpen(can) {
  // user input 不再打开罐头。
  // 开罐状态由 time-based mechanic 管理。
  return 0;
}

function getInputPour(can) {
  return can.inputJuiceAmount || 0;
}

function getInputShake(can) {
  return can.inputClickPulse || 0;
}

function getInputRattle(can) {
  return can.inputRattleAmount || 0;
}

function getInputFlip(can) {
  return can.inputFlipAmount || 0;
}

function getInputSqueeze(can) {
  return can.inputSqueezeAmount || 0;
}

function getInputBurst(can) {
  return can.inputBurstAmount || 0;
}

function drawUserInputStateOutline(can) {
  let hover = getInputHover(can);
  let rattle = getInputRattle(can);
  let pour = getInputPour(can);

  if (hover < 0.02 && rattle < 0.02 && pour < 0.02) {
    return;
  }

  push();

  noFill();

  // 点击未打开罐头：蓝色摇晃边框
  if (rattle > 0.05) {
    stroke(205, 85, 95, 25 + rattle * 55);
    strokeWeight(1 + rattle * 3);
  }

  // 点击已打开罐头：读取 Perlin 颜色的流汁边框
  else if (pour > 0.05) {
    let outlineHue = getPerlinHue(can);
    stroke(outlineHue, 95, 95, 30 + pour * 60);
    strokeWeight(2 + pour * 3);
  }

  // 普通 hover
  else {
    stroke(0, 0, 100, 12 + hover * 30);
    strokeWeight(1 + hover * 2);
  }

  rect(can.w * 0.04, can.h * 0.04, can.w * 0.92, can.h * 0.92, 3);

  pop();
}

function drawUserInputLiquid(can, x, y, w, h) {
  let juice = getInputPour(can);

  if (juice < 0.02) {
    return;
  }

  push();

  noStroke();

  // 汁液颜色读取当前罐头的 Perlin colour。
  // 这样汁液会和当前罐身颜色状态保持一致。
  let liquidHue = getPerlinHue(can);
  let liquidBrightness = getPerlinBrightness(can);

  fill(liquidHue, 90, liquidBrightness, 78);

  // 罐口位置：接近 drawLid() 里的顶部盖子位置。
  let mouthX = x + w * 0.50;
  let mouthY = y + h * 0.10;

  let streamW = w * 0.15;
  let streamH = h * 0.48 * juice;

  // 这里在局部坐标里往上画。
  // 因为罐头被 rotate 倒过来后，视觉上会像从罐口向下流。
  rect(mouthX - streamW / 2, mouthY - streamH, streamW, streamH, 5);

  ellipse(
    mouthX,
    mouthY - streamH,
    streamW * 1.45,
    streamW * 0.75
  );

  // 小液滴
  ellipse(
    mouthX + w * 0.13,
    mouthY - streamH * 0.65,
    streamW * 0.45,
    streamW * 0.45
  );

  ellipse(
    mouthX - w * 0.12,
    mouthY - streamH * 0.88,
    streamW * 0.36,
    streamW * 0.36
  );

  pop();
}

function drawUserInputBurst(can, x, y, w, h) {
  let burst = getInputBurst(can);

  if (burst < 0.03) {
    return;
  }

  push();

  noStroke();

  // 爆汁颜色也读取当前罐子的 Perlin colour。
  let liquidHue = getPerlinHue(can);
  let liquidBrightness = getPerlinBrightness(can);

  fill(liquidHue, 95, liquidBrightness, 65 * burst);

  // 爆汁中心放在罐口附近。
  let cx = x + w * 0.50;
  let cy = y + h * 0.12;

  for (let i = 0; i < can.inputBurstDots.length; i++) {
    let dot = can.inputBurstDots[i];

    let px = cx + dot.x * w * 0.42 * burst;
    let py = cy - dot.y * h * 0.32 * burst;
    let dotSize = w * 0.04 * dot.size * burst;

    ellipse(px, py, dotSize, dotSize);
  }

  pop();
}