// Declare global variables for x and y coordinates
let xPos;
let yPos;

// Let's make a variable to control the maximum line length
let maxLineLength = 30;

// Declare global variables for RGB colour values
let r;
let g;
let b;

// Declare global variables for the width and height of the drawing area (we will not use the whole canvas)
let drawWidth = 500;
let drawHeight = 500;

// Let's make a variable to control the line weight
let lineWeight = 1;

// The setup function runs once when the program starts
function setup() {
  // Create a canvas of size 500x600 pixels
  createCanvas(500, 600);
  
  // Initialise x and y to the centre of the canvas
  xPos = drawWidth / 2;
  yPos = drawHeight / 2;
  
  // Randomly set the initial RGB values between 0 and 255
  r = random(255);
  g = random(255);
  b = random(255);

  // Set the background colour of the canvas to a dark grey (32), this is happening in the setup function so it only happens once
  background(32);
}

// The draw function runs continuously after setup
function draw(){
  // Note, there is no background() function here, so the lines will be drawn on top of each other. 
  // If we want to clear the canvas we need to use the clear() function
  // or set the background to a colour in the draw function
  // Run the drawRandomLine function a single time each frame
  // We can control the speed of the animation by changing the number of iterations
  for(let i = 0; i < 1; i++){
    drawRandomLine();
  }
}

// Custom function to draw lines with random colours and directions
function drawRandomLine() {
  
  // Calculate the next x and y coordinates by adding a random value between -20 and 20 to the current x and y
  let nextX = xPos + random(-maxLineLength, maxLineLength);
  let nextY = yPos + random(-maxLineLength, maxLineLength);
  
  // Ensure the nextX and nextY values stay within the canvas boundaries
  // We use the constrain function to do this
  // If the value is less than the min value parameter, it will be set to the min input parameter
  // If it is greater than the max value parameter, it will be set to the max value parameter
  nextX = constrain(nextX, 0, drawWidth);
  nextY = constrain(nextY, 0, drawHeight);
  
  // We get the last R, G and B values and add a random value between -10 and 10 so they just change a little
  r += random(-10, 10);
  g += random(-10, 10);
  b += random(-10, 10);
  
  // Ensure the RGB values stay within the range of 0 to 255 again using the constrain function
  r = constrain(r, 0, 255);
  g = constrain(g, 0, 255);
  b = constrain(b, 0, 255);

  // Set the stroke colour using the RGB values
  stroke(r, g, b);
  
  // Set the stroke weight to lineWeight
  strokeWeight(lineWeight);
  // Draw a line from the current x,y to the next x,y
  line(xPos, yPos, nextX, nextY);
  
  // Update the current x and y coordinates to the next x and y coordinates
  // this is so the next line will start from the end of the previous line
  xPos = nextX;
  yPos = nextY;

  // Draw a rectangle as a background for the text
  fill(32);
  noStroke();
  rect(0, drawHeight, drawWidth, height-drawHeight);

  // Draw a string with the key commands
  fill(255);
  // Draw some text to the screen showing the control keys and the current values
  text(` Press the up or down arrows to change the max line length. Current Max line length: ${maxLineLength}`, 10, drawHeight + 20);
  text(` Press the left or right arrows to change the line weight. Current line weight: ${lineWeight}`, 10, drawHeight + 40)
  text(` Press 'c' to clear the canvas`, 10, drawHeight + 60);
}

// The keyPressed function is called once every time a key is pressed
function keyPressed() {
  if (keyCode === UP_ARROW) {
    maxLineLength += 5;
    maxLineLength = constrain(maxLineLength, 2, drawWidth/2);
  }
  if (keyCode === DOWN_ARROW) {
    maxLineLength -= 5;
    maxLineLength = constrain(maxLineLength, 2, drawHeight/2);
  }
  if (keyCode === RIGHT_ARROW) {
    lineWeight += 1;
    lineWeight = constrain(lineWeight, 1, 10);
  }
  if (keyCode === LEFT_ARROW) {
    lineWeight -= 1;
    lineWeight = constrain(lineWeight, 1, 10);
  }
  // if the key is c we clear the canvas
  if (key === 'c') {
    background(32);
  }
}