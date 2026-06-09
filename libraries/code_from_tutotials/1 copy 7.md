// Let's create an empty array to hold the multiple heads
let heads = [];
const numHeads = 20; // Adjust to change the number of heads displayed
const stepSize = 1; // Adjust to change the speed of animation

// We initialise the heads using a function
// Each head will have a random starting position,
// random starting angle, starting size and colour
// Note: the colour defined assumes HSB colour mode
function initialiseHeads() {
  // Clear the heads array
  // Note: only use this approach if nothing else is referencing the array
  heads = []; 

  // Instantiate all the head objects with random values as outlined above
  for (let i = 0; i < numHeads; i++) {
    let head = new Head(
      random(width), 
      random(height),
      random(360),
      random(50, 150),
      color(random(360), 60, 100))
    heads.push(head); // Add each head object to the array
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  colorMode(HSB); // Use HSB colour mode
  initialiseHeads();
}

function draw() {
  background(0, 0, 88); // HSB(0, 0, 8) is approximately RGB(225, 225, 225)

  // Each frame we update the position and angle of each head 
  // and display it
  for (const head of heads) {
    head.update();
    head.display();
  }
}

// Bauhaus Head Class
// The class has a constructor and two methods: 
// - dsplay() is used to draw the Bauhaus emblem
// - update() is used to update key variables each frame
class Head {
  // The constructor is used to set the initial
  // position, angle, diameter and colour
  constructor(x, y, angle, diameter, colour) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.diameter = diameter;
    this.colour = colour;
  }

  display() {
    // The push() function saves any transformations and style settings
    // that might proceed a call to this method
    push();

    fill(this.colour);

    // Perform all transforms in the order: translate, rotate and scale
    translate(this.x, this.y);
    rotate(this.angle);
    scale(this.diameter);
    
    // Circular outline
    strokeWeight(0.01);
    ellipse(0, 0, 1);

    // Style for head
    fill(20);
    stroke(20);

    // Eye
    rect(-0.17, -0.33, 0.15, 0.15);
    line(-0.26, -0.33, -0.17, -0.33);
    line(-0.02, -0.18, -0.02, -0.09);

    // Nose
    rect(0.11, -0.48, 0.01, 0.59);
    line(0.02, 0.11, 0.11, 0.11);

    // Mouth
    rect(0.07, 0.11, 0.03, 0.27);
    rect(0.02, 0.22, 0.04, 0.01);

    // Chin
    rect(-0.05, 0.38, 0.11, 0.11);
    line(-0.12, 0.38, -0.05, 0.38);

    // The pop() function restores any transformations and style settings
    // that were saved by the earlier call to push()
    pop();
  }

  // The update() method is intended to be called every frame
  // The purpose of the update() method is to move and rotate the heads
  // across the canvas from left to right. 
  // Note: the y-position, diameter and colour stay the same each frame
  update() {
    // Adjust the x-position each frame
    this.x += stepSize;

    // Check to see if the head has moved past the right side of the canvas
    // and if it has, reset its position to the left side of the canvas
    if (this.x - this.diameter / 2 > width) {
      this.x = - this.diameter / 2;
    }

    // Adjust the angle each frame
    this.angle += stepSize;
  }
}