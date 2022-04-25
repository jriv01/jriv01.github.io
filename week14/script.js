// Constants
const windowH = $(window).height();
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_Z = 90;
const KEY_SPACE = 32;
const KEY_A = 65;
const KEY_SHIFT = 16;

// Game vars
const gridWidth  = 10;
const gridHeight = 20;
const fallRate = 1500;

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
var $nxt = $("<div />", {
    class: "display-box"
});

class Tetromino {
    constructor(id, arrangement, row, col, size) {
        this.id = id;
        this.arr = JSON.parse(JSON.stringify(arrangement));
        this.row = row;
        this.col = col;
        this.size = size;
        this.placed = false;
    }

    adjustRight(x) {
        for(let i = 0; i < x; i++) this.col ++;
    }

    adjustLeft(x) {
        for(let i = 0; i < x; i++) this.col --;
    }

    adjustDown(x) {
        for(let i = 0; i < x; i++) this.row ++;
    }

    moveRight() {
        this.drawTiles("empty");
        if(this.canMove(1)) this.adjustRight(1);
        this.drawTiles("mino");
    }

    moveLeft() {
        this.drawTiles("empty");
        if(this.canMove(-1)) this.adjustLeft(1);
        this.drawTiles("mino");
    }
    
    pushOffLeft() {
        let res = 0;
        while(this.col < 0 && this.canMove(1)) {
            this.adjustRight(1);
            res ++;
        }
        return res;
    }

    pushOffRight() {
        let res = 0;
        while(this.col + this.size-1 >= gridWidth && this.canMove(-1)) {
            this.adjustLeft(1);
            res ++;
        }
        return res;
    }

    rotateCW() {
        if(this.id == 7) return;
        
        this.drawTiles("empty");
        let rightCount = this.pushOffLeft();
        let leftCount = this.pushOffRight();

        let success = true;

        if(this.size == 3) {
            this.rotateCW3X3();
            if(!this.validLocation()) {
                this.rotateCCW3X3();
                success = false;
            }
        } else {
            this.rotateCW4X4();
            if(!this.validLocation()) {
                this.rotateCCW4X4();
                success = false;
            }
        }

        if(!success) {
            this.adjustLeft(rightCount);
            this.adjustRight(leftCount);
        }

        this.drawTiles("mino");

        return success;
    }

    rotateCCW() {
        if(this.id == 7) return;

        this.drawTiles("empty");
        let rightCount = this.pushOffLeft();
        let leftCount = this.pushOffRight();
        let success = true;

        if(this.size == 3) {
            this.rotateCCW3X3();
            if(!this.validLocation()) {
                this.rotateCW3X3();
                success = false;
            }
        } else {
            this.rotateCCW4X4();
            if(!this.validLocation()) {
                this.rotateCW4X4();
                success = false;
            }
        }

        if(!success) {
            this.adjustLeft(rightCount);
            this.adjustRight(leftCount);
        }

        this.drawTiles("mino");

        return success;
    }

    rotate180() {
        if(this.id == 7) return;
        this.drawTiles("empty");
        let rightCount = this.pushOffLeft();
        let leftCount = this.pushOffRight();
        let success = true;
        if(this.size == 3) {
            this.rotateCCW3X3();
            this.rotateCCW3X3();
            if(!this.validLocation()) {
                this.rotateCW3X3();
                this.rotateCW3X3();
                success = false;
            }
        } else {
            this.rotateCCW4X4();
            this.rotateCCW4X4();
            if(!this.validLocation()) {
                this.rotateCW4X4();
                this.rotateCW4X4();
                success = false;
            }
        }

        if(!success) {
            this.adjustLeft(rightCount);
            this.adjustRight(leftCount);
        }
        this.drawTiles("mino");
    }

    
    rotateCornersCW() {
        let s = this.size-1;
        let temp = this.arr[0][0];
        this.arr[0][0] = this.arr[s][0];
        this.arr[s][0] = this.arr[s][s];
        this.arr[s][s] = this.arr[0][s];
        this.arr[0][s] = temp;
    }
    
    rotateCornersCCW() {
        let s = this.size-1;
        let temp = this.arr[0][0];
        this.arr[0][0] = this.arr[0][s];
        this.arr[0][s] = this.arr[s][s];
        this.arr[s][s] = this.arr[s][0];
        this.arr[s][0] = temp;
    }

    rotateCW3X3() {
        this.rotateCornersCW();
        let temp = this.arr[0][1];
        this.arr[0][1] = this.arr[1][0];
        this.arr[1][0] = this.arr[2][1];
        this.arr[2][1] = this.arr[1][2];
        this.arr[1][2] = temp;
    }

    rotateCCW3X3() {
        this.rotateCornersCCW();
        let temp = this.arr[0][1];
        this.arr[0][1] = this.arr[1][2];
        this.arr[1][2] = this.arr[2][1];
        this.arr[2][1] = this.arr[1][0];
        this.arr[1][0] = temp;
    }

    rotateCW4X4() {
        this.rotateCornersCW();
        let tempL = this.arr[0][1];
        let tempR = this.arr[0][2];
        let tempC = this.arr[1][1];

        this.arr[0][1] = this.arr[2][0];
        this.arr[2][0] = this.arr[3][2];
        this.arr[3][2] = this.arr[1][3];
        this.arr[1][3] = tempL;

        this.arr[0][2] = this.arr[1][0];
        this.arr[1][0] = this.arr[3][1];
        this.arr[3][1] = this.arr[2][3];
        this.arr[2][3] = tempR;

        this.arr[1][1] = this.arr[2][1];
        this.arr[2][1] = this.arr[2][2];
        this.arr[2][2] = this.arr[1][2];
        this.arr[1][2] = tempC;
    }

    rotateCCW4X4() {
        this.rotateCornersCCW();
        let tempL = this.arr[0][1];
        let tempR = this.arr[0][2];
        let tempC = this.arr[1][1];

        this.arr[0][1] = this.arr[1][3];
        this.arr[1][3] = this.arr[3][2];
        this.arr[3][2] = this.arr[2][0];
        this.arr[2][0] = tempL;

        this.arr[0][2] = this.arr[2][3];
        this.arr[2][3] = this.arr[3][1];
        this.arr[3][1] = this.arr[1][0];
        this.arr[1][0] = tempR;

        this.arr[1][1] = this.arr[1][2];
        this.arr[1][2] = this.arr[2][2];
        this.arr[2][2] = this.arr[2][1];
        this.arr[2][1] = tempC;
    }
    
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
    
    fall() {
        this.drawTiles("empty");
        if(!this.checkFallCollide()) {
            this.adjustDown(1);
            this.drawTiles("mino");
        } else {
            this.place();
        }
    }

    ghostAdjust(arr, row, col) {
        this.drawTiles("empty");
        this.arr = JSON.parse(JSON.stringify(arr));
        this.row = row;
        this.col = col;
    }

    ghostDrop() {
        while(!this.checkFallCollide()) {
            this.adjustDown(1);
        }
        this.drawTiles("ghost");
    }

    hardDrop() {
        while(!this.placed) this.fall();
    }

    validLocation() {
        for(let r = 0; r < this.arr.length; r++) {
            for(let c = 0; c < this.arr[r].length; c++) {
                if(this.arr[r][c]) {
                    let nCol = this.col + c;
                    let nRow = this.row + r;
                    if(outOfBounds(nRow, nCol) || isFilled(nRow, nCol)) return false;
                }
            }
        }
        return true;
    }

    checkFallCollide() {
        for(let r = 0; r < this.arr.length; r++) {
            for(let c = 0; c < this.arr[r].length; c++) {
                if(this.arr[r][c]) {
                    let nCol = this.col + c;
                    let nRow = this.row + r + 1;
                    if(outOfBounds(nRow, nCol) || isFilled(nRow, nCol)) return true;
                }
            }
        }
        return false;
    }

    place() {
        for(let r = 0; r < this.arr.length; r++) {
            for(let c = 0; c < this.arr[r].length; c++) {
                let currRow = this.row + r;
                let currCol = this.col + c;
                if(this.arr[r][c]) 
                    getTileAt($grid, currRow, currCol).attr("class", "filled");
            }
        }
        this.placed = true;
        checkForClears();
    }

    drawTiles(type) {
        for(let r = 0; r < this.arr.length; r++) {
            for(let c = 0; c < this.arr[r].length; c++) {
                let currRow = this.row + r;
                let currCol = this.col + c;
                if(this.arr[r][c] && currRow > -1) 
                    getTileAt($grid, currRow, currCol).attr("class", type);
            }
        }
    }
}

const rand = (lower,upper) => Math.floor(Math.random() * (upper-lower) + lower);

const createGrid = ($con, w, h) => {
    for(let r = 0; r < h; r++) {
        let $newRow = $row.clone();
        for(let c = 0; c < w; c++) {
            $newRow.append($tile.clone());
        }
        $con.append($newRow);
    }
}

const getTileAt = ($con, row, col) => {
    let curr = $con.children().eq(row);
    return $(curr).children().eq(col);
}

const checkForClears = () => {
    for(let r = 0; r < gridHeight; r ++) {
        clearLine(r);
    }
}

const clearLine = r => {
    for(let c = 0; c < gridWidth; c ++) {
        if(!isFilled(r,c)) return;
    }
    cascadeDown(r);
}

const cascadeDown = startR => {
    for(let r = startR; r > -1; r --) {
        for(let c = 0; c < gridWidth; c ++) {
            if(r-1 < 0) getTileAt($grid, r,c).attr("class", "empty");
            else getTileAt($grid, r,c).attr("class", getTileAt($grid, r-1,c).attr("class"));
        }
    }
}

const isFilled = (r, c) => {
    return getTileAt($grid, r,c).hasClass("filled") && r > -1;
}

const outOfBounds = (r, c) => {
    if(r > gridHeight-1) return true;
    if(c < 0 || c > gridWidth-1) return true;
    return false;
}

const generateNewMino = () => {
    let id = rand(0, 7);
    return new Tetromino(id+1, MINO_LIST[id], -1, 3, MINO_LIST[id].length);
}

const gameLoop = () => {
    moveMinoDown();
}

const moveMinoDown = () => {
    mino.fall();
    if(mino.placed) {
        clearInterval(runGame);
        getNextMino();
        ghost = copyMino(mino);
        ghost.ghostDrop();
        ghost.drawTiles("ghost");
        mino.drawTiles("mino");
        canHold = true;
        runGame = setInterval(gameLoop, fallRate); 
    }
}

$(document).keydown(function(event) {
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
        getNextMino();
        ghost = copyMino(mino);
        ghost.ghostDrop();
        ghost.drawTiles("ghost");
        mino.drawTiles("mino");
        canHold = true;
        runGame = setInterval(gameLoop, fallRate); 
    }
});

$(document).keyup(function(event) {
    if(event.keyCode == KEY_DOWN) runGame = setInterval(gameLoop, fallRate); 
});

const updateGhost = () => {
    ghost.ghostAdjust(mino.arr, mino.row, mino.col);
    ghost.ghostDrop();
    ghost.drawTiles("ghost");
}

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

const getNextMino = () => {
    mino = nextMinos.pop();
    nextMinos.unshift(generateNewMino());    
    drawNextMinos();
}

const hold = () => {
    if(!canHold) return;
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

createGrid($grid, gridWidth, gridHeight);
var mino = generateNewMino();
var ghost = copyMino(mino);

ghost.ghostDrop();
ghost.drawTiles("ghost");
mino.drawTiles("mino");

var heldId = -1;

var canHold = true;

var nextMinos = [];
var nextSize = 4;
for(let i = 0; i < nextSize; i++) nextMinos.push(generateNewMino());

var runGame = setInterval(gameLoop, fallRate);

const boxWidth = 4;
const boxHeight = 3;

$holdBox = $(".display-box");
createGrid($holdBox, boxWidth, boxHeight);

const clearBoard = ($board, rows, cols) => {
    for(let r = 0; r < rows; r++) {
        for(let c = 0; c < cols; c++) {
            getTileAt($board, r, c).attr("class", "empty");
        }
    }
}

const drawHeldMino = () => {
    clearBoard($holdBox, boxHeight, boxWidth);

    currArr = MINO_LIST[heldId-1];

    for(let r = 0; r < currArr.length; r++) {
        for(let c = 0; c < currArr[r].length; c++) {
            let currRow = r;
            let currCol = c;
            if(this.currArr[r][c] && currRow > -1) 
                getTileAt($holdBox, currRow, currCol).attr("class", "mino");
        }
    }
}

var $nextCon = $("#next-container");
for(let i = 0; i < nextSize; i++) {
    $newItem = $nxt.clone();
    createGrid($newItem, boxWidth, boxHeight);
    $nextCon.append($newItem);
}

const drawNextMinos = () => {
    for(let i = 0; i < nextSize; i++) {
        currMino = nextMinos[i];
        currArr = MINO_LIST[currMino.id-1];
        $currCon = $nextCon.children().eq(i);

        clearBoard($currCon, boxHeight, boxWidth);
        
        for(let r = 0; r < currArr.length; r++) {
            for(let c = 0; c < currArr[r].length; c++) {
                let currRow = r;
                let currCol = c;
                if(this.currArr[r][c] && currRow > -1) 
                    getTileAt($currCon, currRow, currCol).attr("class", "mino");
            }
        }

    }
}

drawNextMinos();


