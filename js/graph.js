/**
 * Created by lcollins on 6/24/2015.
 */

var graphService = (function( dataService ) {


  var obj =  {
    getAllGraphItems: function(callbackFn){
      dataService.getAllGraphItems(function(items){
        callbackFn(items);
      })
    },
    getGraphItem: function(graphItemId, callbackFn){
      dataService.getGraphItem(graphItemId, callbackFn)
    },
    createGraphItemElements: function (parent, graphItems, onExpandFn, onDrag) {
      graphItems.forEach(function (graphItem) {
        var div = $("<div class='graph-item'></div>");

        var titleLabel = $('<label class="graph-title"></label>')
        titleLabel.text(graphItem.title);

        div.append(titleLabel);
        div.attr("id", "graph-item:"+graphItem.id);

        parent.append(div);
        div.parent().css({position: 'relative'});
        div.css({top: graphItem.position.y, left: graphItem.position.x, position: 'absolute'});

        if (graphItem.images.length > 0) {
          var image = $("<img class='graph-image'/>");
          image.attr('src', "/graph-it"+graphItem.images[0]);
          div.append(image);
        }

        div.draggable({
//      containment: "#graph-view",
          cursor: "move",
          opacity: 0.35,
          snap: true,
          scroll: false,
          start: function () {
            var pos = div.position();
            console.log("Start ", {x: pos.left, y: pos.top});
          },
          drag: function () {
          },
          stop: function (event, ui) {
//        var pos = div.position();
            var pos = div.position();
            console.log("End (pos)", {x: pos.left, y: pos.top});
            console.log("End ", {x: ui.position.left, y: ui.position.top});
            graphItem.position.x = Math.max(pos.left, 0);
            graphItem.position.y = Math.max(pos.top, 0);
            div.animate({top: graphItem.position.y});
            div.animate({left: graphItem.position.x});
            self.updateItemPosition(graphItem, function(newGraphItem){
              console.log("Graph Item updated ", newGraphItem.position);
            })
          }
        });
      });
    },
    updateItemPosition: function (graphItem, callbackFn) {
      dataService.updateGraphItemPosition(graphItem, callbackFn)
    }
  };
  var self = obj;
  return obj;

})( dataServiceFactory('localhost', 8888))
