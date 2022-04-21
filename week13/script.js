//https://webdesign.tutsplus.com/tutorials/animate-on-scroll-with-javascript--cms-36671

const windowHeight = window.innerHeight;
const scrollOffset = windowHeight/10;

var $scrolls = $(".scrollable");
var $intro = $("#intro");


const checkOffsets = () => {
    for(let i = $scrolls.length-1; i > -1; i--) {
        let bounds = $scrolls[i].getBoundingClientRect();
        if(bounds.top <= windowHeight - scrollOffset) {
            displayElement($scrolls[i]);
        } else {
            hideElement($scrolls[i]);
        }
    }
}

const displayElement = ele => {
    ele.classList.add("displayed");
    $intro.addClass("hidden");
}

const hideElement = ele => {
    ele.classList.remove("displayed");
    $intro.removeClass("hidden");
}

window.addEventListener('scroll', () => {
    checkOffsets();
});


