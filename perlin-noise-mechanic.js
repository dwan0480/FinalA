/*
Perlin Noise Colour Mechanic

This code was developed after learning about Perlin Noise
and the p5.js noise() function.

References:

The Coding Train – Perlin Noise in p5.js
https://www.youtube.com/watch?v=Qf4dIN99e2w

The Coding Train – Perlin Noise in Two Dimensions (p5.js)
https://www.youtube.com/watch?v=ikwNrFvnL3g

The implementation was adapted and simplified for the
Interactive Soup Cans project.

Rather than using random colour changes, Perlin Noise
creates smooth and organic transitions over time.

The original examples were modified to create a warm
Campbell's-inspired colour palette that transitions
through dark red, red, orange and gold.

Author contribution:
- Researched Perlin Noise animation techniques
- Implemented colour transitions using p5.js noise()
- Designed a custom warm colour palette
- Added brightness variation to create a breathing effect
*/


// Returns a smooth Perlin Noise value for each can.
// Unlike random(), noise() changes gradually over time,
// creating continuous and natural animation.
function getPerlinColourAmount(can) {

    return noise(
        can.seed + 999,
        frameCount * 0.01
    );

}


// Maps the Perlin Noise value to a warm colour palette.
// Colours transition through:
// dark red → red → orange → gold.
function getPerlinHue(can) {

    const n = getPerlinColourAmount(can);

    if (n < 0.25) {

        return map(
            n,
            0,
            0.25,
            350,
            360
        );

    }

    if (n < 0.6) {

        return map(
            n,
            0.25,
            0.6,
            0,
            18
        );

    }

    return map(
        n,
        0.6,
        1,
        18,
        45
    );

}


// Uses the same noise value to vary brightness.
// This creates a subtle breathing effect that makes
// each soup can feel more alive and dynamic.
function getPerlinBrightness(can) {

    return map(
        getPerlinColourAmount(can),
        0,
        1,
        55,
        100
    );

}


// Applies the same hue animation to the label text
// so the label remains visually connected to the can body.
function getPerlinLabelHue(can) {

    return getPerlinHue(can);

}


// Keeps the label brightness constant for readability
// while still allowing the label colour to animate.
function getPerlinLabelBrightness(can) {

    return 100;

}