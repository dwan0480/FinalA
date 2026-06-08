// This user input mechanic was revised with ChatGPT assistance.
// The open or closed state is controlled by the time-based mechanic.
// User input only reacts to the current state of the can.
let INPUT_IDLE = "idle";
let INPUT_HOVERED = "hovered";
let INPUT_RATTLE = "rattle";
let INPUT_POURING = "pouring";

function setupUserInputStates() {
    // Add user input variables to every can object.
  for (let i = 0; i < cans.length; i++) {
    let can = cans[i];

    can.inputState = INPUT_IDLE;

 
    can.inputHoverTarget = 0;
    can.inputHoverAmount = 0;

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
    can.inputActionDuration = 90;

    can.inputTiltDirection = random([-1, 1]);

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

// dist() 
// map() 
// constrain()
// https://p5js.org/reference/p5/dist/
// https://p5js.org/reference/p5/map/
// https://p5js.org/reference/p5/constrain/
function updateUserInputStates() {
  let mx = artMouseX();
  let my = artMouseY();

  for (let i = 0; i < cans.length; i++) {
    let can = cans[i];

    let centerX = can.x + can.w / 2;
    let centerY = can.y + can.h / 2;

    let d = dist(mx, my, centerX, centerY);
    let hoverRange = min(can.w, can.h) * 0.58;

    // Mouse hover only creates visual feedback （not open can）.
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

    //Smooth values with lerp, similar to class examples from the course.
    // Source: https://p5js.org/reference/p5/lerp/
    can.inputHoverAmount = lerp(can.inputHoverAmount, can.inputHoverTarget, 0.16);
    can.inputRattleAmount = lerp(can.inputRattleAmount, can.inputRattleTarget, 0.22);
    can.inputFlipAmount = lerp(can.inputFlipAmount, can.inputFlipTarget, 0.055);
    can.inputSqueezeAmount = lerp(can.inputSqueezeAmount, can.inputSqueezeTarget, 0.16);
    can.inputJuiceAmount = lerp(can.inputJuiceAmount, can.inputJuiceTarget, 0.12);
    can.inputBurstAmount = lerp(can.inputBurstAmount, can.inputBurstTarget, 0.14);

    
    can.inputClickPulse *= 0.86;
    can.inputRattleTarget *= 0.82;

     // Keep the opened-can reaction active for a short time.
     // https://p5js.org/reference/p5/frameCount/
    if (can.inputActionTimer > 0) {
      can.inputActionTimer--;

      can.inputState = INPUT_POURING;

      can.inputFlipTarget = 1;
      can.inputJuiceTarget = 1;
      can.inputBurstTarget = 1;

    
      let squeezeWave = sin(frameCount * 0.22);
      can.inputSqueezeTarget = 0.65 + abs(squeezeWave) * 0.35;
    } else {
      
      can.inputFlipTarget *= 0.96;
      can.inputSqueezeTarget *= 0.84;
      can.inputJuiceTarget *= 0.90;
      can.inputBurstTarget *= 0.82;
    }

    ///Return to idle or hover after the animation is finished.
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
    // Opened can: flip, squeeze, pour juice, and show splash dots.
    let isOpen = isCanOpenForUserInput(clickedCan);

    if (isOpen) {
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
      // Closed can: rattle only.
      // User input does not open the can.
      clickedCan.inputState = INPUT_RATTLE;

      clickedCan.inputRattleTarget = 1;
      clickedCan.inputRattleAmount = 1;

      clickedCan.inputClickPulse = 1;
    }
  }
}

function handleUserInputKeyPressed(k) {
  // c can clean effect and not affect time-based / audio / perlin.
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
// Only the time-based mechanic decides if a can is open.
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

//Not useful
function getInputSelected(can) {
  if (can.inputState === INPUT_POURING) {
    return 1;
  }

  return 0;
}

function getInputOpen(can) {
// User input does not open cans.
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

  //Not Open
  if (rattle > 0.05) {
    stroke(205, 85, 95, 25 + rattle * 55);
    strokeWeight(1 + rattle * 3);
  }

 //Open
  else if (pour > 0.05) {
    let outlineHue = getPerlinHue(can);
    stroke(outlineHue, 95, 95, 30 + pour * 60);
    strokeWeight(2 + pour * 3);
  }
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

// Use the current Perlin colour of this can.
  let liquidHue = getPerlinHue(can);
  let liquidBrightness = getPerlinBrightness(can);

  fill(liquidHue, 90, liquidBrightness, 78);

 // Mouth position near the lid.
  let mouthX = x + w * 0.50;
  let mouthY = y + h * 0.10;

  let streamW = w * 0.15;
  let streamH = h * 0.48 * juice;
  // Draw upward in local space.
  // After the can flips, it looks like the juice pours down from the mouth.
  rect(mouthX - streamW / 2, mouthY - streamH, streamW, streamH, 5);

  ellipse(
    mouthX,
    mouthY - streamH,
    streamW * 1.45,
    streamW * 0.75
  );

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


  let liquidHue = getPerlinHue(can);
  let liquidBrightness = getPerlinBrightness(can);

  fill(liquidHue, 95, liquidBrightness, 65 * burst);


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