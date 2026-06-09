// This class will create and manage a random shape with noise
class randomShape {
  // The constructor will take a type of shape as an argument - circle or square
  constructor(type) {
    this.type = type;
    // Randomise the x and y position of the shape, these are limited to 80% of the width and height
    this.x = random(0.8);
    this.y = random(0.8);

    // Randomise the size of the shape between 5% and 20% of the width
    this.size = random(0.05, 0.2);
    // Randomise the colour of the shape
    this.color = [random(255), random(255), random(255)];
    this.scale = 1;
  }

  display(scale) {
    this.scale = scale;
    // Use the instance colour to fill the shape
    fill(this.color);
    noStroke();
    // Get the smaller dimension of the canvas
    let minDimension = min(width, height); 

    // Use the smaller dimension to maintain the aspect ratio
    // Calculate the size of the shape based on the smaller dimension
    // Remember the sizes were made in percentages so this will scale correctly
    let size = this.size * minDimension;

    // We now multiply the size by the scale to make the shapes change size based on the input to the display function
    size = size * this.scale;

    // The x position is the x value of the shape multiplied by the width of the canvas - same idea for the y position
    let x = this.x * width;
    let y = this.y * height;

    // Draw the shape based on the type
    switch (this.type) {
      case "circle":
        ellipse(x, y, size, size);
        break;
      case "square":
        rect(x, y, size, size);
        break;
    }
  }
}

// Create an array to hold the shapes
let shapes = [];

// Let's make a variable to hold the audio file
let song;

// Let's make a variable to hold the FFT object
let fft;

// Let's make a variable for the number of bins in the FFT object
// This is how many frequency bands we will have
// The number of bins must be a power of 2 between 16 and 1024
// Try changing this value
let numBins = 128;

// We will also have a variable for the smoothing of the FFT
// This averages the values of the frequency bands over time so it doesn't jump around too much
// Smoothing can be a value between 0 and 1
// Try changing this value
let smoothing = 0.8;

// This time we will make a global variable for the button so we can access it in the windowResized function
let button;

// Load sound file before setup() function runs
function preload() {
  // Audio file from freesound https://freesound.org/people/multitonbits/sounds/383935/?
  song = loadSound("assets/383935__multitonbits__bs_electricity-bass-2.wav");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Create a new instance of p5.FFT() object
  fft = new p5.FFT(smoothing, numBins);

  song.connect(fft);

  // Add a button for play/pause
  // We cannot play sound automatically in p5.js, so we need to add a button to start the sound
  button = createButton("Play/Pause");

  // Set the position of the button to the bottom centre
  button.position((width - button.width) / 2, height - button.height - 2);

  // We set the action of the button by choosing what action and then a function to run
  // In this case, we want to run the function play_pause when the button is pressed
  button.mousePressed(playPause);

  // Set the colour mode to HSB
  colorMode(HSB, 255);

  // Let's make a shape for each frequency band
  for (let i = 0; i < numBins; i++) {
    /*
      Randomly choose between 'circle' and 'square'
      This is a ternary operator - it is a shorthand if statement
      It is the same as writing:
        let shapeType = "null";
        if (Math.random() > 0.5) {
          shapeType = "circle";
        } else {
          shapeType = "square";
        }
    */
    let shapeType = Math.random() > 0.5 ? "circle" : "square";
    shapes.push(new randomShape(shapeType));
  }

  // Let's set the rect mode to centre so the squares stay in position but change size
  rectMode(CENTER);
}

function draw() {
  background(0);
  // The analyze() method returns an array of amplitude values across the frequency spectrum
  // Amplitude values range between 0 and 255, where at 0, the sound at the specific frequency band is silent
  // and at 255, the sound at the specific frequency band is at its loudest
  let spectrum = fft.analyze();

  for (let i = 0; i < numBins; i++) {
    // We divide the spectrum values by 255 so they are in the range 0 to 1
     shapes[i].display(spectrum[i]/255);
  }
}

function playPause() {
  if (song.isPlaying()) {
    song.stop();
  } else {
    // We can use song.play() here if we want the song to play once
    // In this case, we want the song to loop, so we call song.loop()
    song.loop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Reset the position of the button
  button.position((width - button.width) / 2, height - button.height - 2);
}