// user-input-mechanic.js
// 这是我负责的 User Input Mechanic。
// 我没有重新画罐头，而是在组员已经完成的高质量罐头视觉上，加一层“输入状态系统”。
// 这个文件主要负责：鼠标悬停、点击选择、开盖、倒出液体、键盘重置等状态变化。

let INPUT_IDLE = "idle";
let INPUT_HOVERED = "hovered";
let INPUT_SELECTED = "selected";
let INPUT_OPENED = "opened";

function setupUserInputStates() {
  // 这个函数会给每一个 can 增加我的 user input 状态变量。
  // cans 是组员主 sketch.js 里面已经创建好的数组。
  for (let i = 0; i < cans.length; i++) {
    cans[i].inputState = INPUT_IDLE;

    // hover 不是直接变成 1，而是慢慢变化，这样动画会更顺。
    cans[i].inputHoverTarget = 0;
    cans[i].inputHoverAmount = 0;

    // 是否被点击选中
    cans[i].inputSelected = false;
    cans[i].inputSelectedAmount = 0;

    // 点击后控制开盖和倒出液体
    cans[i].inputOpenTarget = 0;
    cans[i].inputOpenAmount = 0;

    cans[i].inputPourTarget = 0;
    cans[i].inputPourAmount = 0;

    // 点击瞬间的小反馈，让罐头稍微抖一下
    cans[i].inputClickPulse = 0;

    // 每个罐头 hover 时倾斜方向稍微不同
    cans[i].inputTiltDirection = random([-1, 1]);
  }
}

function updateUserInputStates() {
  // 这里每一帧更新所有罐头的输入状态。
  // artMouseX() 和 artMouseY() 是组员代码里已有的函数，用来把鼠标坐标转换到 artwork 坐标。
  let mx = artMouseX();
  let my = artMouseY();

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

    // 让 hover / selected / open / pour 都平滑变化。
    can.inputHoverAmount = lerp(can.inputHoverAmount, can.inputHoverTarget, 0.16);

    if (can.inputSelected) {
      can.inputSelectedAmount = lerp(can.inputSelectedAmount, 1, 0.14);
    } else {
      can.inputSelectedAmount = lerp(can.inputSelectedAmount, 0, 0.14);
    }

    can.inputOpenAmount = lerp(can.inputOpenAmount, can.inputOpenTarget, 0.08);
    can.inputPourAmount = lerp(can.inputPourAmount, can.inputPourTarget, 0.05);

    // 点击反馈会慢慢消失
    can.inputClickPulse *= 0.86;

    // 如果开盖接近完成，就进入 opened 状态
    if (can.inputSelected && can.inputOpenAmount > 0.82) {
      can.inputState = INPUT_OPENED;
    }
  }
}

function handleUserInputMousePressed() {
  // 点击时，找到鼠标所在的罐头。
  let clickedCan = getCanUnderMouse();

  if (clickedCan !== null) {
    // 再点一次可以关闭。这样展示时比较方便反复测试。
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
  // C = close all。这个键专门属于我的 user input mechanic。
  if (k === "c" || k === "C") {
    closeAllUserInputCans();
  }

  // M = mechanics on/off。
  // 组员代码里有 mechanicsEnabled 变量，但原来没有很明显的开关。
  // 我这里让用户可以按 M 打开/关闭整体 mechanic 动画。
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
  let mx = artMouseX();
  let my = artMouseY();

  // 从后往前找，这样如果以后有重叠，最上面的会先被点到。
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
  // 这个函数给 hover 或 selected 的罐头加一个外框反馈。
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
  // 这个函数画点击后的液体流出效果。
  // 它不替代组员原来的罐头视觉，只是在 drawCan 里面额外叠一层 user input 结果。
  let pour = getInputPour(can);

  if (pour < 0.02) {
    return;
  }

  push();

  noStroke();

  // 根据当前 mode 换一点颜色，让它和 1-4 的配色模式有联系。
  let liquidHue = (18 + mode * 45) % 360;
  fill(liquidHue, 85, 88, 72);

  let streamX = x + w * 0.67;
  let streamY = y + h * 0.82;
  let streamW = w * 0.095;
  let streamH = h * 0.22 * pour;

  rect(streamX - streamW / 2, streamY, streamW, streamH, 5);
  ellipse(streamX, streamY + streamH, streamW * 1.45, streamW * 0.72);

  // 加两个小液滴，让点击后的状态更明显
  ellipse(streamX + w * 0.12, streamY + streamH * 0.70, streamW * 0.45, streamW * 0.45);
  ellipse(streamX - w * 0.10, streamY + streamH * 0.92, streamW * 0.36, streamW * 0.36);

  pop();
}