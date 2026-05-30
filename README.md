# Interactive Soup Cans

## Inspiration

This project is an interactive reinterpretation of pop-art soup can imagery, especially the repeated grid structure and commercial label style associated with Andy Warhol's Campbell's Soup Cans. Instead of making a static copy, the work treats each can as a small animated object inside a larger grid. The repeated layout creates the visual rhythm, while the interactive mechanics make the cans feel unstable, responsive, and alive.

Our team focused on keeping the original pop-art idea readable: repeated cans, bold labels, strong colour areas, and a gallery-like grid. The added mechanics change the cans through time, sound, mouse input, randomness, texture, and movement.

## Techniques

The project is built with p5.js. The main file, `sketch.js`, creates the canvas, builds the 8 by 4 soup can grid, updates shared values, and calls the drawing functions. The visual drawing code is separated into `soup-can.js`, while individual mechanics are kept in separate script files where possible.

Key p5.js techniques used:

- `createCanvas()`, `windowResized()`, and scaling calculations are used so the artwork fits the browser window.
- Arrays and object properties store the 32 cans and their individual positions, labels, random values, texture values, and animation states.
- `random()` and `noise()` create small differences between cans, including rust, dents, wobble, texture, and colour variation.
- `push()`, `pop()`, `translate()`, `rotate()`, and `scale()` position and animate each can without affecting the rest of the drawing.
- `millis()`, `frameCount`, and timed event values drive the Time-based mechanic.
- `lerp()` smooths changes such as lid opening, hover strength, pouring liquid, label flashing, and timed pulses.
- `p5.FFT()` and `p5.Amplitude()` are prepared for audio-driven changes to the cans.
- Mouse and keyboard input are used for selecting cans, opening lids, closing cans, changing palettes, and toggling mechanics.

The code uses modular files:

- `index.html` loads p5.js, p5.sound, and the project scripts in the correct order.
- `sketch.js` controls setup, the main draw loop, resizing, audio setup, and keyboard routing.
- `soup-can.js` draws the can frames, labels, lids, metal texture, rust, dents, and visual effects.
- `time-based-mechanic.js` controls timer-based events such as batch lid opening, colour pulses, scaling pulses, and label flickering.
- `user-input-mechanic.js` controls hover, click selection, lid opening, pouring, and close-all behaviour.

## Mechanic Ownership

- Martin: Time-based mechanic. This mechanic uses `millis()` to trigger a new event every few seconds. The timed events open groups of lids, flash label text, pulse the scale of cans, and shift colours without requiring user input.
- Team member name: User input mechanic. This mechanic uses mouse hover and clicks to highlight cans, open or close selected cans, and pour liquid. The `C` key closes all opened cans.
- Team member name: Audio mechanic. This mechanic uses p5.sound values such as amplitude and FFT frequency energy to affect movement, label lines, and can deformation.
- Team member name: Perlin noise and randomness mechanic. This mechanic uses `random()`, `randomSeed()`, `noise()`, and `noiseSeed()` to create variation in can damage, rust, texture, wobble, and repeated visual details.

Replace the placeholder names above with the final team member names before submission.

## AI Acknowledgement

ChatGPT was used to help plan, write, and revise parts of this project. It helped with the modular Time-based mechanic, merge conflict resolution, code checking, README drafting, and simplifying some code so it better matches class examples.

The Time-based mechanic in `time-based-mechanic.js` was written with ChatGPT assistance. It works by storing timer state, calculating the current event from `millis()`, updating each can's time-based target values, and smoothing those values with `lerp()`. The code includes comments acknowledging this assistance.

## External References

- p5.js: https://p5js.org/  
  Used for canvas drawing, animation, colour, transforms, mouse/keyboard input, `random()`, `noise()`, `millis()`, and other creative coding functions.

- p5.sound: https://p5js.org/reference/#/libraries/p5.sound  
  Used for `p5.FFT()` and `p5.Amplitude()` so audio level and frequency data can influence the artwork.

- Andy Warhol, Campbell's Soup Cans: https://www.moma.org/collection/works/79809  
  Used as visual inspiration for the repeated soup can grid and pop-art reference.

## Interaction Instructions

1. Open `index.html` in a browser, or run a local server and visit the project page.
2. Wait a few seconds to see the Time-based mechanic automatically open batches of can lids and trigger flashes or pulses.
3. Move the mouse over the cans to create hover movement and highlight effects.
4. Click a can to open it and make it pour liquid. Click it again to close it.
5. Press `C` to close all cans.
6. Press `1`, `2`, `3`, or `4` to change the colour palette.
7. Press `M` to toggle the extra audio/noise mechanic movement.
8. Press `U` to upload an audio file, then use the audio playback controls in the sketch.
9. Press the space bar to pause or resume the uploaded audio.
10. Press `R` to rebuild the grid with a new random seed.

## Notes For Submission

Before final submission, replace the mechanic ownership placeholder names with the correct team member names. Also make sure each team member has at least three meaningful commits in the GitHub history, as required by the assignment brief.
