// Constants
const windowH = $(window).height();
const KEYLEFT = 37;
const KEYUP = 38;
const KEYRIGHT = 39;
const KEYDOWN = 40;
const KEYA = 65;
const KEYW = 87;
const KEYD = 68;
const KEYS = 83;
const KEY_R = 82;

// Game vars
const gridSize = 20;

var snakeRows = [];
var snakeCols = [];
var snakeLen;

var appleRow;
var appleCol;
var grow = false;

var gameOver = false;

var velC;
var velR;
var updateVelC;
var updateVelR;
var runGame;
const refreshRate = 115;

// HTML elements
var $tile = $("<div />", {
    id: "tile",
    class: "vacant",
    width: .65 * windowH/gridSize,
    height: .65 * windowH/gridSize
});

var $row = $("<div />", {
    class: "row"
});

var $grid = $("#grid");
var $score = $(".score-box");
$score.css("font-size", "4vw");

const createGrid = n => {
    for(let r = 0; r < n; r++) {
        let $newRow = $row.clone();
        for(let c = 0; c < n; c++) {
            $newRow.append($tile.clone());
        }
        $grid.append($newRow);
    }
}

const initializeSnake = () => {
    velC = 1;
    velR = 0;
    updateVelC = 1;
    updateVelR = 0;

    snakeLen = 2;

    for(let i = 0; i < snakeLen; i++) {
        snakeRows.unshift(0);
        snakeCols.unshift(i);
        getTileAt(snakeRows[i], snakeCols[i]).attr("class", "snake");
    }
}

const initializeApple = () => {
    randomizeApple();
}

const resetBoard = () => {
    for(let r = 0; r < gridSize; r++) {
        for(let c = 0; c < gridSize; c++) {
            getTileAt(r, c).attr("class", "vacant");
        }
    }

    snakeRows = [];
    snakeCols = [];

    score = 0;
    $score.text(score);
}

const gameLoop = () => {
    if(!gameOver) {
        velR = updateVelR;
        velC = updateVelC;

        let nextR = snakeRows[0] + velR;
        let nextC = snakeCols[0] + velC;

        if(collideWall(nextR, nextC) || collideSelf(nextR, nextC)) {
            gameOver = true;
            return;
        }

        if(!grow) popTail();
        advanceHead(nextR, nextC);
        grow = false;

        if(collideApple(nextR, nextC)) {
            grow = true;
            snakeLen ++;
            getTileAt(appleRow, appleCol).attr("class", "snake");
            randomizeApple();

            score ++;
            $score.text(score);
        }
    }
}

const getTileAt = (row, col) => {
    let curr = $grid.children().eq(row);
    return $(curr).children().eq(col);
}

const random = (lower, upper) => parseInt((Math.random() * (upper - lower) + lower));

const snakeContains = (start, r, c) => {
    for(let i = start; i < snakeLen; i++) {
        if(snakeRows[i] == r && snakeCols[i] == c) return true;
    }
    return false;
}

const advanceHead = (r, c) => {
    snakeRows.unshift(r);
    snakeCols.unshift(c);
    
    getTileAt(r, c).attr("class", "snake");
}

const popTail = () => {
    getTileAt(snakeRows.pop(), snakeCols.pop()).attr("class", "vacant");
}

const collideWall = (r, c) => {
    if(r >= gridSize || r < 0) return true;
    if(c >= gridSize || c < 0) return true;
    return false;
}

const collideSelf = (r, c) => {
    return snakeContains(1, r, c);
}

const collideApple = (r, c) => {
    return r == appleRow && c == appleCol;
}

const randomizeApple = () => {
    let r;
    let c;

    do {
        r = random(0, gridSize);
        c = random(0, gridSize);
    } while(snakeContains(0,r,c));

    appleRow = r;
    appleCol = c;

    getTileAt(appleRow, appleCol).attr("class", "apple");
}

$(document).keydown(function(event) {
    if((event.keyCode == KEYUP || event.keyCode == KEYW) && velR != 1) {
        updateVelR = -1;
        updateVelC = 0;
    } else if((event.keyCode == KEYDOWN || event.keyCode == KEYS) && velR != -1) {
        updateVelR = 1;
        updateVelC = 0;
    } else if((event.keyCode == KEYLEFT || event.keyCode == KEYA) && velC != 1) {
        updateVelR = 0;
        updateVelC = -1;
    } else if((event.keyCode == KEYRIGHT || event.keyCode == KEYD) && velC != -1) {
        updateVelR = 0;
        updateVelC = 1;
    }

    if(event.keyCode == KEY_R) {
        gameOver = false;
        resetBoard();
        initializeSnake();
        initializeApple();
        clearInterval(runGame);
        runGame = setInterval(gameLoop, refreshRate);
    }
});

createGrid(gridSize);
resetBoard();
initializeSnake();
initializeApple();
runGame = setInterval(gameLoop, refreshRate);