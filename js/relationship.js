/**
 * Created by lcollins on 6/24/2015.
 */

define("relationship", ["data", "js/libs/q/q.js"], function (dataService, Q) {
  var self = null;
  var relationshipDefinitions;

  var toMap = function (array, member) {
    return array.reduce(function (total, current) {
      total[current[member]] = current;
      return total;
    }, {});
  };

  var obj = {

    getRelationshipDefs: function () {
      var deferred = Q.defer();
      //TODO add time if condition to refresh
      if (!relationshipDefinitions) {
        dataService.getRelationshipDefs().then(function (relDefs) {
          relationshipDefinitions = toMap(relDefs, "id");
          deferred.resolve(relationshipDefinitions);
        }, function (error) {
          console.log("getRelationshipDefs Error: " + error);
          deferred.reject("getRelationshipDefs Error: " + error);
        });
      }
      else {
        deferred.resolve(relationshipDefinitions);
      }
      return deferred.promise;
    },

    getGraphItem: function (graphItemIdn) {
      return dataService.getGraphItem(graphItemId)
    },

    getRelationshipsForGraphItems: function (graphItemIds) {
      return dataService.getRelationshipsForGraphItems(graphItemIds)
    },

    view :{
      findGraphItem: function (graphItemId, parent) {
        var elId = self.graphItemIdToElementId(graphItemId);
        var els = $("#elId");
        return els.size() > 0 ? els : null;
      },
      refreshRelationships: function(){
        var graphItemIds = [];
        graphService.findAllGraphItems().each(function(index){
          jsPlumb.detachAllConnections($( this ));
          graphItemIds.push( $( this ).attr("id").substring(11) );
          console.log( index + ": " + $( this ).attr("id") );
        });

        self.getRelationshipsForGraphItems(graphItemIds).then(function(itemRelationships){
          return self.view.drawRelationships(itemRelationships);
        });


      },
      graphItemIdToElementId: function (graphItemId) {
        return "graph-item:" + graphItemId;
      },

      drawRelationship: function (itemRelationship) {

        self.getRelationshipDefs().then(function (relDefs) {

          //TODO do something different heree based on relationshipType
          return jsPlumb.connect({
            source: self.view.graphItemIdToElementId(itemRelationship.sourceItemId),
            target: self.view.graphItemIdToElementId(itemRelationship.relatedItemId),
            connector: ["Flowchart", {stub: 30}],
            overlays: [
              ["Arrow", {
                width: 30, length: 30, location: 1,
                paintStyle: {
                  fillStyle: "white",
                  outlineColor: "navy",
                  lineWidth: 4
                },
                id: "graph-relationship-arrow:" + itemRelationship.id
              }
              ],
              ["Label", {
                label: relDefs[itemRelationship.relationship.id].name,
                cssClass: "simple-relationship-label",
                id: "graph-relationship-label:" + itemRelationship.id
              }
              ]
            ]
          });

        });

      },
      drawRelationships: function (itemRelationships) {
        return itemRelationships.map(function (itemRelationship) {
          self.view.drawRelationship(itemRelationship);
        });
      },
      findRelatedItem: function (relatedItemId, forced) {
        var deferred = Q.defer();
        var relatedItem = self.findGraphItem(relatedItemId);
        if (relatedItem)
          deferred.resolve(relatedItem);
        if (forced) {
          // must load the item from server
          self.getGraphItem(relatedItemId).then( function(graphItem){
            deferred.resolve(graphItem);
          }).fail(function(err){
            deferred.reject(err);
          });
        } else {
          deferred.resolve(null);
        }
        return deferred.promise;
      }
    }


  };
  self = obj;
  return obj;
});
