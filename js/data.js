/**
 * Created by lcollins on 6/29/2015.
 */

define("data", ["js/libs/q/q.js"], function (Q) {

  var prefix = "http://" + window.location.hostname + ":8888/";
  return {
    getRelationshipDefs: function () {
      var deferred = Q.defer();
      var url = prefix + "relationship";
      var xhr = Q($.ajax({
        type: "GET",
        url: url,
        dataType: 'json',
        timeout: 12000, // 12 seconds because server is so slow
        headers: {
          Accept: "application/json"
        }
      })).then(function (data) {
        console.log('getRelationshipDefs successful', data);
        deferred.resolve(data);
      }).fail(function (response) {
        console.log('getRelationshipDefs failed: ', response);
        deferred.reject('getRelationshipDefs failed: ' + response)
      });
      return deferred.promise;
    },

    getAllGraphItems: function () {
      var p = Q($.get(prefix + "graph-item"));
      p.fail( function(err){
        console.log("getAllGraphItems Error: "+err)
      });
      return p;
    },

    getRelationshipsForGraphItems: function (graphItemIds) {

      var itemIdString = graphItemIds.join(",")

      var url = prefix + "item-relationship";
      var p = Q($.ajax({
        type: "POST",
        url: url,
        data: itemIdString,
        dataType: 'json',
        timeout: 12000, // 12 seconds because server is so slow
        headers: {
          Accept: "application/json"
        }
      }));

      p.fail(function (response) {
        console.log('RelationshipsForGraphItems failed: ', response);
      });

      return p;
    },

    updateGraphItemPosition: function (graphItem) {

      var url = prefix + "graph-item/" + graphItem.id + "/position/" + graphItem.position.x + "/" + graphItem.position.y;
      var p = Q($.ajax({
        type: "PUT",
        url: url,
        dataType: 'json',
        timeout: 12000, // 12 seconds because server is so slow
        headers: {
          Accept: "application/json"
        }
      }));
      p.fail(function (response) {
        console.log('Update failed: ', response);
      });
      return p;
    }
  }
});
