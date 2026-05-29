let img;
let numSegments = 50;
let segments = [];
let drawSegments = true;

// One object holds everything about how the image is drawn on screen
let fit = { x: 0, y: 0, w: 0, h: 0 };

function preload() {
  img = loadImage('/assets/Mona_Lisa_by_Leonardo_da_Vinci_500_x_700.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  calculateFit();

  // Build the grid — each segment samples its own colour from the image
  for (let row = 0; row < numSegments; row++) {
    for (let col = 0; col < numSegments; col++) {
      segments.push(new ImageSegment(row, col));
    }
  }
}

function draw() {
  background(0);
  if (drawSegments) {
    for (const segment of segments) {
      segment.draw();
    }
  } else {
    image(img, fit.x, fit.y, fit.w, fit.h);
  }
}

function keyPressed() {
  if (key === " ") {
    drawSegments = !drawSegments;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateFit();
}

// Figure out the size and position to draw the image so it fits centred on the canvas
function calculateFit() {
  let imgAspect = img.width / img.height;
  let canvasAspect = width / height;

  if (imgAspect > canvasAspect) {
    fit.w = width;
    fit.h = width / imgAspect;
  } else {
    fit.h = height;
    fit.w = height * imgAspect;
  }
  fit.x = (width - fit.w) / 2;
  fit.y = (height - fit.h) / 2;
}

class ImageSegment {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.colour = this.sampleColour();
  }

  // Pick the colour from the centre of this cell in the source image
  sampleColour() {
    let sampleW = img.width / numSegments;
    let sampleH = img.height / numSegments;
    let x = this.col * sampleW + sampleW / 2;
    let y = this.row * sampleH + sampleH / 2;
    return img.get(x, y);
  }

  draw() {
    // Calculate position and size at draw time, based on the current fit
    let w = fit.w / numSegments;
    let h = fit.h / numSegments;
    let x = fit.x + this.col * w;
    let y = fit.y + this.row * h;

    stroke(0);
    fill(this.colour);
    rect(x, y, w, h);
  }
}