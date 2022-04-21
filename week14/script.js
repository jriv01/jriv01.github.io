// Constants
const windowH = $(window).height();
const KEYLEFT = 37;
const KEYUP = 38;
const KEYRIGHT = 39;
const KEYDOWN = 40;

// Game vars
var gridWidth = 10;
var gridHeight = 20;

var fallRate = 1500;

var $tile = $("<div />", {
    id: "tile",
    class: "empty",
    width: .75 * windowH/gridHeight,
    height: .75 * windowH/gridHeight
});
var $row = $("<div />", {
    class: "row"
});
var $grid = $("#grid");

const createGrid = (w, h) => {
    for(let r = 0; r < h; r++) {
        let $newRow = $row.clone();
        for(let c = 0; c < w; c++) {
            $newRow.append($tile.clone());
        }
        $grid.append($newRow);
    }
}

const gameLoop = () => {
    mino.fall();
}

const getTileAt = (row, col) => {
    let curr = $grid.children().eq(row);
    return $(curr).children().eq(col);
}

createGrid(gridWidth, gridHeight);

var runGame = setInterval(gameLoop, fallRate);

class Tetromino {
    constructor(id, arrangement, row, col, size) {
        this.id = id;
        this.arr = arrangement;
        this.row = row;
        this.col = col;
        this.size = size;
        this.placed = false;
    }

    moveRight() {
        this.clear();
        this.col ++;
        this.draw();
    }

    moveLeft() {
        this.clear();
        this.col --;
        this.draw();
    }

    fall() {
        this.clear();
        if(!this.checkFallCollide()) {
            this.row ++;
            this.draw();
        } else {
            this.place();
        }
    }

    checkFallCollide() {
        for(let r = 0; r < this.arr.length; r++) {
            for(let c = 0; c < this.arr[r].length; c++) {
                let currRow = this.row + r;
                if(arr[r][c] && currRow + 1 >= gridHeight) return true;
            }
        }
        return false;
    }

    place() {
        for(let r = 0; r < this.arr.length; r++) {
            for(let c = 0; c < this.arr[r].length; c++) {
                let currRow = this.row + r;
                let currCol = this.col + c;
                if(arr[r][c]) getTileAt(currRow, currCol).attr("class", "filled");
            }
        }
        this.placed = true;
    }

    clear() {
        for(let r = 0; r < this.arr.length; r++) {
            for(let c = 0; c < this.arr[r].length; c++) {
                let currRow = this.row + r;
                let currCol = this.col + c;
                if(arr[r][c]) getTileAt(currRow, currCol).attr("class", "empty");
            }
        }
    }

    draw() {
        for(let r = 0; r < this.arr.length; r++) {
            for(let c = 0; c < this.arr[r].length; c++) {
                let currRow = this.row + r;
                let currCol = this.col + c;
                if(arr[r][c]) getTileAt(currRow, currCol).attr("class", "mino");
            }
        }
    }
}

var arr = [
    [0, 0, 0],
    [0, 1, 0],
    [1, 1, 1]
]

var mino = new Tetromino(0, arr, 0, 0, 3);
var nextMino = new Tetromino(0, arr, 0, 0, 3);
mino.draw();

$(document).keydown(function(event) {
    if(event.keyCode == KEYRIGHT){
        mino.moveRight();
    }
    else if(event.keyCode == KEYLEFT){
        mino.moveLeft();
    }
    if(event.keyCode == KEYDOWN) {
        mino.fall();
        if(mino.placed) {
            mino = nextMino;
            mino.draw();
            nextMino = new Tetromino(0, arr, 0, 0, 3);
        }
        clearInterval(runGame);
    }
});

$(document).keyup(function(event) {
    if(event.keyCode == KEYDOWN) runGame = setInterval(gameLoop, fallRate); 
});