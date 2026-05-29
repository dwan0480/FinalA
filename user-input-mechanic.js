// user-input-mechanic.js
// 这是我负责的 User Input Mechanic。
// 我没有重新画罐头，而是在组员的高质量视觉上加入一层“用户输入状态系统”。
// 状态大概是：idle → hovered → selected/opening → opened/pouring。

let INPUT_IDLE = "idle";
let INPUT_HOVERED = "hovered";
let INPUT_SELECTED = "selected";
let INPUT_OPENED = "opened";

function setupUserInputStates() {
  for (let i = 0; i < cans.length; i++) {
    cans[i].inputState = INPUT_IDLE;

    cans[i].inputHoverTarget = 0;
    cans[i].inputHoverAmount = 0;

    cans[i].inputSelected = false;
    cans[i].inputSelectedAmount = 0;

    cans[i].inputOpenTarget = 0;
    cans[i].inputOpenAmount = 0;

    cans[i].inputPourTarget = 0;
    cans[i].inputPourAmount = 0;

    cans[i].inputClickPulse = 0;

    // 每个罐头倾斜方向稍微不同，避免所有罐头动作完全一样。
    cans[i].inputTiltDirection = random([-1, 1]);
  }
}

function updateUserInputStates() {
  const mx = artMouseX();
  const my = artMouseY();

  for (let i = 0; i < cans.length; i++) {
    let can = cans[i];

    let centerX = can.x + can.w / 2;
    let centerY = can.y + can.h / 2;

    let d = dist(mx, my, centerX, centerY);
    let hoverRange = min(can.w, can.h) * 0.58;

    if (d < hoverRange) {
      let hoverPower = map(d, 0, hoverRange, 1, 0);
      hoverPower = constrain(hoverPower, 0, 1);

      can.inputHoverTarget = hoverPower;

      if (can.inputSelected === false) {
        can.inputState = INPUT_HOVERED;
      }
    } else {
      can.inputHoverTarget = 0;

      if (can.inputSelected === false) {
        can.inputState = INPUT_IDLE;
      }
    }

    // 这里用 lerp 做平滑状态变化。
    can.inputHoverAmount = lerp(can.inputHoverAmount, can.inputHoverTarget, 0.16);

    if (can.inputSelected) {
      can.inputSelectedAmount = lerp(can.inputSelectedAmount, 1, 0.14);
    } else {
      can.inputSelectedAmount = lerp(can.inputSelectedAmount, 0, 0.14);
    }

    can.inputOpenAmount = lerp(can.inputOpenAmount, can.inputOpenTarget, 0.08);
    can.inputPourAmount = lerp(can.inputPourAmount, can.inputPourTarget, 0.05);

    can.inputClickPulse *= 0.86;

    if (can.inputSelected && can.inputOpenAmount > 0.82) {
      can.inputState = INPUT_OPENED;
    }
  }
}

function handleUserInputMousePressed() {
  let clickedCan = getCanUnderMouse();

  if (clickedCan !== null) {
    clickedCan.inputSelected = !clickedCan.inputSelected;

    if (clickedCan.inputSelected) {
      clickedCan.inputState = INPUT_SELECTED;
      clickedCan.inputOpenTarget = 1;
      clickedCan.inputPourTarget = 1;
    } else {
      clickedCan.inputState = INPUT_IDLE;
      clickedCan.inputOpenTarget = 0;
      clickedCan.inputPourTarget = 0;
    }

    clickedCan.inputClickPulse = 1;
  }
}

function handleUserInputKeyPressed(k) {
  // C = close all，关闭所有打开的罐头。
  if (k === "c" || k === "C") {
    closeAllUserInputCans();
  }

  // M = toggle mechanics，让整体 mechanic 动画开关更清楚。
  if (k === "m" || k === "M") {
    mechanicsEnabled = !mechanicsEnabled;
  }
}

function closeAllUserInputCans() {
  for (let i = 0; i < cans.length; i++) {
    cans[i].inputSelected = false;
    cans[i].inputState = INPUT_IDLE;
    cans[i].inputOpenTarget = 0;
    cans[i].inputPourTarget = 0;
    cans[i].inputClickPulse = 0;
  }
}

function getCanUnderMouse() {
  const mx = artMouseX();
  const my = artMouseY();

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

function getInputHover(can) {
  return can.inputHoverAmount || 0;
}

function getInputSelected(can) {
  return can.inputSelectedAmount || 0;
}

function getInputOpen(can) {
  return can.inputOpenAmount || 0;
}

function getInputPour(can) {
  return can.inputPourAmount || 0;
}

function getInputShake(can) {
  return can.inputClickPulse || 0;
}

function drawUserInputStateOutline(can) {
  let hover = getInputHover(can);
  let selected = getInputSelected(can);

  if (hover < 0.02 && selected < 0.02) {
    return;
  }

  push();

  noFill();

  if (selected > 0.1) {
    stroke(52, 95, 95, 35 + selected * 45);
    strokeWeight(2 + selected * 3);
  } else {
    stroke(200, 75, 95, 20 + hover * 35);
    strokeWeight(1 + hover * 2);
  }

  rect(can.w * 0.04, can.h * 0.04, can.w * 0.92, can.h * 0.92, 3);

  pop();
}

function drawUserInputLiquid(can, x, y, w, h) {
  let pour = getInputPour(can);

  if (pour < 0.02) {
    return;
  }

  push();

  noStroke();

  // 液体颜色会随 mode 稍微变化，和整体配色有关。
  let liquidHue = (18 + mode * 45) % 360;

  fill(liquidHue, 85, 88, 72);

  let streamX = x + w * 0.67;
  let streamY = y + h * 0.82;
  let streamW = w * 0.095;
  let streamH = h * 0.22 * pour;

  rect(streamX - streamW / 2, streamY, streamW, streamH, 5);
  ellipse(streamX, streamY + streamH, streamW * 1.45, streamW * 0.72);

  ellipse(streamX + w * 0.12, streamY + streamH * 0.70, streamW * 0.45, streamW * 0.45);
  ellipse(streamX - w * 0.10, streamY + streamH * 0.92, streamW * 0.36, streamW * 0.36);

  pop();
}