"use strict";

window.addEventListener("load",function() {

  const bgColor = '#000';
  const rayHex = 15; // circumradius of hexagon

  let canv, ctx;   // canvas and context : global variables (I know :( )
  let maxx, maxy;  // canvas sizes (in pixels)
  let nbx, nby;    // number of columns / rows
  let grid;

// for animation
  let events = [];
  let mouse = {};
  let explorers; // array of alive Explorers

// shortcuts for Math.

  const mrandom = Math.random;
  const mfloor = Math.floor;
  const mround = Math.round;
  const mceil = Math.ceil;
  const mabs = Math.abs;
  const mmin = Math.min;
  const mmax = Math.max;

  const mPI = Math.PI;
  const mPIS2 = Math.PI / 2;
  const m2PI = Math.PI * 2;
  const msin = Math.sin;
  const mcos = Math.cos;
  const matan2 = Math.atan2;
  const mtan = Math.tan;

  const mhypot = Math.hypot;
  const msqrt = Math.sqrt;

  const rac3   = msqrt(3);
  const rac3s2 = rac3 / 2;
  const mPIS3 = Math.PI / 3;

//-----------------------------------------------------------------------------
  function alea (min, max) {
// random number [min..max[ . If no max is provided, [0..min[

    if (typeof max == 'undefined') return min * mrandom();
    return min + (max - min) * mrandom();
  }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function intAlea (min, max) {
// random integer number [min..max[ . If no max is provided, [0..min[

    if (typeof max == 'undefined') {
      max = min; min = 0;
    }
    return mfloor(min + (max - min) * mrandom());
  } // intAlea

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function randomOrder (n) {
  /* returns an array with values 0..n-1 in any order */
    let ar = Array.from(new Array(n).keys());
    return arrayShuffle(ar);
  } // randomOrder

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  function arrayShuffle (array) {
/* randomly changes the order of items in an array
   only the order is modified, not the elements
*/
  let k1, temp;
  for (let k = array.length - 1; k >= 1; --k) {
    k1 = intAlea(0, k + 1);
    temp = array[k];
    array[k] = array[k1];
    array[k1] = temp;
    } // for k
  return array
  } // arrayShuffle

//------------------------------------------------------------------------
// class Hexagon
let Hexagon;
{ // scope for Hexagon

let vertices;
let orgx, orgy;

Hexagon = function (kx, ky) {

  this.kx = kx;
  this.ky = ky;
  this.neighbours = [];

} // function Hexagon

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/* static method */

Hexagon.dimensions = function () {
// coordinates of center of hexagon [0][0]
  orgx = (maxx - rayHex * (1.5 * nbx + 0.5)) / 2  + rayHex; // obvious, no ?
  orgy = (maxy - (rayHex * rac3 * (nby + 0.5))) / 2 + rayHex * rac3; // yet more obvious

/* position of hexagon vertices, relative to its center */
  vertices = [[],[],[],[],[],[]] ;
// x coordinates, from left to right
  vertices[3][0] = - (rayHex + 0.5);
  vertices[2][0] = vertices[4][0] = - (rayHex + 0.5) / 2;
  vertices[1][0] = vertices[5][0] = + (rayHex + 0.5) / 2;
  vertices[0][0] = (rayHex + 0.5);
// y coordinates, from top to bottom
  vertices[4][1] = vertices[5][1] = - (rayHex + 0.5) * rac3s2;
  vertices[0][1] = vertices[3][1] = 0;
  vertices[1][1] = vertices[2][1] = (rayHex + 0.5) * rac3s2;
} // Hexagon.dimensions

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Hexagon.prototype.size = function() {
/* computes screen sizes / positions
*/
// centre
  this.xc = orgx + this.kx * 1.5 * rayHex;
  this.yc = orgy + this.ky * rayHex * rac3;
  if (this.kx & 1) this.yc -= rayHex * rac3s2; // odd columns

  this.vertices = [[],[],[],[],[],[]] ;

// x coordinates of this hexagon vertices
  this.vertices[3][0] = this.xc + vertices[3][0];
  this.vertices[2][0] = this.vertices[4][0] = this.xc + vertices[2][0];
  this.vertices[1][0] = this.vertices[5][0] = this.xc + vertices[1][0];;
  this.vertices[0][0] = this.xc + vertices[0][0];;
// y coordinates of this hexagon vertices
  this.vertices[4][1] = this.vertices[5][1] = this.yc + vertices[4][1];
  this.vertices[0][1] = this.vertices[3][1] = this.yc + vertices[0][1];
  this.vertices[1][1] = this.vertices[2][1] = this.yc + vertices[1][1];

} // Hexagon.prototype.size

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Hexagon.prototype.drawHexagon = function(hue) {

  if (! this.vertices) this.size();
  let ctxGrid = ctx;
    ctxGrid.beginPath();
    ctxGrid.moveTo (this.vertices[0][0], this.vertices[0][1]);
    ctxGrid.lineTo (this.vertices[1][0], this.vertices[1][1]);
    ctxGrid.lineTo (this.vertices[2][0], this.vertices[2][1]);
    ctxGrid.lineTo (this.vertices[3][0], this.vertices[3][1]);
    ctxGrid.lineTo (this.vertices[4][0], this.vertices[4][1]);
    ctxGrid.lineTo (this.vertices[5][0], this.vertices[5][1]);
    ctxGrid.lineTo (this.vertices[0][0], this.vertices[0][1]);
    ctxGrid.strokeStyle = '#8FF';
    ctxGrid.lineWidth = 0.5;
    ctxGrid.fillStyle = `hsl(${hue},100%,60%)`;
    ctxGrid.fill();
} // Hexagon.prototype.drawHexagon

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Hexagon.prototype.drawSide = function(side) {

let s2 = (side + 1) % 6;

  if (! this.vertices) this.size();

  let ctxGrid = ctx;
    ctxGrid.beginPath();

    ctxGrid.moveTo (this.vertices[side][0], this.vertices[side][1]);
    ctxGrid.lineTo (this.vertices[s2][0], this.vertices[s2][1]);
    ctxGrid.strokeStyle = '#8FF';
    ctxGrid.lineWidth = 0.5;
//    ctxGrid.fillStyle = `hsl(${hue},100%,60%)`;
    ctxGrid.stroke();
} // Hexagon.prototype.drawHexagon

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/* returns a cell's neighbour
  keep track of it for future request
  defines itself as its neighbour's neighbour to reduce calculations

  returns false if no neighbour
*/

Hexagon.prototype.neighbour = function(side) {

  let neigh = this.neighbours[side];
  if (neigh instanceof(Hexagon)) return neigh; // known neighbour
  if (neigh === false) return false; // known for no neighbour
//  do not know yet

  if (this.kx & 1) {
    neigh =  {kx: this.kx + [1, 0, -1, -1, 0, 1][side],
              ky: this.ky + [0, 1, 0, -1, -1, -1][side]};
  } else {
    neigh = {kx: this.kx + [1, 0, -1, -1, 0, 1][side],
             ky: this.ky + [1, 1, 1, 0, -1, 0][side]};
  }
  if (neigh.kx < 0 || neigh.ky <0 || neigh.kx >= nbx || neigh.ky >= nby) {
    this.neighbours[side] = false;
    return false;
  }
  neigh = grid[neigh.ky][neigh.kx];
  this.neighbours[side] = neigh;
  neigh.neighbours[(side + 3) % 6] = this;
  return neigh;

} // Hexagon.prototype.neighbour

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Hexagon.whichHexagon = function(x, y) { // static method
/* needs optimization !!! */
/* finds in which hexagon is the point of coordinates (x, y)
returns false (if none) or hexagon
*/
let xv, yv, neigh;
let kx, ky;
// find column approximately
  kx = mround ((x - orgx) / 1.5 / rayHex);
// if this was the right column, the line would be...
  ky = mround ( (y - orgy) / rayHex / rac3 + (kx & 1) * 0.5);

// kx, ky may be out of the grid even if the point is inside
  let xc = orgx + kx * 1.5 * rayHex;
  let yc = orgy + ky * rayHex * rac3;
  if (kx & 1) yc -= rayHex * rac3s2;

  let dir = matan2(y - yc, x - xc); // -PI to PI
  if (dir < 0) dir += m2PI;        // 0 to  2 PI
  dir = mfloor(3 * dir / mPI) % 6  // 0 to 5
// change for neighbour hexagon

  switch (dir) {
    case 0 : xv = 1.5 * rayHex;
             yv = rac3s2 * rayHex;
             break;
    case 1 : xv = 0;
             yv = rac3 * rayHex;
             break;
    case 2 : xv = -1.5 * rayHex;
             yv = rac3s2 * rayHex;
             break;
    case 3 : xv = -1.5 * rayHex;
             yv = -rac3s2 * rayHex;
             break;
    case 4 : xv = 0;
             yv = -rac3 * rayHex;
             break;
    case 5 : xv = 1.5 * rayHex;
             yv = -rac3s2 * rayHex;
             break;
  }
  let da = mhypot(x - xc, y - yc);
  let db = mhypot(x - xv - xc, y - yv - yc);
  if (db < da) { // change for neighbour hexagon
    if (kx & 1) {
      neigh =  {kx: kx + [1, 0, -1, -1, 0, 1][dir],
                ky: ky + [0, 1, 0, -1, -1, -1][dir]};
    } else {
      neigh = {kx: kx + [1, 0, -1, -1, 0, 1][dir],
               ky: ky + [1, 1, 1, 0, -1, 0][dir]};
    }
    ({kx, ky} = neigh);
  }

  if (kx < 0 || ky < 0 || kx >= nbx || ky >= nby) return false;

  return grid[ky][kx];

} // whichHaxagon

} // scope for Hexagon

//------------------------------------------------------------------------

function createGrid() {
/* create the grid of Hexagons
  and defines the number of dots on each side of the hexagons
  but does NOT define the crossings between dots inside an hexagon
*/
  let hexa;
  grid = [];

  for (let ky = 0; ky < nby; ++ky) {
    grid[ky] = []
    for (let kx = 0; kx < nbx; ++kx) {
      hexa = new Hexagon(kx, ky);
      grid[ky][kx] = hexa;
    } // for kx
  } // for ky
} // createGrid


//------------------------------------------------------------------------
function createMaze() {

// create list of all cells
// and note all sides of all cells are blocked
// and generate a try order

  let cell, side, neigh;
  let kFound;

  let maxDepth = 0;

  let unreachableCells = [];
  let adjCells = [];

  grid.forEach(line => {
    line.forEach( cell => {
      cell.blocked =[true, true, true, true, true, true];
      cell.inMaze = false;
      cell.tryOrder = randomOrder(6);
      unreachableCells.push(cell);
    }); // line.forEach
  }) // grid.forEach

  arrayShuffle(unreachableCells);
  cell = unreachableCells.pop(); // starting cell
  cell.depth = 0;
  addAdj(cell);

  while (adjCells.length) {
    kFound = undefined;
    arrayShuffle(adjCells);
findOne:
    for (let k = adjCells.length - 1; k >= 0; --k) {
      cell = adjCells[k];
      for (let kside = 0; kside < 6; ++kside) {
        side = cell.tryOrder[kside];
        neigh = cell.neighbour(side);
        if (!neigh) continue;      // no neighbour here, don't try
        if (! neigh.inMaze) continue; // not in maze, don't take this one
        kFound = k; // remember index of found element
        break findOne;
      } // for kside
    } // for k
    if (kFound===undefined) throw ('Bug in createMaze : found no possibility');

    cell.blocked[side] = false;
    neigh.blocked[(side + 3) % 6] = false;
    cell.depth = neigh.depth + 1;
    if (cell.depth > maxDepth) maxDepth = cell.depth;
    adjCells.splice(kFound, 1); // remove from adjCells
    addAdj(cell); // add its neighbours to adjCells

  } // while

/* given cell has been found to belong to the maze
its neighbours from the "unreachable" list are added to the 'adjacent' list
*/
  function addAdj (cell) {
    let nei, idx;
    cell.inMaze = true;
    for (let k = 0; k < 6; ++k) {
      nei = cell.neighbour(k);
      if (nei === false) continue; // no neighbour on that side
      idx = unreachableCells.indexOf(nei); // where is neighbour in list of unreachable ?
      if (idx == -1) continue; // not found
      unreachableCells.splice(idx, 1); // remove from unreachableCells
      adjCells.push(nei); // add to adjacent cells
    } // for k
  } // addAdj
} // createMaze

//------------------------------------------------------------------------

function Explorer(cell, hue) {
// creates a new explorer
  this.cell = cell;
  this.hue = hue;
  this.mark();

}  // Explorer

Explorer.prototype.mark = function() {
  this.cell.explored = true;
  this.cell.drawHexagon(this.hue);
}

Explorer.prototype.explore = function() {
  /* 
  - if this explorer's cell has at least one accessible, not yet explored, neighbour,
  moves to it
  - creates Explorers for other accessible, not yet explored cells
  - returns false if there was no possible neighbour
*/
  let me, side;

  let order = randomOrder(6);
  let cell = this.cell;

  for (let k = 0; k < 6; ++k) {
    side = order[k];
    if (! cell.blocked[side] && !cell.neighbour(side).explored) { // can be explored !
      if (!me) me = cell.neighbour(side);
      else explorers.push(new Explorer(cell.neighbour(side), (this.hue + intAlea(5,10) % 360)));
    }
  } // for k
  if (! me) return false; // end of this explorer
  this.cell = me;         // moves to new cell
  this.mark();
  return true;
} // Explorer.prototype.explore

//------------------------------------------------------------------------
function launchExploration(x, y) {
/* returns true if exploration succesfuly launched
   x, y is the mouse position
*/

  if (x===undefined) { // for first run
    x = maxx / 2;
    y = maxy / 2;
  }
  let cell = Hexagon.whichHexagon(x, y);
  if (! (cell instanceof Hexagon)) return false; // impossible
// mark all cells as unexplored
  grid.forEach(line => {
    line.forEach(cell => {
      cell.explored = false;
    }); // line.forEach
  }) // grid.forEach


  explorers = [new Explorer(cell, intAlea(360))];
  return true;
}

//------------------------------------------------------------------------
//-----------------------------------------------------------------------------
// returns false if nothing can be done, true if preparation done

function startOver() {

  maxx = window.innerWidth;
  maxy = window.innerHeight;

  let orgLeft = mmax (((window.innerWidth ) - maxx) / 2, 0);
  let orgTop = mmax (((window.innerHeight ) - maxy) / 2, 0);
  canv.style.left = orgLeft + 'px';
  canv.style.top = orgTop + 'px';

  canv.width = maxx;
  canv.height = maxy;
  ctx.lineCap = 'round';   // placed here because reset when canvas resized

// number of columns / rows
// computed to have (0,0) in top leftmost corner
// and for all hexagons to be fully contained in canvas

  nbx = mfloor(((maxx / rayHex) - 0.5) / 1.5);
  nby = mfloor(maxy / rayHex / rac3 - 0.5); //


  nbx += 3; // to have canvas fully coverd by hexagons
  nby += 3;
  if (nbx <= 3 || nby <= 3) return; // nothing to do

//  nbx = 3; nby = 3;

  Hexagon.dimensions();

  createGrid();
  createMaze();

//  ctx.fillStyle = bgColor;
//  ctx.fillRect(0, 0, maxx, maxy);

  grid.forEach(line => {
    line.forEach(cell => {
      cell.blocked.forEach ((bl, side) => {
        if (bl) cell.drawSide(side);
      });
    }); // line.forEach
  }) // grid.forEach

  return true; // ok

} // startOver

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function clickCanvas(event) {
  if (event.target.tagName == 'CANVAS') {
    events.push('click');
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  }
}

//------------------------------------------------------------------------
let animate;
{
  let animState = 0;

  animate = function(tStamp) {

    const event = events.shift();

    window.requestAnimationFrame(animate);

//    if (event == 'click') animState = 0; // reset animation

    switch (animState) {
      case 0 :
        if (startOver()) ++animState;
        break;
      case 1 :
//        if (event !== 'click') break; // waiting for click
//        mouse.x = maxx/2; mouse.y = maxy / 2;
        if (launchExploration (mouse.x, mouse.y)) ++animState;
        break;
      case 2 :     // exploring
        if (explorers.length == 0) {
          ++animState;  // finished...
          break;
        }
        explorers.forEach((expl, k) => {
          if (!expl. explore()) explorers.splice(k, 1); // remove finihed explorers
        }) // explorers.forEach
        break;

      case 3 : // waiting for click to reset
        if (event !== 'click') break; // waiting for click
        animState = 0;
//        events.push('click'); // so that user is not obliged to click again
        break;
    } // switch animState
  } // animate
} // scope for animate

//------------------------------------------------------------------------
function reset() {
  events.push('click');
}
//------------------------------------------------------------------------
//------------------------------------------------------------------------
// beginning of execution

  {
    canv = document.createElement('canvas');
    canv.style.position="absolute";
    document.body.appendChild(canv);
    ctx = canv.getContext('2d');
  } // canvas creation
  canv.setAttribute ('title','click me');
  window.addEventListener('click',clickCanvas);
//  canv.addEventListener('mousemove',mouseMove);
// launch animation
  reset();
  window.requestAnimationFrame(animate);
}); // window load listener