/**
 * Created by lcollins on 6/29/2015.
 */

define("data", ["Q"], function (Q) {

  var prefix = "http://" + window.location.hostname + ":8888/";
  var self;
  var obj =  {

    getLocation:function(){
        return {
        host: window.location.hostname,
        port: 8888
        }
    },
    getCategories:function(){
      var p = Q($.get(prefix + "category"));
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
    createItemRelationship:function(itemRelationship){
      var url = prefix + "item-relationship";
      var p = Q($.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(itemRelationship),
        dataType: 'json',
        timeout: 120000, // 120 seconds because server is so slow
        headers: {
          Accept: "application/json"
        }
      }));

      p.fail(function (response) {
        console.log('createItemRelationship failed: ', response);
      });

      return p;
    },

    createRelationship:function(relationship){
      var url = prefix + "relationship";
      var p = Q($.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(relationship),
        dataType: 'json',
        timeout: 120000, // 120 seconds because server is so slow
        headers: {
          Accept: "application/json"
        }
      }));

      p.fail(function (response) {
        console.log('createRelationship failed: ', response);
      });

      return p;
    },

    getGraphItem:function(id){
      var p = Q($.get(prefix + "graph-item/"+id));
      p.fail( function(err){
        console.log("getAllGraphItems Error: "+err)
      });
     p.then(function (data) {
         // fix the image urls
        var dataLocation = self.getLocation()
        var images = data.images.map(function(img){
            var path = "http://"+location.host+":"+location.port + img.imagePath;
            img.imagePath=path;
            return img;
        })
        data.images=images;
        return data; 
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
        
        p.then(function(dataList){
        var dataLocation = self.getLocation()

        return dataList.map(function(data){
            var images = data.images.map(function(img){
                var path = "http://"+dataLocation.host+":"+dataLocation.port + img.imagePath;
                img.imagePath=path;
                return img;
            })
            data.images=images;
            return data; 
        })
        
        
        });
        
      return p;
    },

    getRelationshipsForGraphItems: function (graphItemIds) {

      var itemIdString = graphItemIds.join(",")

      var url = prefix + "item-relationship/for-items";
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

    getAllItemRelationships: function () {

      var url = prefix + "item-relationship";
      var p = Q($.ajax({
        type: "GET",
        url: url,
        dataType: 'json',
        timeout: 12000, // 12 seconds because server is so slow
        headers: {
          Accept: "application/json"
        }
      }));

      p.fail(function (response) {
        console.log('getAllItemRelationships failed: ', response);
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
  };
    self = obj;
    return obj;
});
