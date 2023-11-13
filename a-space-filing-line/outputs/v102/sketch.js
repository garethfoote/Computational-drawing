let randMin = 4
let randMax = 4
let gridSize = 40
let padding = 100
let debug = false

let colours = ["#EF476F", "#FFD166", "#06D6A0", "#118AB2", "#073B4C"]

function setup(){
  createCanvas(1500, 1500)
  noLoop();
}

function draw(){
  // background("#000")
  let allLines = []
  let x = padding;
  let y = padding;

  // Make grid
  let grid = []
  x = padding;
  while(x < width-padding){
    y = padding;
    while(y < height-padding){
      grid.push([x+gridSize/2,y+gridSize/2])
     y += gridSize; 
    }
    x += gridSize;
  }
  
  // Shuffle the grid and fill most of the spaces
  grid = shuffle(grid);
  for(let i = 0; i < Math.round(grid.length*0.5); i++){
    // let newLines = aSpaceFilingLine(allLines, [grid[i][0], grid[i][1]], random(3, 20), random(3, 20))

    let rDash = round(random(0,1));
    let dashGaps = [[30,40],[3, 5]]
    let dash = random(5, 50);
    let gap = Math.min(dash, random(3, 20));
    let newLines = aSpaceFilingLine(
      allLines, 
      [grid[i][0], grid[i][1]], 
      dashGaps[rDash][1], 
      dashGaps[rDash][0])
    allLines = [...newLines, ...allLines];
  }

  // Start in bottom right corner and work back up
  // y = height-(padding);
  // x = width*0.5;
  // while(y > padding){
  //   // x -= gridSize
  //   let dash = random(3, 50);
  //   let gap = Math.min(dash, random(3, 7));
  //   let newLines = aSpaceFilingLine(allLines, [x-gridSize/2, y-gridSize/2], dash, gap)
  //   ellipse(x-gridSize/2, y-gridSize/2, 10)
  //   allLines = [...newLines, ...allLines];
  //   y -= gridSize
  // }
  
  // Draw a couple of individual lines. Manual starting x,y  
  // let newLines = aSpaceFilingLine(allLines, [400, 400], 10, 10)
  // allLines = [...newLines, ...allLines];
  // let newLines = aSpaceFilingLine(allLines, [10, 10], random(3, 20), 20);
  // allLines = [...newLines, ...allLines];

  // DRAW LINES immediately with variable colours
//   while(x < width){
//     x += gridSize;
//     let newLines = aSpaceFilingLine(
//       allLines, 
//       [x+gridSize/2, height/2], 
//       random(3, 30), 3);
    
//     newLines.forEach(([x1, y1, x2, y2]) => {
//       // stroke(colours[Math.round(x/gridSize) % colours.length]); 
//       line(x1, y1, x2, y2);
//     })
//     // allLines = [...newLines, ...allLines];
//   }

  
  // DRAW ALL THE LINES
  allLines.forEach(([x1, y1, x2, y2, isOutOfBounds]) => {
    stroke((isOutOfBounds) ? "red" : "black"); 
    line(x1, y1, x2, y2);
  })
  
  noFill();
  // rect(padding, padding, width-(padding*2), height-(padding*2)  )
}

function inBounds(v, r, mag){
    // Calculate new x and y position
  let newX = v.x + mag * cos(r);
  let newY = v.y + mag * sin(r);

  return (
    newX > padding && 
    newY > padding && 
    newX < width-padding && 
    newY < height-padding
  );
}

function aSpaceFilingLine(allPreviousLines, startV, dash, gap){
  let noiseMultiplier = random(0.007, 0.02);
  let anyIntersections = false;
  let currV;
  let myLine = [];
  let noiseX = random(randMin, randMax);
  let noiseY = random(-100, 100);

  let cl = colours[Math.floor(random(0,colours.length-1))]
  
  if(debug){
    // Starting point
    fill(cl);
    rect(startV[0], startV[1], 5, 5);
  }
  
  // First, totally random direction.
  // let randR = random(0, TWO_PI); 
  // let newX = startV[0] + dash * cos(randR);
  // let newY = startV[1] + dash * sin(randR);
  // myLine.push([startV[0], startV[1], newX, newY]);
  // let nextX = newX + gap * cos(randR);
  // let nextY = newY + gap * sin(randR);
  // currV = createVector(nextX, nextY);
  currV = createVector(startV[0], startV[1]);
  
  while(anyIntersections === false){
    // Get direction - perlin
    // scaling noise by 2 because otherwise 
    // values don't get near to 1.
    noiseX += random(randMin, randMax);
    let n = noise(noiseX * noiseMultiplier, noiseY) * 2;
    let rB = map(n, 0, 1, 0, TWO_PI);    
    
    let i = 360;
    while(i > 0 && inBounds(currV, rB, dash) === false){
      i--;
      noiseX += random(randMin, randMax);
      let n = noise(noiseX * noiseMultiplier, noiseY) * 2;
      rB = map(n, 0, 1, 0, TWO_PI)
      if(i == 1){
        console.log("manual break")
        fill(cl);
        ellipse(currV.x, currV.y, 50);
      } else {
        if(debug){
          // Boundary correction
          fill(cl);
          ellipse(currV.x, currV.y, 20);  
        }
      }
    }
    
    // Get mark between currV & new dir
    let newX = currV.x + dash * cos(rB);
    let newY = currV.y + dash * sin(rB);

    if(lineIntersections(allPreviousLines, currV.x, currV.y, newX, newY).length > 0){
      anyIntersections = true;
      if(debug){
        // Intersects an old line
        fill(cl);
        // ellipse(newX, newY, 10);
        simpleTriangle(newX, newY, 30, "down")
      }
      console.log("intersects an old line")
    } 

    if(lineIntersections(myLine, currV.x, currV.y, newX, newY).length > 0){
      anyIntersections = true;
      if(debug){
        // Intersects itself
        fill(cl);
        simpleTriangle(newX, newY, 30)
        
      }
      console.log("intersects itself")
    } else {
      myLine.push([currV.x, currV.y, newX, newY, i<=1])
      let nextX = newX + gap * cos(rB);
      let nextY = newY + gap * sin(rB);
      currV = createVector(nextX, nextY);
    }
  }
  return myLine;
}

// returns multiple vectors 
// or empty array if no intersections
function lineIntersections(lines, x3, y3, x4, y4){
  let iPoints = [];
  lines.forEach(([x1, y1, x2, y2]) => {
    let iP = intersectionPt(x1, x2, x3, x4, y1, y2, y3, y4);
    if(iP.length > 0){
      iPoints.push(iP)
    }
  })
  return iPoints;
}

//Code heavily taken from Example Code and Explanations by Paul Bourke at http://paulbourke.net/geometry/pointlineplane/
//
//Function to test for intersections between line segments:
function intersectionPt(x1,x2,x3,x4,y1,y2,y3,y4){
  let intx = 0;
  let inty = 0;
  
	var uA,uB;
  var den,numA,numB;

  den  = (y4-y3) * (x2-x1) - (x4-x3) * (y2-y1);
  numA = (x4-x3) * (y1-y3) - (y4-y3) * (x1-x3);
  numB = (x2-x1) * (y1-y3) - (y2-y1) * (x1-x3);
  
  //Coincident? - If true, displays intersection in center of line segment
   if (abs(numA) == 0 && abs(numB) == 0 && abs(den) == 0) {
      intx = (x1 + x2) / 2;
      inty = (y1 + y2) / 2;
      return [intx, inty];
   }

   //Parallel? - No intersection
   if (abs(den) == 0) {
      return [];
   }

   //Intersection?
   uA = numA / den;
   uB = numB / den;
  
   //If both lie w/in the range of 0 to 1 then the intersection point is within both line segments.
   if (uA < 0 || uA > 1 || uB < 0 || uB > 1) {
      return [];
   }
  
   intx = x1 + uA * (x2 - x1);
   inty = y1 + uA * (y2 - y1);
   return [intx, inty];
}

function radiansToDegrees(radians) {
  return radians * (180 / Math.PI);
}

// declare the function 
function shuffle(array) { 
  for (let i = array.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [array[i], array[j]] = [array[j], array[i]]; 
  } 
  return array; 
}; 


function simpleTriangle(x, y, size, direction){
  if(direction == "down"){
    triangle(x, y, x-(size)/2, y-(size/2), x+(size)/2, y-(size/2))
  } else {
    triangle(x, y, x-(size)/2, y+(size/2), x+(size)/2, y+(size/2))
  }
}
