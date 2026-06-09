// This is the array we will use to store our class instances.
let animators = [];
// This is the noise increment value, it will be used to move along the Perlin noise curve
let noiseIncrement = 0;

function setup() {
  // We want to make a square canvas, so we will check the window width and height and take the smaller of the two.
  let size = Math.min(windowWidth, windowHeight);

  // Resize the canvas to be a square using the value we just got.
  createCanvas(size, size);

  // Set the angle mode to degrees.
  angleMode(DEGREES);

  // We will make 4 animators in a grid pattern. Each animator will have a different complexity value.
  animators.push(new DotAnimator(0, 0, width / 2, 0.1, 1));
  animators.push(new DotAnimator(width / 2, 0, width / 2, 0.2, 1));
  animators.push(new DotAnimator(0, width / 2, width / 2, 0.3, 1));
  animators.push(new DotAnimator(width / 2, width / 2, width / 2, 0.4, 1));

  // Clear the background to black.
  background(0);
}

function draw() {
  // Use the alpha value to make the background fade slowly.
  background(0, 1);

  // The noise increment will increase by 0.05 every frame, moving along the Perlin noise curve.
  // Try changing this value to see how it affects the dot's movement.
  noiseIncrement += 0.05;

  // Update the dot animator with the new noise value. We will control how much the 
  // noise affects the dot's position with the mouseX value.
  // Use a for-of loop to update the animators.
  for (let animator of animators) {
    animator.update(noise(noiseIncrement) * (width / mouseX));
  }
}

function windowResized() {
  // Again we want a square, so if the window is resized we will check the new 
  // width and height and take the smaller of the two.
  let size = Math.min(windowWidth, windowHeight);

  // Use the new size to resize the canvas.
  resizeCanvas(size, size);

  // Recalculate the bounds of the dot animators - this sets the width, height and position of each animator.
  animators[0].recalculateBounds(0, 0, width / 2);
  animators[1].recalculateBounds(width / 2, width / 2, width / 2);
  animators[2].recalculateBounds(0, width / 2, width / 2);
  animators[3].recalculateBounds(width / 2, 0, width / 2);

  // Clear the background to black again.
  background(0);
}

function keyPressed() {
  if (key == "c") {
    background(0);
  }
}

class DotAnimator {
  // Our constructor will take the x and y position of the dot, the size of the drawing area 
  // (it's a single value because it's a square), 
  // the complexity of the dot's movement and the speed of the dot's movement.
  constructor(xPos, yPos, size, complexity, speed) {
    // Use the inputs to the constructor to set the initial values of the class variables.
    this.xPos = xPos;
    this.yPos = yPos;
    this.complexity = complexity;
    this.speed = speed;
    this.size = size;
    // Set the initial angle of the dot to 0.
    this.angle = 0;
    // Set the increment to 0 - we will use this instead of the frameCount so that 
    // each instance of the class can have its own increment value.
    this.increment = 0;
    // Draw distortion will influence the dot's position, we will set it to 0 initially.
    this.drawDistortion = 0;
  }

  // We have an update function for our class, this will be called every frame.
  update(drawDistortion) {
    /*
      Here we can control the speed by controlling when each instance of the class updates its increment value.
      Increment value here replaces frameCount in the last version of this code.
      frameCount is a global variable that increases by 1 every frame, our increment only increases when we want it to.
      We control the increment increase using the remainder operator, this means that the increment will only 
      increase when the frameCount is divisible by the speed value.
    */
    if (frameCount % this.speed == 0) {
      // If we should update the increment value, we increase the increment value by 1.
      this.increment++;
      // The angle will be used to define how many degrees the dot is rotated by (changing the complexity of the drawing).
      // We use class variables to control this now.
      this.angle += this.complexity;
    }

    // We will apply the draw distortion even if we don't update the angle and increment.
    // This will make the dot move slightly even when the angle is not changing.
    this.drawDistortion = drawDistortion;

    // We want to draw a bounding box for the instance of the class. 
    // We will draw a rectangle at the x and y position with the size of the class.
    stroke(255);
    noFill();
    rect(this.xPos, this.yPos, this.size, this.size); // Draw the boundary at the computed position.

    // These translate functions are the same as before, we use 8 and 4 to make an elliptical pattern.
    // The only difference is we are using the sin and cos of the increment value instead of the frameCount.
    let translateX = (sin(this.increment) * this.size) / 8;
    let translateY = (cos(this.increment) * this.size) / 4;

    // Now push the drawing context so we can apply transformations to the dot.
    push();
    // First we translate the drawing context to the centre of the class instance position.
    translate(this.xPos + this.size / 2, this.yPos + this.size / 2);
    // Now we rotate as before, but it's now based on our complexity control.
    rotate(this.angle);
    // And we translate with the calculated values just like before.
    translate(translateX, translateY);

    // Draw the animated dot
    noStroke();
    fill(255);
    // Now we draw the dot at 0,0 and apply the distortion value to slightly alter the x and y position.
    circle(0 + this.drawDistortion, 0 + this.drawDistortion, 5);
    pop(); // Reset transformations
  }

  // This function will be used to recalculate the bounds of the class instance, 
  // so we can react to changes in the canvas size.
  recalculateBounds(xPos, yPos, size) {
    this.xPos = xPos;
    this.yPos = yPos;
    this.size = size;
  }
}