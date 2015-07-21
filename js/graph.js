/**
 * Created by lcollins on 6/24/2015.
 */

define("graph", ["data", "storage", "relationship"], function (dataService, storage, relationshipService) {

  var obj = {
    getCategories: function () {
      return storage.getCategories()
    },

    getAllGraphItems: function () {
      return storage.getAllGraphItems();
    },

    findAllGraphItems: function () {
      return $('div[id^="graph-item:"]').filter(
        function () {
          return this.id.match(/\d+$/);
        });
    },

    getGraphItem: function (graphItemId) {
      return storage.getGraphItem(graphItemId)
    },

    createGraphItem: function (graphItem) {
      return storage.addGraphItem(graphItem)
    },

    createGraphItemElement: function (graphItem) {
        var div = $("<div class='graph-item'></div>");
        var table = $('<table class="graph-table"></table>');
        var tr1 = $('<tr></tr>');
        var thTitle = $("<th class='graph-title' align='center'></th>");
        thTitle.text(graphItem.title);
        tr1.append(thTitle);
        table.append(tr1);

        if (graphItem.images && graphItem.images.length > 0) {
          var tr2 = $('<tr></tr>');
          var tdImage = $("<td></td>")
          var image = $("<img class='graph-image'/>");
          image.attr('src', "/graph-it" + graphItem.images[0]);
          tdImage.append(image);
          tr2.append(tdImage);
          table.append(tr2);
        }

        div.append(table);
        div.attr("id", "graph-item:" + graphItem.id);

        div.parent().css({position: 'relative'});
        div.css({top: graphItem.position.y, left: graphItem.position.x, position: 'absolute'});

        div.draggable({
          cursor: "move",
          opacity: 0.35,
          snap: true,
          scroll: true,
          start: function () {
            var pos = div.position();
            console.log("Start ", {x: pos.left, y: pos.top});
          },
          stop: function (event, ui) {
            var pos = div.position();
            console.log("End (pos)", {x: pos.left, y: pos.top});
            console.log("End ", {x: ui.position.left, y: ui.position.top});
            graphItem.position.x = Math.max(pos.left, 0);
            graphItem.position.y = Math.max(pos.top, 0);
            div.animate({top: graphItem.position.y}, function () {
              div.animate({left: graphItem.position.x}, function () {
                jsPlumb.repaintEverything();
                self.updateItemPosition(graphItem).then( function (newGraphItem) {
                  console.log("Graph Item updated ", newGraphItem.position);
                })
              });
            });
          }
        });
      return div;
    },

    createGraphItemElements: function (parent, graphItems) {
      var divs =  graphItems.map(function (graphItem) {
        var div = self.createGraphItemElement(graphItem);
        parent.append(div);
        jsPlumb.makeSource(div,{
          endPoint: [ "Dot", { radius:75 } ],
          anchors: ["Bottom","Top","Left","Right"],
          cssClass:"graph-relationship"
        });

        jsPlumb.makeTarget(div,{
          endpoint:[ "Rectangle", {width:30, height:20}],
          anchor: "Top",
          cssClass:"graph-relationship"
        });

        return div;
      });
      return divs;
    },

    initGraphItemElements: function (parent) {
      return storage.getAllGraphItems().then(function(graphItems){

        var itemElements = self.createGraphItemElements(parent, graphItems);
        relationshipService.view.refreshRelationships();
        return itemElements;
        });
    },

    updateItemPosition: function (graphItem) {
      return dataService.updateGraphItemPosition(graphItem).then(function(graphItem){
        return storage.updateGraphItem(graphItem);
      });
    },

    findGraphItem: function (graphItemId, parent) {
      var item = $("#graph-item:" + graphItemId);
      return item.size() > 0 ? item : null;
    }
  };
  var self = obj;
  return obj;
});


