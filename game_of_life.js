const canv = document.getElementById('game_container');
const ctx = canv.getContext('2d');

const colors = {
  black: '#333',
  grey: 'grey',
  white: 'white'
};

let frame = 0;
const frames_per_second = 30;
const rate_of_evolution = 10; // times per second;

let tiles = 100;
let gridDist = canv.width / tiles;

let states = [];
let new_state = false;

let update_cells = false;
let cells = {};
let living_cells = 0;
let generation = 0;

window.onload = init();

function updateTiles(num_tiles) {
	tiles = num_tiles;
	old_dist = gridDist;
	gridDist = canv.width / tiles;

	let grid_label = document.getElementById('gridsize');
	grid_label.value = num_tiles;

	let grid_range = document.getElementById('gridrange');
	grid_range.value = num_tiles;

	// let cellnames = Object.keys(cells);
  // for (var i = 0; i < cellnames.length; i++) {
	// 	// TODO: RECALCULAR LAS POSICIONES
  //   cells[cellnames[i]][0] = ((cells[cellnames[i]][0] - (cells[cellnames[i]][0] % old_dist)) / old_dist) * gridDist;
	// 	cells[cellnames[i]][1] = ((cells[cellnames[i]][1] - (cells[cellnames[i]][1] % old_dist)) / old_dist) * gridDist;
  // }
}

function drawGrid() {
  rect(0, 0, canv.width, canv.height, colors.black);

  ctx.beginPath();

  let x = 0;
  for (var i = 0; i <= tiles; i++) {
    ctx.strokeStyle = colors.grey;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canv.height);
    ctx.moveTo(0, x);
    ctx.lineTo(canv.width, x);
    x = gridDist * i;
  }
  ctx.stroke();
}

function rect(x, y, sx, sy, color) {
  ctx.beginPath();
  ctx.rect(x, y, sx, sy);
  ctx.fillStyle = color;
  ctx.fill();
}

function addState() {
  let last_state = states.length - 1;
  let node = document.createElement('button');
  let state_slider = document.getElementById('staterange');
  state_slider.max = states.length - 1;
  state_slider.value = state_slider.max;

  new_state = false;
}

function updateStats() {
  let cellcount = document.getElementById('cellcount');
  cellcount.value = living_cells;

  let gens = document.getElementById('generation');
  gens.value = generation;
}

function reset() {
  update_cells = false;
  cells = {}
  states = [];
  living_cells = 0;
  generation = 0;
}

function clear() {
  let textarea = document.getElementById('textarea');
  let start_x = document.getElementById('start_x');
  let start_y = document.getElementById('start_y');

  textarea.value = '';
  start_x.value = 0;
  start_y.value = 0;
}

function setListeners() {
  let state_slider = document.getElementById('staterange');
  state_slider.addEventListener('input', function(event) {
    update_cells = false;
    cells = states[this.value].cells;
    living_cells = states[this.value].count;
    generation = this.value;
    updateStats();
  });

  let gridrange = document.getElementById('gridrange');
  gridrange.addEventListener('input', function(event) {
    updateTiles(this.value);
  });

  let reseter = document.getElementById('reset');
  reseter.addEventListener('click', reset);

  let clearer = document.getElementById('clear');
  clearer.addEventListener('click', clear);

  let load = document.getElementById('load');
  load.addEventListener('click', loader);

  let start = document.getElementById('start');
  start.addEventListener('click', function() {
    update_cells = true;
  });

  let stop = document.getElementById('stop');
  stop.addEventListener('click', function() {
    update_cells = false;
  });

  canv.addEventListener('click', function(event) {
    let tile_x = (event.x - (event.x % gridDist)) - gridDist;
    let tile_y = (event.y - (event.y % gridDist)) - gridDist;
    let tile_name = cellname(tile_x / gridDist, tile_y / gridDist);

    if (cells[tile_name]) {
      delete cells[tile_name];
      living_cells -= 1;

    } else {
      cells[cellname(tile_x / gridDist, tile_y / gridDist)] = [tile_x, tile_y];
      living_cells += 1;
    }
  });
}

function cellname(x, y) {
  return x + ', ' + y;
}

function init() {
	updateTiles(tiles);
  setListeners();
  setInterval(updateGame, 1000 / frames_per_second);
}

function drawCells() {
  let cellnames = Object.keys(cells);
  for (var i = 0; i < cellnames.length; i++) {
    if (cells[cellnames[i]]) {
      rect(cells[cellnames[i]][0], cells[cellnames[i]][1], gridDist, gridDist, colors.white);
    }
  }
}

function countLiveNeigbours(x, y) {
  let count = 0;
  for (var i = -1; i < 2; i++) {
    for (var j = -1; j < 2; j++) {
      if (i != 0 || j != 0) {
        if (cells[cellname(x + i, y + j)]) {
          count += 1;
        }
      }
    }
  }
  return count;
}

function updateCells() {
  let cellcount = 0;
  let next_state = {};

  for (var i = 0; i <= tiles; i++) {
    for (var j = 0; j <= tiles; j++) {
      let living = countLiveNeigbours(i, j);
      if (living === 3 || (living === 2 && cells[cellname(i, j)])) {
        cellcount += 1;
        next_state[cellname(i, j)] = [i * gridDist, j * gridDist];
      }
    }
  }

  new_state = true;
  update_cells = Object.keys(cells).sort().toString() != Object.keys(next_state).sort().toString();

  states.push({
    cells: JSON.parse(JSON.stringify(cells)),
    count: living_cells
  });

  cells = next_state;
  living_cells = cellcount;
  generation = Number(generation) + 1;
}

function updateGame() {
  frame += 1;
  drawGrid();
  drawCells();

  if (update_cells && (frame % (frames_per_second / rate_of_evolution) === 0)) {
    updateCells();

    if (new_state) {
      addState();
    }
  }

  updateStats();
}

function loader() {
  reset();

  let alive = 'O'.charCodeAt(0);
  let dead = '.'.charCodeAt(0);
  let nextline = '\n'.charCodeAt(0);

  let load_cells = document.getElementById('textarea').value;
  let load_at_x = Number(document.getElementById('start_x').value);
  let load_at_y = Number(document.getElementById('start_y').value);

  let x = load_at_x;
  let y = load_at_y;
  let cellcount = 0;
  let next_state = {};
  for (var i = 0; i < load_cells.length; i++) {
    let charcode = load_cells.charCodeAt(i);
    if (charcode === nextline) {
      x = load_at_x;
      y += 1;

    } else {
      if (charcode === alive) {
        next_state[cellname(x, y)] = [x * gridDist, y * gridDist];
        cellcount += 1;
      }
      x += 1;
    }
  }

  cells = next_state;
  living_cells = cellcount;
  generation = 0;
}
