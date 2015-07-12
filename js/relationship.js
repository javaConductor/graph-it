/**
 * Created by lcollins on 6/24/2015.
 */

define("relationship", ["data", "js/libs/q/q.js"], function (dataService, Q) {
  var self = null;
  var relationshipDefinitions;

  console.log("Q is:" + Q);
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
    graphItemIdToElementId: function (graphItemId) {
      return "graph-item:" + graphItemId;
    },

    drawRelationship: function (itemRelationship) {

      self.getRelationshipDefs().then(function (relDefs) {

        //TODO do something different heree based on relationshipType
        jsPlumb.connect({
          source: self.graphItemIdToElementId(itemRelationship.sourceItemId),
          target: self.graphItemIdToElementId(itemRelationship.relatedItemId),
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
      itemRelationships.forEach(function (itemRelationship) {
        self.drawRelationship(itemRelationship);
      });
    },

    getGraphItem: function (graphItemId, callbackFn) {
      dataService.getGraphItem(graphItemId, callbackFn)
    },
    findRelatedItem: function (relatedItemId, forced, callbackFn) {
      var relatedItem = self.findGraphItem(relatedItemId);
      if (relatedItem)
        return callbackFn(relatedItem);
      if (forced) {
        // must load the item from server
        self.getGraphItem(relatedItemId, callbackFn)
      } else {
        callbackFn(null);
      }

    },
    getRelationshipsForGraphItems: function (graphItemIds) {
      return dataService.getRelationshipsForGraphItems(graphItemIds)
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
    ///// parent to search for the related items and to add to
    createRelationshipElements: function (graphItem, parent, force) {
      graphItem.relationships.each(function (rel) {
        /// TODO do it
        self.drawRelationship(graphItem.id,
          rel.relatedItemId,
          rel.relationshipId,
          function () {
            console.log("relationship(" + rel.relationshipId + "):"
            + graphItem.id + "-->>" + rel.relatedItemId);
          });
      });
    }
  };
  self = obj;
  return obj;
});
