/**
 * Created by lcollins on 6/24/2015.
 */

define("relationship", ["data", "storage","Q", "popupService"], function (dataService, storage, Q, popupService) {
  var RelationshipParameter = "relationshipId";
  var self = null;
  var relationshipDefinitions;
  var batchDrawing = false;
  var viewId = "graph-view"
  jsPlumb.bind("connection",function( info, evt ){

    /// if it has a relationshipId then its not new - don't do anything
    if(info.connection.getParameter(RelationshipParameter))
      return;
    /// display the popup
    return popupService.selectRelationship(null)
      .then(function(relationshipDef){
        var sourceId = info.sourceId;
        var targetId = info.targetId;
        var r = new ItemRelationship();
        r.sourceItemId = sourceId.substring(11)
        r.relatedItemId = targetId.substring(11)
        r.relationshipId = relationshipDef.id;
        r.notes = [ "Created: "+new Date().toLocaleString() ]

        return storage.addItemRelationship(r).then(function(itemRelationship){
          console.dir (" Created ItemRelationship: "+ itemRelationship )
          jsPlumb.detach(info.connection);
          self.view.drawRelationships([itemRelationship]);
          return itemRelationship;
          });
      })
  });

  jsPlumb.bind("connectionDetach",function( info, evt ){

    if(info.connection.getParameter(RelationshipParameter))
      return;
    var relId = info.connection.getParameter(RelationshipParameter)
    /// confirn delete
    var ok = confirm("Are you sure you want to delete this relationship?");
    if( ok ){
      storage.removeItemRelationship(relId).then(function(removed){
        jsPlumb.detach(info.connection);
      });
    }
  });

  var toMap = function (array, member) {
    return array.reduce(function (total, current) {
      total[current[member]] = current;
      return total;
    }, {});
  };

  var obj = {

    getRelationshipDefs: function () {
        return storage.getAllRelationships().then(function (relDefs) {
          return (relDefs);
        }, function (error) {
          console.log("getRelationshipDefs Error: " + error);
        });
    },

    getGraphItem: function (graphItemId) {
      return storage.getGraphItem(graphItemId)
    },

    view :{
      findGraphItem: function (graphItemId, parent) {
        var elId = self.graphItemIdToElementId(graphItemId);
        var els = $("#elId");
        return els.size() > 0 ? els : null;
      },
      findAllGraphItems: function () {
        return $('div[id^="graph-item"]').filter(
          function () {
            return this.id.match(/\d+$/);
          });
      },
      connectionForRelationship: function(relationshipId){
        return storage.getRelationship(relationshipId).then(function(relationship) {
          var conn;
          jsPlumb.getConnections({
            source: self.graphItemIdToElementId(relationship.sourceItemId),
            target: self.graphItemIdToElementId(relationship.relatedItemId)
          }).each(function (connection) {
            if (relationshipId == connection.getParameter(RelationshipParameter)) {
              conn = connection;
            }
            return conn;
          });
        })
          },
      removeItemRelationship: function(relationshipId) {
          self.view.connectionForRelationship(relationshipId).then(function(connection){
            jsPlumb.detach(connection);
          });
      },
      refreshRelationships: function(){
        jsPlumb.detachEveryConnection();
        return storage.getAllItemRelationships().then(function(itemRelationships){
            return self.view.drawRelationships(itemRelationships);
          });
      },
      graphItemIdToElementId: function (graphItemId) {
        return "graph-item:" + graphItemId;
      },

      itemRelationshipIdToElementId: function (itemRelationshipId) {
        return "graph-relationship:" + itemRelationshipId;
      },

      drawRelationship: function (itemRelationship) {
        storage.getAllRelationships().then(function (relDefs) {
          var relationshipDefs = toMap(relDefs, "id");
          var dynamicAnchors = [ [ 0.2, 0, 0, -1 ],  [ 1, 0.2, 1, 0 ],
            [ 0.8, 1, 0, 1 ], [ 0, 0.8, -1, 0 ] ];

          //TODO do something different heree based on relationshipType
          return jsPlumb.connect({
            source: self.view.graphItemIdToElementId(itemRelationship.sourceItemId),
            target: self.view.graphItemIdToElementId(itemRelationship.relatedItemId),
            connector: [ "Bezier", { curviness:140 } ],
            anchor: dynamicAnchors,

            hoverPaintStyle:{ strokeStyle:"cyan" },
            endpointHoverStyle:{ fillStyle:"red" },

            endPoint: [ "Dot", { radius:75 } ],
            cssClass:"graph-relationship",
            parameters: {
              relationshipId: itemRelationship.id
            },
            overlays: [
              ["Arrow", {
                width: 30, length: 30, location: 1,
                hoverPaintStyle:{
                  strokeStyle:"cyan",
                  fillStyle: "navy"
                },
                paintStyle: {
                  fillStyle: "white",
                  outlineColor: "navy",
                  lineWidth: 4
                },
                id: "graph-relationship-arrow:" + itemRelationship.id
              }
              ],
              ["Label", {
                label: relationshipDefs[itemRelationship.relationship.id].name,
                cssClass: "simple-relationship-label",
                id: "graph-relationship-label:" + itemRelationship.id,
                hoverPaintStyle:{
                  strokeStyle:"cyan",
                  fillStyle: "navy"
                }
              }
              ]
            ]
          });
        });
      },
      drawRelationships: function (itemRelationships) {
        ////TODO disable jsPlumb events
        batchDrawing = true;
        jsPlumb.batch(function(){
          return itemRelationships.map(function (itemRelationship) {
            self.view.drawRelationship(itemRelationship);
          });
        });
        batchDrawing = false;
        ////TODO re-enable jsPlumb events
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
