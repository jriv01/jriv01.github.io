var $floorTile = $("<div />", {
    class: "floor-tile",
});
var $floor = $("#floor");

for(let i = 0; i < 30; i ++)
    $floor.append($floorTile.clone());