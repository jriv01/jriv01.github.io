// Key press values
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_Z = 90;
const KEY_SPACE = 32;
const KEY_A = 65;
const KEY_SHIFT = 16;
const KEY_R = 82;

// Consts for setting up the game
const windowH = $(window).height();
const gridWidth  = 10;
const gridHeight = 20;
const fallRate = 1500;

const boxWidth = 4;
const boxHeight = 3;

// Piece arrangements
const T_PIECE = [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
];
const L_PIECE = [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
];
const J_PIECE = [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
];
const Z_PIECE = [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
];
const S_PIECE = [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
];
const O_PIECE = [
    [0, 1, 1],
    [0, 1, 1],
    [0, 0, 0]
];
const I_PIECE = [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
];
const MINO_LIST = [T_PIECE, L_PIECE, J_PIECE, Z_PIECE, S_PIECE, I_PIECE, O_PIECE];

// HTML elements
var $tile = $("<div />", {
    id: "tile",
    class: "empty",
    width: .75 * windowH/gridHeight,
    height: .75 * windowH/gridHeight
});
var $row = $("<div />", {
    class: "row"
});
var $nxt = $("<div />", {
    class: "display-box"
});
var $hold = $(".display-box");
var $grid = $("#grid");
var $nextCon = $("#next-container");
var $score = $(".score-box");

// Variables for playing the game
const nextSize = 4;
const comboBonus = 10;
const clearPoints = 50;
const dropBonus = 5;
var mino;
var ghost;
var heldId;
var canHold;
var nextMinos;
var runGame;
var gameOver;
var score;

// Class for a single Tetromino piece
class Tetromino {
    // Constructor
    constructor(id, arrangement, row, col, size) {
        this.id = id;
        this.arr = JSON.parse(JSON.stringify(arrangement));
        this.row = row;
        this.col = col;
        this.size = size;
        this.placed = false;
    }

    // Methods to adjust the piece left/right/down
    adjustRight(x) {
        for(let i = 0; i < x; i++) this.col ++;
    }

    adjustLeft(x) {
        for(let i = 0; i < x; i++) this.col --;
    }

    adjustDown(x) {
        for(let i = 0; i < x; i++) this.row ++;
    }

    // Move right
    moveRight() {
        this.drawTiles("empty");
        if(this.canMove(1)) this.adjustRight(1);
        this.drawTiles("mino");
    }

    // Move left
    moveLeft() {
        this.drawTiles("empty");
        if(this.canMove(-1)) this.adjustLeft(1);
        this.drawTiles("mino");
    }
    
    // Push off the left wall
    // Return how far we pushed
    pushOffLeft() {
        let res = 0;
        while(this.col < 0 && this.canMove(1)) {
            this.adjustRight(1);
            res ++;
        }
        return res;
    }

    // Push off the right wall
    // Return how far we pushed
    pushOffRight() {
        let res = 0;
        while(this.col + this.size-1 >= gridWidth && this.canMove(-1)) {
            this.adjustLeft(1);
            res ++;
        }
        return res;
    }

    // Rotate the piece CW
    rotateCW() {
        // If O piece, dont rotate
        if(this.id == 7) return;
        
        // Push off the walls
        this.drawTiles("empty");
        let rightCount = this.pushOffLeft();
        let leftCount = this.pushOffRight();

        // Try rotating
        this.rotateMatrixCW();
        if(!this.validLocation(0)) {
            this.rotateMatrixCCW();
            this.adjustLeft(rightCount);
            this.adjustRight(leftCount);
        }

        this.drawTiles("mino");
    }

    // Rotate the piece CCW
    rotateCCW() {
        // If O piece, dont rotate
        if(this.id == 7) return;

        // Push off the walls
        this.drawTiles("empty");
        let rightCount = this.pushOffLeft();
        let leftCount = this.pushOffRight();

        // Try rotating 
        this.rotateMatrixCCW();
        if(!this.validLocation(0)) {
            this.rotateMatrixCW();
            this.adjustLeft(rightCount);
            this.adjustRight(leftCount);
        }

        this.drawTiles("mino");
    }

    // Rotate the piece 180 degrees
    rotate180() {
        // If O piece, dont rotate
        if(this.id == 7) return;

        // Push off the walls
        this.drawTiles("empty");
        let rightCount = this.pushOffLeft();
        let leftCount = this.pushOffRight();

        // Try rotating
        this.rotateMatrixCW();
        this.rotateMatrixCW();
        if(!this.validLocation(0)) {
            this.rotateMatrixCCW();
            this.rotateMatrixCCW();
            this.adjustLeft(rightCount);
            this.adjustRight(leftCount);
        }

        this.drawTiles("mino");
    }
    
    // Method to rotate a matrix CW
    // https://stackoverflow.com/questions/15170942/how-to-rotate-a-matrix-in-an-array-in-javascript
    rotateMatrixCW() {
        var newArr = [];
        for(let r = 0; r < this.size; r++) {
            newArr.push([]);
            for(let c = 0; c < this.size; c++) {
                newArr[r].push(0);
            }
        }

        for(let r = 0; r < this.size; r++) {
            for(let c = 0; c < this.size; c++) {
                let newC = this.size - r - 1;
                let newR = c;
                newArr[newR][newC] = this.arr[r][c];
            }
        }

        this.arr = newArr;
    }

    // Method to rotate a matrix CCW
    rotateMatrixCCW() {
        for(let i = 0; i < 3; i++) this.rotateMatrixCW();
    }

    // Checking if this piece can move
    canMove(translate) {
        for(let r = 0; r < this.arr.length; r++) {
            for(let c = 0; c < this.arr[r].length; c++) {
                if(this.arr[r][c]) {
                    let nCol = this.col + c + translate;
                    let nRow = this.row + r;
                    if(outOfBounds(nRow, nCol) || isFilled(nRow, nCol)) return false;
                }
            }
        }
        return true;
    }
    
    // Method to make this piece fall and collide
    fall() {
        this.drawTiles("empty");
        if(this.validLocation(1)) {
            this.adjustDown(1);
            this.drawTiles("mino");
        } else {
            this.drawTiles("filled");
            this.placed = true;
            
            let lines = checkForClears();            
            if(lines) score += clearPoints * lines + (lines-1) * comboBonus;
            score = parseInt(score);
            $score.text(score);

            checkGameOver();
        }
    }
    
    // Method to adjust ghost
    ghostAdjust(arr, row, col) {
        this.drawTiles("empty");
        this.arr = JSON.parse(JSON.stringify(arr));
        this.row = row;
        this.col = col;
    }

    // Method to drop the ghost
    ghostDrop() {
        while(this.validLocation(1)) {
            this.adjustDown(1);
        }
        this.drawTiles("ghost");
    }

    // Method to place this piece
    hardDrop() {
        while(!this.placed) {
            score += 0.5;
            this.fall();
        } 
    }

    // Method to check if current location is valid
    validLocation(offset) {
        for(let r = 0; r < this.arr.length; r++) {
            for(let c = 0; c < this.arr[r].length; c++) {
                if(this.arr[r][c]) {
                    let nCol = this.col + c;
                    let nRow = this.row + r + offset;
                    if(outOfBounds(nRow, nCol) || isFilled(nRow, nCol)) return false;
                }
            }
        }
        return true;
    }

    // Method to draw this piece
    drawTiles(type) {
        drawTilesInContainer($grid, this.arr, this.row, this.col, type);
    }
}

// Random number gen
const rand = (lower,upper) => Math.floor(Math.random() * (upper-lower) + lower);

// Function to create a grid
const createGrid = ($con, w, h) => {
    for(let r = 0; r < h; r++) {
        let $newRow = $row.clone();
        for(let c = 0; c < w; c++) {
            $newRow.append($tile.clone());
        }
        $con.append($newRow);
    }
}

// Function to clear a board
const clearBoard = ($board, rows, cols) => {
    for(let r = 0; r < rows; r++) {
        for(let c = 0; c < cols; c++) {
            getTileAt($board, r, c).attr("class", "empty");
        }
    }
}

// Function to get a specific tile
const getTileAt = ($con, row, col) => {
    let curr = $con.children().eq(row);
    return $(curr).children().eq(col);
}

// Function to check if a tile is full
const isFilled = (r, c) => {
    return getTileAt($grid, r,c).hasClass("filled") && r > -1;
}

// Function to check if location is out of bounds
const outOfBounds = (r, c) => {
    if(r > gridHeight-1) return true;
    if(c < 0 || c > gridWidth-1) return true;
    return false;
}

// Function to check for cleared lines
const checkForClears = () => {
    let count = 0;
    for(let r = 0; r < gridHeight; r ++) {
        if(clearLine(r)) count ++;
    }
    return count;
}

// Funciton to check for 1 cleared line
const clearLine = r => {
    for(let c = 0; c < gridWidth; c ++) {
        if(!isFilled(r,c)) return false;
    }
    cascadeDown(r);
    return true;
}

// Function to check if the game is over
const checkGameOver = () => {
    for(let c = 0; c < gridWidth; c++) {
        if(getTileAt($grid, 0, c).hasClass("filled")) {
            gameOver = true;
            gameLost();
        }
    }
}
const gameLost = () => {
    for(let r = 0; r < gridHeight; r++) {
        for(let c = 0; c < gridWidth; c++) {
            let $currTile = getTileAt($grid, r, c);
            if($currTile.hasClass("filled") || $currTile.hasClass("mino"))
                $currTile.attr("class", "filled-lost");
        }
    }
}

// Function to clear lines
const cascadeDown = startR => {
    for(let r = startR; r > -1; r --) {
        for(let c = 0; c < gridWidth; c ++) {
            if(r-1 < 0) getTileAt($grid, r,c).attr("class", "empty");
            else getTileAt($grid, r,c).attr("class", getTileAt($grid, r-1,c).attr("class"));
        }
    }
}

// Function to generate a piece
const generateNewMino = () => {
    let id = rand(0, 7);
    return new Tetromino(id+1, MINO_LIST[id], -1, 3, MINO_LIST[id].length);
}

// Function to get next piece
const getNextMino = () => {
    mino = nextMinos.pop();
    nextMinos.unshift(generateNewMino());    
    drawNextMinos();
}

// Function to get new piece & update ghost
const advanceMino = () => {
    getNextMino();
    ghost = copyMino(mino);
    ghost.ghostDrop();
    ghost.drawTiles("ghost");
    mino.drawTiles("mino");
    canHold = true;
}

// Function to copy minos
const copyMino = mino => {
    copy = new Tetromino(
        mino.id,
        mino.arr,
        mino.row,
        mino.col,
        mino.size
    );
    return copy;
}

// Function to update ghost location
const updateGhost = () => {
    ghost.ghostAdjust(mino.arr, mino.row, mino.col);
    ghost.ghostDrop();
    ghost.drawTiles("ghost");
}

// Function to draw tiles within a specific container
const drawTilesInContainer = ($con, arr, row, col, type) => {
    for(let r = 0; r < arr.length; r++) {
        for(let c = 0; c < arr[r].length; c++) {
            let currRow = row + r;
            let currCol = col + c;
            if(arr[r][c] && currRow > -1) 
                getTileAt($con, currRow, currCol).attr("class", type);
        }
    }
}

// Function to draw the mino currently being held
const drawHeldMino = () => {
    currArr = MINO_LIST[heldId-1];
    clearBoard($hold, boxHeight, boxWidth);
    drawTilesInContainer($hold, currArr, 0, 0, "hold");
}

// Function to draw the set of upcoming pieces
const drawNextMinos = () => {
    for(let i = 0; i < nextSize; i++) {
        currMino = nextMinos[i];
        currArr = MINO_LIST[currMino.id-1];
        $currCon = $nextCon.children().eq(i);
        
        clearBoard($currCon, boxHeight, boxWidth);
        drawTilesInContainer($currCon, currArr, 0, 0, "next");
    }
}

// Function to move current piece down
const moveMinoDown = () => {
    mino.fall();
    if(mino.placed && !gameOver) {
        clearInterval(runGame);
        advanceMino();
        runGame = setInterval(minoFall, fallRate); 
    }
}

// Falling every X ms
const minoFall = () => {
    if(!gameOver) moveMinoDown();
    // moveMinoDown();
}

// Function to hold a piece
const hold = () => {
    // Check if hold is available
    if(!canHold) return;

    // Hold the current piece and advance
    mino.drawTiles("empty");
    if(heldId < 0) {
        heldId = mino.id;
        getNextMino();
    } else {
        let id = heldId;
        heldId = mino.id;
        mino = new Tetromino(id, MINO_LIST[id-1], -1, 3, MINO_LIST[id-1].length);
    }
    mino.drawTiles("mino");
    canHold = false;
    drawHeldMino();
}

// Function to initialize the game
const initialize = () => {
    clearBoard($grid, gridHeight, gridWidth);
    clearBoard($hold, boxHeight, boxWidth);
    mino = generateNewMino();
    ghost = copyMino(mino);
    ghost.ghostDrop();
    nextMinos = [];
    for(let i = 0; i < nextSize; i++) nextMinos.push(generateNewMino());
    
    heldId = -1;
    canHold = true;
    
    clearInterval(runGame);
    runGame = setInterval(minoFall, fallRate);

    ghost.drawTiles("ghost");
    mino.drawTiles("mino");
    drawNextMinos();

    gameOver = false;

    score = 0;
    $score.text(score);
}

$(document).keydown(function(event) {
    if(!gameOver) {
        if(event.keyCode == KEY_RIGHT) mino.moveRight();
        else if(event.keyCode == KEY_LEFT) mino.moveLeft();
        else if(event.keyCode == KEY_UP) mino.rotateCW();
        else if(event.keyCode == KEY_Z) mino.rotateCCW();
        else if(event.keyCode == KEY_A) mino.rotate180();
        else if(event.keyCode == KEY_SHIFT) hold();
        
        updateGhost();
        
        if(event.keyCode == KEY_DOWN) {
            moveMinoDown();
            clearInterval(runGame);
        } else if(event.keyCode == KEY_SPACE) {
            clearInterval(runGame);
            mino.hardDrop();
            if(!gameOver) {
                advanceMino();
                runGame = setInterval(minoFall, fallRate); 
            }
        }
    }
    
    if(event.keyCode == KEY_R) initialize();
});

$(document).keyup(function(event) {
    if(event.keyCode == KEY_DOWN) runGame = setInterval(minoFall, fallRate); 
});



createGrid($grid, gridWidth, gridHeight);
createGrid($hold, boxWidth, boxHeight);
for(let i = 0; i < nextSize; i++) {
    $newItem = $nxt.clone();
    createGrid($newItem, boxWidth, boxHeight);
    $nextCon.append($newItem);
}
initialize();
