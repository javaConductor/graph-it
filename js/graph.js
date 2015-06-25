/**
 * Created by lcollins on 6/24/2015.
 */


function createGraphItem(parent,  graphItems, onExpandFn, onDrag) {

  graphItems.forEach(function (graphItem) {
    var div = $("<div class='graph-item'></div>");

    var titleLabel = $('<label class="graph-title"></label>')
    titleLabel.text(graphItem.title);

    div.append(titleLabel);

    parent.append(div);
    div.parent().css({position: 'relative'});
    div.css({top: graphItem.position.x, left: graphItem.position.y, position: 'absolute'});

    if(graphItem.images.length > 0) {
      var image = $("<img class='graph-image'/>");
      image.attr('src', graphItem.images[0]);
      div.append(image);
    }

    div.draggable({
//      containment: "#graph-view",
      cursor: "move",
      opacity: 0.35,
      snap: true,
      scroll: false,
      start: function() {
        var pos = div.position();
        console.log( "Start ", {x: pos.left, y: pos.top});
      },
      drag: function() {
      },
      stop: function(event , ui) {
//        var pos = div.position();
        console.log("End ", {x: ui.position.left, y: ui.position.top});
        updateItemPosition(graphItem, {x: ui.position.left, y: ui.position.top})
      }
    });

  });

};

function updateItemPosition(graphItem, position){
  graphItem.position = position;
}
