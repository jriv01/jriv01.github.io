// FUNCTIONS
// Function to get a random number 
const rand = (low, high) => (Math.random() * (high-low) + low);

// Function to randomize the divs
const randomize = elem => {
    // Random location
    let x = rand(0, window.innerWidth) + "px";
    let y = rand(0, window.innerHeight) + "px";
    elem.style.marginTop = y;
    elem.style.marginLeft = x;
    // Random size
    randomSize(elem);
}

// Function to make the divs a random size
const randomSize = elem => {
    let size = rand(3, 6);
    elem.style.fontSize = size + "vw";
    elem.style.width = size*5 + "vw";
}

// Function to slide divs across screen
const moveDivs = () => {
    // https://stackoverflow.com/questions/3871547/iterating-over-result-of-getelementsbyclassname-using-array-foreach
    var els = document.getElementsByClassName("word");

    // For each div
    [].forEach.call(els, function(el) {
        let margin = parseInt(el.style.marginLeft);
        let vel = el.getBoundingClientRect().width / 150;
        
        // Check if we went off the screen
        if(margin > window.innerWidth) {
            randomSize(el);
            let w = parseInt(el.style.width);
            margin = rand(-20*w, -10*w);
            el.style.marginLeft = rand(0, window.innerHeight) + "px";
        } else {
            margin += vel;
        }

        el.style.marginLeft = margin + 'px';
    });
}

// Flash static
const static = () =>  {
    let img = document.getElementById("middle-img");
    img.style.backgroundImage = "url(https://media0.giphy.com/media/l41K3o5TzvmhZwd4A/giphy.gif)";
    setTimeout(switchBack, 500);
}

// Change image
const switchBack = () => {
    let img = document.getElementById("middle-img");
    currUrl++;
    currUrl%=5;
    img.style.backgroundImage = urls[currUrl];
}

// Intervals
setInterval(moveDivs, 10);
setInterval(static, 4000);

const words = ['THE', 'MEDIUM', 'IS', 'MESSAGE'];
var currWord = 0;

const urls = [
    "url(https://asapguide.com/wp-content/uploads/2020/04/Blocc-launcher-700x468.jpg)",
    "url(https://www.teahub.io/photos/full/181-1817737_cell-phone-black-and-white.jpg)",
    "url(https://media.istockphoto.com/photos/business-people-standing-in-the-office-picture-id962689238?k=20&m=962689238&s=612x612&w=0&h=n3d1uXpJwUSu4_fpfANwfHFH9T-WOxYpleKZjyCwUt0=)",
    "url(https://ichef.bbci.co.uk/news/976/cpsprodpb/7ACF/production/_87393413_blackandwhitetelly.jpg)",
    "url(https://live.staticflickr.com/6033/6277209256_934f20da10_b.jpg)"
]
var currUrl = 0;


// Creating divs
var theBody = document.querySelector("body");
for(let i = 0; i < 50; i++) {
    let div = document.createElement("div");
    div.setAttribute("class", "word");
    theBody.appendChild(div);
    div.style.color = "gray";
    div.innerText = words[currWord];

    currWord++;
    currWord%=4;

    randomize(div);
}






