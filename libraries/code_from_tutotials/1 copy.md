let svg = document.getElementById("basesvg");

let circleXPos = 200;
let circleYPos = 200;
let radius = 100;

//This defines how much of the circle we want to draw in radians
//In this case it is Math.PI / 2 radians, or 90 degrees, or 1/4 of the circle
let segmentRadians = Math.PI / 2;

//The  segment starts from angle 0, as we know this is 3 o'clock on the circle
let startAngle = 0;

//The end angle is just the start angle plus the segmentRadians
//As this is Math.PI / 2 radians, or 90 degrees, the end will be 6 0'clock
let endAngle = segmentRadians;

//Calculate the start and end positions of the path (segment) using the start and end angles
let startXPos = circleXPos + radius * Math.cos(startAngle);
let startYpos = circleYPos + radius * Math.sin(startAngle);
let endXPos = circleXPos + radius * Math.cos(endAngle);
let endYpos = circleYPos + radius * Math.sin(endAngle);

//Draw the path that represents the segment
//First we need a path element
let segment = document.createElementNS("http://www.w3.org/2000/svg", "path");
/*
    Lets look in detail at how we can use the path type to draw segments of a circle

    The "d" attribute of the path is the path data, everything after the comma is what this will be set to
    The "M" means move to, this is where we start to draw the path (the x and y position)
    The "A" means Arc to, so we are drawing a curve
    The curve could be from an ellipse so it needs a radius for the x and y axis, 
    in our case they are the same because we are drawing a regular circle
    The first 0 means we are NOT rotating the circle, 
    The next 0 means a normal arc size, not a large arc size
    The 1 means we are drawing the circle in a positive (clockwise) direction
    The last two numbers are the end position of the arc
    We use the backtick notation to put our variables in the string that defines the path
    */
segment.setAttribute("d",`M ${startXPos} ${startYpos} A ${radius} ${radius} 0 0 1 ${endXPos} ${endYpos}`);
segment.setAttribute("stroke", "black");
segment.setAttribute("stroke-width", 2);
segment.setAttribute("fill", "none");

svg.appendChild(segment);