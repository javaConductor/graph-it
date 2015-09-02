/**
 * Created by lcollins on 6/29/2015.
 */

define("data", ["Q"], function (Q) {

  var prefix = "http://" + window.location.hostname + ":8888/";
  var self;
  var obj =  {

    _getLocation:function(){
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
      })).then(function(graphItem){
            graphItem.images = self._fixImageLink(graphItem.images);
            graphItem.data = graphItem.data || [];
            graphItem.notes = graphItem.notes || "";
            return graphItem;
        });
      p.fail(function (response) {
        console.log('createGraphItem failed: ', response);
      });
      return p;
    },

    createGraphItemFromForm:function( formData ){
        var url = prefix + "graph-item/form";

        var p = Q($.ajax({
            url: url,
            type: 'POST',
            data: formData,//.serialize(),//$( "#graph-item-form" ).serialize(),
            timeout: 120000, // 120 seconds because server is so slow
            headers: {
              Accept: "application/json"
            },
            processData: false,  // tell jQuery not to process the data
            contentType: false   // tell jQuery not to set contentType
        })).then(function(graphItem){
            graphItem.images = self._fixImageLink(graphItem.images);
            graphItem.data = graphItem.data || [];
            graphItem.notes = graphItem.notes || "";
            return graphItem;
        });

        p.fail(function (response) {
            console.log('createGraphItemFromForm failed: ', response);
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

    _fixImageLink: function _fixImageLink(images){
        var dataLocation = self._getLocation()
        return images.map(function(img){
            if( -1 == img.imagePath.indexOf(dataLocation.host+":"+dataLocation.port)){
                var path = "http://"+dataLocation.host+":"+dataLocation.port + img.imagePath;
                img.imagePath=path;
            }
            return img;
        });
      },

    updateGraphItemNotes: function updateGraphItemNotes(graphItemId, notes){
      var url = prefix + "graph-item/" + graphItemId + "/notes";
      notes = notes.trim();
      var p = Q($.ajax({
        type: "PUT",
        url: url,
          data: notes,
        dataType: 'text',
        timeout: 12000, // 12 seconds because server is so slow
        headers: {
          Accept: "application/json"
        }
      }));
      p.fail(function (response) {
        console.log('Update Notes failed: ', JSON.stringify(response));
      });
      return p.then(function(graphItemJson){
          console.log("updateGraphItemNotes: ");
        return JSON.parse(graphItemJson)
      });
    },

    getGraphItem: function(id){
        var p = Q($.get(prefix + "graph-item/"+id));
        p.fail( function(err){
            console.log("getAllGraphItems Error: "+err)
        });
        return p.then(function (data) {
         // fix the image urls
            var images = self._fixImageLink( data.images );
            data.notes=notes.trim();
            data.images=images;
            return data;
      });
    },

    getType: function(id){
        var p = Q($.get(prefix + "types/"+id));
        p.fail( function(err){
            console.log("getType Error: "+err)
        });
        return p;
    },

    getTypeByName: function(typeName){
        var p = Q($.get(prefix + "types/byName/"+typeName));
        p.fail( function(err){
            console.log("getTypeByName Error: "+err)
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

    getAllTypes: function () {
      var deferred = Q.defer();
      var url = prefix + "types";
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
        console.log('getAllTypes successful', data);
      });
      p.fail(function (response) {
        console.log('getAllTypes failed: ', response);
      });
      return p;
    },

    getAllGraphItems: function () {
      var p = Q($.get(prefix + "graph-item"));
      p.fail( function(err){
        console.log("getAllGraphItems Error: "+err)
      });

        p.then(function(dataList){
            var dataLocation = self._getLocation();
            return dataList.map(function(data){
                var images = self._fixImageLink( data.images );
                data.images=images;
                data.notes= data.notes || "";
                data.notes= data.notes.trim();
                data.data = data.data || [];
                return data;
                });
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
  };//obj
    self = obj;
    return obj;
});
