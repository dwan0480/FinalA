# Interactive Soup Cans

## Project Overview

This project is an interactive pop-art reinterpretation of Andy Warhol's *Campbell's Soup Cans*. The original work is known for its repeated soup can structure, commercial label style, flat colour areas, and the transformation of everyday consumer products into gallery artwork. Our project extends this idea into an interactive p5.js system, where repeated soup cans are displayed in a gallery-like grid but become unstable, animated, and responsive over time.

The work keeps the original pop-art language readable through repeated cans, bold labels, strong colour areas, and a structured display layout. Instead of creating a static digital copy, we developed a living version of the image. The cans open and close through timed events, shift colour through Perlin noise, react to mouse selection, and respond to audio or microphone input through shaking and twisted deformation.

There is a slight game-like quality in the interaction, similar to a “whack-a-mole” structure, because the user has to notice which cans are open and select them at the right moment. However, this project is not designed as a scoring game. There is no point system, win condition, or competitive goal. The focus remains on the gallery experience and on extending the spirit of Warhol's original work: repetition, commercial imagery, and the tension between mass production and individual variation.

---

## Inspiration

### Andy Warhol and Pop Art

Our main visual inspiration is Andy Warhol's *Campbell's Soup Cans*. We were interested in how Warhol used repeated commercial imagery to question the boundary between everyday products and fine art. The repeated can grid, bold label structure, and simple commercial visual language became the foundation of our project.

We did not try to make a perfect copy of the original artwork. Instead, we focused on the visual and conceptual qualities that make the work recognisable:

- repeated soup cans arranged in a clear grid;
- bold commercial label design;
- strong red, white, and metallic colour areas;
- simple product-like shapes;
- the feeling of an artwork displayed in a gallery;
- small differences inside repetition.

### Interactive Reinterpretation

Our interactive version extends Warhol's repeated soup cans into a digital environment. The cans are still arranged like repeated commercial objects, but they are no longer fully stable or identical. Their states change through time, colour shifts move through the grid, user selection affects individual cans, and sound can shake or distort the display.

This creates a contrast between mass-produced repetition and live digital behaviour. The cans still look like part of a repeated pop-art system, but each one can temporarily become different through animation, interaction, and audio response.

---

## Techniques

This project is built with **p5.js** and **p5.sound**. The code is organised into a main sketch file, visual drawing files, and separate mechanic files where possible. This modular structure makes the project easier to read and helps show each team member's individual contribution.

### Main p5.js Structure

The project uses:

- `createCanvas()` to create the drawing area.
- `windowResized()` and scaling calculations so the artwork fits different browser window sizes.
- `draw()` as the main animation loop.
- Arrays to store the 8 by 4 grid of soup cans.
- Object properties to store each can's position, open/closed state, selected state, colour values, animation values, and audio response values.
- `push()` and `pop()` to isolate transformations for each can.
- `translate()`, `rotate()`, and `scale()` to position and animate each can without affecting the rest of the drawing.
- `millis()` and timed event logic to control the time-based opening, closing, and display movement.
- `noise()` to create smooth Perlin-noise-based colour changes.
- `random()` and seeded values to create repeated but slightly varied visual details where needed.
- `lerp()` to smooth animation changes, including can movement, deformation, opening states, and pouring movement.
- Mouse input to select cans and trigger pouring behaviour.
- `p5.FFT()` and `p5.Amplitude()` to analyse uploaded audio or microphone input.

---

## File Structure

### `index.html`

Loads p5.js, p5.sound, and the project script files in the correct order. This file connects the modular JavaScript files so the project can run in the browser.

### `sketch.js`

Controls the overall project setup and main draw loop. It creates the canvas, builds the soup can grid, stores shared variables, updates global animation states, manages resizing, handles audio setup, and routes interaction values to the relevant mechanics.

### `soup-can.js`

Contains the main drawing functions for the soup cans. It draws the can body, label, lid, shadows, highlights, texture, open/closed states, selected states, deformation, and pouring visuals. Keeping the drawing logic separate from the mechanic logic makes the project easier to understand.

### `time-based-mechanic.js`

Controls the timed behaviour of the cans. This mechanic uses `millis()` to change can states over time, including opening and closing cans and creating subtle display movement. It makes the grid feel like an active gallery installation rather than a static image.

### `user-input-mechanic.js`

Controls mouse-based interaction. The user can move the mouse to select a specific can. If the selected can is currently open, the user can tilt or pour it so that the contents come out. If the can is closed, it cannot pour. This creates a simple interaction rule that depends on both user input and the time-based can state.

### `audio-mechanic.js`

Controls the sound-responsive behaviour. It uses p5.sound to analyse uploaded audio or microphone input. The sound does not make the cans produce sound. Instead, audio data changes the visual state of the cans, mainly through shaking, vibration, and twisted deformation inside the frame.

### `perlin-random-mechanic.js`

Controls colour variation and smooth visual changes using Perlin noise. This mechanic uses `noise()` to shift colours in a continuous way, so the cans feel visually alive without changing too abruptly. Random or seeded values may also be used for controlled variation between repeated cans.

---

## Mechanic Ownership

Each team member was responsible for one distinct mechanic. This follows the project requirement that every team member acts as the creative director for a different interaction mode.
- `index.html` loads p5.js, p5.sound, and the project scripts in the correct order.
- `sketch.js` controls setup, the main draw loop, resizing, audio setup, and keyboard routing.
- `soup-can.js` draws the can frames, labels, lids, metal texture, rust, dents, and visual effects.
- `time-based-mechanic.js` controls timer-based events such as batch lid opening, scaling pulses.
- `user-input-mechanic.js` controls hover, click selection, lid opening, pouring, and close-all behaviour. 
- `perlin-noise-mechanic.js` (implemented within the project drawing system) controls smooth colour transitions for can bodies, labels, and frames using Perlin Noise. It uses noise(), map(), and frameCount to generate gradual colour changes across a warm palette of dark red, red, orange, and gold.

## Mechanic Ownership

- Martin: Time-based mechanic. This mechanic uses `millis()` to trigger a new event every few seconds. The timed events open groups of lids, flash label text, pulse the scale of cans, and shift colours without requiring user input.
- Ming Chen: User input mechanic. This mechanic uses mouse hover and clicks to highlight cans, open or close selected cans, and pour liquid. The `C` key closes all opened cans.
- Team member name: Audio mechanic. This mechanic uses p5.sound values such as amplitude and FFT frequency energy to affect movement, label lines, and can deformation.
- Yang Zhang: Perlin Noise mechanic. This mechanic uses Perlin Noise `noise()` to continuously change the colours of the can bodies, labels, and frames. Smooth noise values are mapped to a warm colour palette ranging from dark red, red, orange, and gold. Unlike random colour switching, Perlin Noise creates gradual and organic colour transitions that give the cans a breathing visual effect over time.

### Martin — Time-based Mechanic

Martin was responsible for the time-based mechanic. This mechanic controls the opening and closing states of the cans and adds subtle natural display movement over time.

The purpose of this mechanic is to make the repeated soup can grid feel like a live gallery installation. The cans are not all controlled by the user at once. Instead, their open and closed states change over time, which creates a rhythm across the display. This also supports the slightly “whack-a-mole-like” interaction structure, because the user has to notice when a can is open before they can pour it.

Key techniques used:

- `millis()` for tracking timed changes;
- timed event logic for opening and closing cans;
- per-can state values for open and closed behaviour;
- subtle movement values to create a natural display effect;
- `lerp()` to smooth transitions so the movement does not feel too sudden.
In `perlin-noise-mechanic.js`, ChatGPT was used to better understand how Perlin Noise could be applied to colour transitions in p5.js and to support the implementation of the Perlin Noise Colour Variation mechanic used for the can bodies, labels, and frames.

All final coding decisions, implementation, testing, and integration were completed by the project team.

## External References

### Ming Chen — User Input Mechanic

This team member was responsible for the user input mechanic. This mechanic uses mouse interaction to allow the viewer to select a specific can in the grid.

The main rule is that the user can only pour a can when its mouth is already open. If the selected can is closed, it will not pour. This makes the mouse interaction depend on the time-based mechanic, so the user input and timed system work together rather than acting as separate effects.

The purpose of this mechanic is to make the viewer actively observe the grid. The interaction is simple, but it creates attention and timing. The user has to identify which can is available and then interact with it at the right moment.

Key techniques used:

- mouse position checking for can selection;
- selected-can state variables;
- conditional logic to check whether a can is open before pouring;
- pouring animation when the selected can is open;
- `lerp()` to smooth selection and pouring movement.

### Zane Zhang — Audio Mechanic

Zane was responsible for the audio mechanic. This mechanic uses p5.sound to analyse uploaded audio files and microphone input. The analysed sound data changes the visual state of the cans.

The audio mechanic mainly affects the cans through shaking and twisted deformation within the frame. Louder or more energetic audio creates stronger movement, while quieter audio creates a smaller response. Microphone input allows the work to respond to live sound, while uploaded audio allows the user to test the work with a chosen track.

The purpose of this mechanic is to make the gallery image feel physically affected by sound. The cans do not generate sound themselves. Instead, sound becomes a force that disturbs the repeated pop-art grid.

Key techniques used:

- `p5.Amplitude()` for overall audio level;
- `p5.FFT()` for frequency-based analysis;
- uploaded audio input;
- microphone input;
- smoothed audio values to avoid harsh or uncomfortable shaking;
- audio-driven movement and twisted can deformation.

### Yang Zhang — Perlin Noise Mechanic

Yang Zhang was responsible for the Perlin noise mechanic. In the final project, this mechanic mainly controls the colour behaviour of the cans.

Perlin noise is used because it creates smoother, more natural changes than pure random values. Instead of colours changing suddenly, the colours shift gradually across time and across the grid. This helps the repeated cans feel alive while still keeping the gallery composition readable.

The purpose of this mechanic is to introduce controlled colour variation into the repeated structure. Warhol's original work depends on repetition, but our version allows colour to move and change inside that repetition. This keeps the pop-art reference clear while adding a digital layer.

Key techniques used:

Key techniques used:

- `noise()` for smooth colour variation;
- `frameCount` to animate colour transitions over time;
- unique seed values for different cans;
- gradual colour shifting across a warm colour palette;
- controlled variation so the grid remains visually coherent.

---

- The Coding Train – Perlin Noise:
  https://www.youtube.com/watch?v=IKB1hWWedMk

- p5.js Reference – noise():
  https://p5js.org/reference/#/p5/noise
## Interaction Instructions

Open `index.html` in a browser, or run the project through a local server and visit the project page.

### Basic Viewing

- Watch the cans change over time.
- The time-based mechanic automatically opens and closes cans.
- The display also includes subtle natural movement so the grid does not feel completely static.

### Mouse Interaction

- Move the mouse over the grid to select a specific can.
- If the selected can is open, the user can pour out its contents.
- If the selected can is closed, it will not pour.
- This means the user needs to react to the changing open/closed states of the cans.

### Audio Interaction

- Press `U` to upload an audio file.
- Use the audio playback controls in the sketch.
- Press the `space bar` to pause or resume the uploaded audio.
- Use microphone mode to let live sound affect the artwork.
- Audio and microphone input change the cans through shaking and twisted deformation.

### Keyboard Interaction

- Press `M` to toggle the extra audio or movement response.
- Press `R` to rebuild or refresh the grid with new random/seeded variation.


---

## AI Acknowledgement

The overall creative concept, artwork selection, mechanic design, and interaction logic were developed through group discussion. AI tools were not used to create the main idea of the project or to decide the four mechanics.

AI tools, including ChatGPT, were used only as coding support for some parts of the implementation. For example, AI assistance was used to help implement or debug specific functions, check code structure, resolve technical issues, and improve code comments. The team reviewed and adjusted the AI-assisted code so that it matched the project direction and the techniques we were using in p5.js.

All AI-assisted code sections are acknowledged directly in the code comments. These comments explain which parts received AI support and what those parts do.

AI was not used to replace the team's own creative decision-making. It was used as a technical support tool during implementation.

---

## External References

### p5.js

https://p5js.org/

p5.js was used for canvas drawing, animation, colour, transformations, mouse input, keyboard input, time functions, random values, Perlin noise, and the main creative coding structure.

### p5.sound

https://p5js.org/reference/p5.sound/

p5.sound was used for uploaded audio, microphone input, amplitude analysis, and FFT frequency analysis. These values allow sound to affect the visual state of the cans.

### p5.FFT Reference

https://p5js.org/reference/p5.sound/p5.FFT/

This reference was used to understand how `p5.FFT()` analyses frequency data from uploaded audio or microphone input. In our project, FFT values help control visual shaking and twisted can deformation.

### p5.AudioIn Reference

https://p5js.org/reference/p5.sound/p5.AudioIn/

This reference was used to understand how microphone input works in p5.sound. In our project, microphone input allows live sound to affect the cans visually through movement and deformation.

### Andy Warhol, *Campbell's Soup Cans*

https://www.moma.org/collection/works/79809

Warhol's *Campbell's Soup Cans* was used as the main visual and conceptual inspiration. The repeated soup can grid, commercial label style, pop-art colour language, and gallery context shaped the visual direction of the project.