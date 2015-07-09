/**
 * Created by lcollins on 6/24/2015.
 */

define("graph", ["data"], function (dataService) {
  var obj = {
    getAllGraphItems: function (callbackFn) {
      dataService.getAllGraphItems(function (items) {
        console.dir("items:", items);
        callbackFn(items);
      })
    },
    getGraphItem: function (graphItemId, callbackFn) {
      dataService.getGraphItem(graphItemId, callbackFn)
    },
    createGraphItemElements: function (parent, graphItems, onExpandFn, onDrag) {
      graphItems.forEach(function (graphItem) {
        var div = $("<div class='graph-item'></div>");
        var table = $('<table class="graph-table"></table>');
        var tr1 = $('<tr></tr>');
        var thTitle = $("<th class='graph-title' align='center'></th>");
        thTitle.text(graphItem.title);
        tr1.append(thTitle);
        table.append(tr1);

        if (graphItem.images.length > 0) {
          var tr2 = $('<tr></tr>');
          var tdImage = $("<td></td>")
          var image = $("<img class='graph-image'/>");
          image.attr('width', 100);
          image.attr('height', 100);
          image.attr('src', "/graph-it" + graphItem.images[0]);
          tdImage.append(image);
          tr2.append(tdImage);
          table.append(tr2);
        }

        div.append(table);
        div.attr("id", "graph-item:" + graphItem.id);

        parent.append(div);
        div.parent().css({position: 'relative'});
        div.css({top: graphItem.position.y, left: graphItem.position.x, position: 'absolute'});

        div.draggable({
//      containment: "#graph-view",
          cursor: "move",
          opacity: 0.35,
          snap: true,
          scroll: true,
          start: function () {
            var pos = div.position();
            console.log("Start ", {x: pos.left, y: pos.top});
          },
          drag: function () {
//              jsPlumb.repaint($(this));
          },
          stop: function (event, ui) {
//        var pos = div.position();
            var pos = div.position();
            console.log("End (pos)", {x: pos.left, y: pos.top});
            console.log("End ", {x: ui.position.left, y: ui.position.top});
            graphItem.position.x = Math.max(pos.left, 0);
            graphItem.position.y = Math.max(pos.top, 0);
            div.animate({top: graphItem.position.y}, function(){
              div.animate({left: graphItem.position.x}, function(){
                jsPlumb.repaintEverything();
                self.updateItemPosition(graphItem, function (newGraphItem) {
                  console.log("Graph Item updated ", newGraphItem.position);
                })

              });

            });
          }
        });
      });
    },
    updateItemPosition: function (graphItem, callbackFn) {
      dataService.updateGraphItemPosition(graphItem, callbackFn)
    },
    ///// parent to search for the related items and to add to
    createRelationshipElement: function (graphItem, relationship, parent, force) {
      /// get the relatedGraphItem element
      var jqGraphItem = self.findGraphItem(graphItem.id, parent);
      var jqRelated = self.findGraphItem(relationship.relatedItemId, parent);
      /// if its not in the view and we don't want to create it
      if (jqRelated.size() == 0 && !force) {
        return null;
      }
      /// if its not found and we are forcing it then create it
      if (force && jqRelated.size() == 0) {
        dataService.getGraphItem(relationship.relatedItemId, function (relatedItem) {
          self.createGraphItemElements(parent, relatedItem);
          jqRelated = self.findGraphItem(relationship.relatedItemId, parent);
          if (!jqRelated) {
            throw Error("Could not display graphItem: " + relationship.relatedItemId);
          }
        });
      }

      self.createGraphItemRelationship(jqGraphItem, jqRelated, relationship.relationshipId);
    },

    findGraphItem: function (graphItemId, parent) {
      $("#graph-item:" + graphItemId);
    },

    createGraphItemRelationship: function (item, relatedItem, relationshipId) {
      jsPlumb.connect(item, relatedItem);
    },

    ///// parent to search for the related items and to add to
    createRelationshipElements: function (graphItem, parent, force) {
      graphItem.relationships.each(function (rel) {

      })
    }
  };
  var self = obj;
  return obj;
});


