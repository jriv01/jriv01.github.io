// Constants
const windowH = $(window).height();
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_Z = 90;
const KEY_SPACE = 32;
const KEY_A = 65;

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
const MINO_LIST = [T_PIECE, L_PIECE, J_PIECE, Z_PIECE, S_PIECE, O_PIECE, I_PIECE];

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

class Tetromino {
    constructor(id, arrangement, row, col, size) {
        this.id = id;
        this.arr = copyArray(arrangement);
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

    moveRight() {
        this.clear();
        if(this.canMoveRight()) this.adjustRight(1);
        this.draw();
    }

    moveLeft() {
        this.clear();
        if(this.canMoveLeft()) this.adjustLeft(1);
        this.draw();
    }
    
    pushOffLeft() {
        let res = 0;
        while(this.col < 0 && this.canMoveRight()) {
            this.adjustRight(1);
            res ++;
        }
        return res;
    }

    pushOffRight() {
        let res = 0;
        while(this.col + this.size-1 >= gridWidth && this.canMoveLeft()) {
            this.adjustLeft(1);
            res ++;
        }
        return res;
    }

    rotateCW() {
        if(this.id == 7) return;
        
        this.clear();
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

        this.draw();

        return success;
    }

    rotateCCW() {
        if(this.id == 7) return;

        this.clear();
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

        this.draw();

        return success;
    }

    rotate180() {
        if(this.id == 7) return;
        this.clear();
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
        this.draw();
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
    
    canMoveRight() {
        for(let r = 0; r < this.arr.length; r++) {
            for(let c = 0; c < this.arr[r].length; c++) {
                if(this.arr[r][c]) {
                    let nCol = this.col + c + 1;
                    let nRow = this.row + r;
                    if(outOfBounds(nRow, nCol) || isFilled(nRow, nCol)) return false;
                }
            }
        }
        return true;
    }

    canMoveLeft() {
        for(let r = 0; r < this.arr.length; r++) {
            for(let c = 0; c < this.arr[r].length; c++) {
                if(this.arr[r][c]) {
                    let nCol = this.col + c - 1;
                    let nRow = this.row + r;
                    if(outOfBounds(nRow, nCol) || isFilled(nRow, nCol)) return false;
                }
            }
        }
        return true;
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
                if(this.arr[r][c]) getTileAt(currRow, currCol).attr("class", "filled");
            }
        }
        this.placed = true;
        checkForClears();
    }

    clear() {
        for(let r = 0; r < this.arr.length; r++) {
            for(let c = 0; c < this.arr[r].length; c++) {
                let currRow = this.row + r;
                let currCol = this.col + c;
                if(this.arr[r][c] && currRow > -1) getTileAt(currRow, currCol).attr("class", "empty");
            }
        }
    }

    draw() {
        for(let r = 0; r < this.arr.length; r++) {
            for(let c = 0; c < this.arr[r].length; c++) {
                let currRow = this.row + r;
                let currCol = this.col + c;
                if(this.arr[r][c] && currRow > -1) getTileAt(currRow, currCol).attr("class", "mino");
            }
        }
    }
}

const rand = (lower,upper) => Math.floor(Math.random() * (upper-lower) + lower);

const copyArray = arr => {
    let newArr = [];
    let sz = arr.length;
    for(let i = 0; i < sz; i++) {
        newArr.push([])
        for(let j = 0; j < sz; j++) {
            newArr[i].push(arr[i][j]);
        }
    }
    return newArr;
}

const createGrid = (w, h) => {
    for(let r = 0; r < h; r++) {
        let $newRow = $row.clone();
        for(let c = 0; c < w; c++) {
            $newRow.append($tile.clone());
        }
        $grid.append($newRow);
    }
}

const getTileAt = (row, col) => {
    let curr = $grid.children().eq(row);
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
            console.log("cas")
            if(r-1 < 0) getTileAt(r,c).attr("class", "empty");
            else getTileAt(r,c).attr("class", getTileAt(r-1,c).attr("class"));
        }
    }
}

const isFilled = (r, c) => {
    return getTileAt(r,c).hasClass("filled") && r > -1;
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
        mino = generateNewMino();
        mino.draw();
    }
}

$(document).keydown(function(event) {
    if(event.keyCode == KEY_RIGHT) mino.moveRight();
    else if(event.keyCode == KEY_LEFT) mino.moveLeft();
    else if(event.keyCode == KEY_UP) mino.rotateCW();
    else if(event.keyCode == KEY_Z) mino.rotateCCW();
    else if(event.keyCode == KEY_A) mino.rotate180();

    if(event.keyCode == KEY_DOWN) {
        moveMinoDown();
        clearInterval(runGame);
    } else if(event.keyCode == KEY_SPACE) {
        clearInterval(runGame);
        mino.hardDrop();
        mino = generateNewMino();
        mino.draw();
        runGame = setInterval(gameLoop, fallRate); 
    }
});

$(document).keyup(function(event) {
    if(event.keyCode == KEYDOWN) runGame = setInterval(gameLoop, fallRate); 
});



createGrid(gridWidth, gridHeight);
var mino = generateNewMino();
mino.draw();
var runGame = setInterval(gameLoop, fallRate);