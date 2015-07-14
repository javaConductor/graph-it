/**
 * Created by lcollins on 6/29/2015.
 */

define("data", ["js/libs/q/q.js"], function (Q) {

  var prefix = "http://" + window.location.hostname + ":8888/";
  return {

    getCategories:function(){
      var p = Q($.get(prefix + "graph-item/categories"));
      p.fail( function(err){
        console.log("getCategories Error: "+err)
      });
      return p;
    },
    createGraphItem:function(graphItem){
      var url = prefix + "graph-item";
      var p = Q($.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(graphItem),
        dataType: 'json',
        timeout: 120000, // 120 seconds because server is so slow
        headers: {
          Accept: "application/json"
        }
      }));

      p.fail(function (response) {
        console.log('createGraphItem failed: ', response);
      });

      return p;

    },
    getGraphItem:function(id){
      var p = Q($.get(prefix + "graph-item/"+id));
      p.fail( function(err){
        console.log("getAllGraphItems Error: "+err)
      });
      return p;
    },
    getRelationshipDefs: function () {
      var deferred = Q.defer();
      var url = prefix + "relationship";
      var p = Q($.ajax({
        type: "GET",
        url: url,
        dataType: 'json',
        timeout: 12000, // 12 seconds because server is so slow
        headers: {
          Accept: "application/json"
        }
      }));
      p.then(function (data) {
        console.log('getRelationshipDefs successful', data);
      });
      p.fail(function (response) {
        console.log('getRelationshipDefs failed: ', response);
      });
      return p;
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
