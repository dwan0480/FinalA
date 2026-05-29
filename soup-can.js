// soup-can.js
// 这个文件负责画一个 soup can。
// 我用 class 是因为我们有很多个罐头，每个罐头都需要记录自己的位置、大小、口味和交互状态。
// 这样比把所有变量散开放在 sketch.js 里更清楚。

class SoupCan {
  constructor(x, y, panelW, panelH, canW, canH, flavour) {
    this.x = x;
    this.y = y;

    this.panelW = panelW;
    this.panelH = panelH;

    this.canW = canW;
    this.canH = canH;

    this.flavour = flavour;

    // 这些变量会被 user-input-mechanic.js 改变。
    this.hoverTarget = 0;
    this.hoverAmount = 0;

    this.isOpened = false;
    this.openAmount = 0;
    this.liquidAmount = 0;

    // 每个罐头有一点点不同的旋转方向，这样 hover 时不会完全一样。
    this.rotateDirection = random([-1, 1]);
  }

  update() {
    // lerp() 让数值慢慢靠近目标值，所以动画比较顺滑。
    // 可以理解成：当前值 = 当前值慢慢接近目标值。
    this.hoverAmount = lerp(this.hoverAmount, this.hoverTarget, 0.16);

    if (this.isOpened) {
      this.openAmount = lerp(this.openAmount, 1, 0.08);
      this.liquidAmount = lerp(this.liquidAmount, 1, 0.045);
    } else {
      this.openAmount = lerp(this.openAmount, 0, 0.12);
      this.liquidAmount = lerp(this.liquidAmount, 0, 0.12);
    }
  }

  display() {
    push();

    translate(this.x, this.y);

    // 鼠标靠近时，整个 frame + can 会轻微放大和旋转。
    let scaleAmount = 1 + this.hoverAmount * 0.09;
    let rotateAmount = this.hoverAmount * 0.045 * this.rotateDirection;

    rotate(rotateAmount);
    scale(scaleAmount);

    this.drawPanelShadow();
    this.drawPanelFrame();
    this.drawCanShadow();
    this.drawCanBody();
    this.drawCanDetails();
    this.drawOpenLid();
    this.drawLiquid();

    pop();
  }

  drawPanelShadow() {
    push();

    noStroke();
    fill(0, 35);

    // 阴影稍微偏右下，画面会更有层次。
    rect(7, 8, this.panelW, this.panelH, 3);

    pop();
  }

  drawPanelFrame() {
    push();

    let palette = getCurrentPalette();

    // 外层木质框
    stroke(70, 45, 28);
    strokeWeight(3);
    fill(125, 82, 48);
    rect(0, 0, this.panelW, this.panelH, 3);

    // 内层白色画布
    stroke(45);
    strokeWeight(1.5);
    fill(palette.canvas[0], palette.canvas[1], palette.canvas[2]);
    rect(0, 0, this.panelW * 0.84, this.panelH * 0.84, 2);

    pop();
  }

  drawCanShadow() {
    push();

    noStroke();
    fill(0, 35);
    ellipse(6, this.canH * 0.42, this.canW * 0.92, this.canH * 0.12);

    pop();
  }

  drawCanBody() {
    push();

    let palette = getCurrentPalette();

    // 罐头主体位置稍微往下一点，这样上方有盖子的空间。
    let bodyY = 10;

    // 罐头外轮廓
    stroke(35);
    strokeWeight(1.7);
    fill(245);
    rect(0, bodyY, this.canW, this.canH, 6);

    // 红色上半部分
    noStroke();
    fill(palette.red[0], palette.red[1], palette.red[2]);
    rect(0, bodyY - this.canH * 0.18, this.canW, this.canH * 0.42);

    // 白色下半部分
    fill(250);
    rect(0, bodyY + this.canH * 0.22, this.canW, this.canH * 0.46);

    // 中间金色圆章
    fill(palette.gold[0], palette.gold[1], palette.gold[2]);
    ellipse(0, bodyY + this.canH * 0.03, this.canW * 0.22, this.canW * 0.22);

    // 顶部椭圆金属盖
    stroke(35);
    strokeWeight(1.4);
    fill(218);
    ellipse(0, bodyY - this.canH * 0.50, this.canW * 1.02, this.canH * 0.15);

    // 顶部内圈
    noFill();
    stroke(70);
    strokeWeight(1);
    ellipse(0, bodyY - this.canH * 0.50, this.canW * 0.80, this.canH * 0.10);
    ellipse(0, bodyY - this.canH * 0.50, this.canW * 0.58, this.canH * 0.06);

    // 底部椭圆线，让罐头更像圆柱
    stroke(70);
    noFill();
    ellipse(0, bodyY + this.canH * 0.50, this.canW * 1.00, this.canH * 0.13);

    // 重新描边主体
    stroke(35);
    strokeWeight(1.8);
    noFill();
    rect(0, bodyY, this.canW, this.canH, 6);

    pop();
  }

  drawCanDetails() {
    push();

    let palette = getCurrentPalette();
    let bodyY = 10;

    noStroke();

    // Campbell's 风格文字。这里不是完全复制 logo，只是做类似的手写视觉感觉。
    fill(255);
    textStyle(ITALIC);
    textSize(this.canW * 0.18);
    text("Campbell's", 0, bodyY - this.canH * 0.30);

    textStyle(NORMAL);
    textSize(this.canW * 0.055);
    text("CONDENSED", 0, bodyY - this.canH * 0.18);

    // 口味文字
    fill(palette.labelText[0], palette.labelText[1], palette.labelText[2]);
    textStyle(BOLD);
    textSize(this.canW * 0.090);

    this.drawFlavourText(bodyY);

    // SOUP 大字
    fill(70);
    textSize(this.canW * 0.13);
    text("SOUP", 0, bodyY + this.canH * 0.40);

    // 底部小装饰线
    stroke(170, 50);
    strokeWeight(1);
    line(-this.canW * 0.32, bodyY + this.canH * 0.48, this.canW * 0.32, bodyY + this.canH * 0.48);

    pop();
  }

  drawFlavourText(bodyY) {
    // 这个函数专门处理口味文字换行。
    // 有些口味比较长，比如 CHICKEN NOODLE，需要分两行显示。
    let words = this.flavour.split(" ");

    if (words.length === 1) {
      text(words[0], 0, bodyY + this.canH * 0.22);
    } else if (words.length === 2) {
      text(words[0], 0, bodyY + this.canH * 0.18);
      text(words[1], 0, bodyY + this.canH * 0.29);
    } else {
      text(words[0], 0, bodyY + this.canH * 0.15);
      text(words[1], 0, bodyY + this.canH * 0.25);
      text(words[2], 0, bodyY + this.canH * 0.35);
    }
  }

  drawOpenLid() {
    // 如果没有打开，就不画额外的盖子。
    if (this.openAmount < 0.02) {
      return;
    }

    push();

    let bodyY = 10;

    // 盖子会随着 openAmount 上升并旋转。
    let lidX = this.canW * 0.08 * this.openAmount;
    let lidY = bodyY - this.canH * 0.55 - this.canH * 0.22 * this.openAmount;
    let lidRotate = -0.65 * this.openAmount;

    translate(lidX, lidY);
    rotate(lidRotate);

    stroke(35);
    strokeWeight(1.4);
    fill(215);
    ellipse(0, 0, this.canW * 0.88, this.canH * 0.12);

    noFill();
    stroke(80);
    ellipse(0, 0, this.canW * 0.62, this.canH * 0.065);

    pop();
  }

  drawLiquid() {
    // 点击后才会画液体。
    if (this.liquidAmount < 0.02) {
      return;
    }

    push();

    let palette = getCurrentPalette();
    let bodyY = 10;

    noStroke();
    fill(palette.liquid[0], palette.liquid[1], palette.liquid[2], 190);

    // 液体从罐头右下角流出，长度慢慢变长。
    let streamX = this.canW * 0.24;
    let streamStartY = bodyY + this.canH * 0.38;
    let streamLength = this.canH * 0.45 * this.liquidAmount;
    let streamW = this.canW * 0.13;

    rect(streamX, streamStartY + streamLength / 2, streamW, streamLength, 8);
    ellipse(streamX, streamStartY + streamLength, streamW * 1.45, streamW * 0.75);

    // 小液滴，让画面更像动画结果
    ellipse(streamX + this.canW * 0.16, streamStartY + streamLength * 0.72, streamW * 0.55, streamW * 0.55);
    ellipse(streamX - this.canW * 0.13, streamStartY + streamLength * 0.92, streamW * 0.42, streamW * 0.42);

    pop();
  }

  containsMouse() {
    // 点击范围用 panel 的矩形范围判断。
    // 这样用户点击画框内也可以触发，交互更容易。
    let left = this.x - this.panelW / 2;
    let right = this.x + this.panelW / 2;
    let top = this.y - this.panelH / 2;
    let bottom = this.y + this.panelH / 2;

    if (mouseX > left && mouseX < right && mouseY > top && mouseY < bottom) {
      return true;
    } else {
      return false;
    }
  }
}