/**
 * Created by lcollins on 7/14/2015.
 */

define("storage", ["js/libs/q/q.js", "data"], function (Q, dataService) {

  var categoryTimeToLiveMS = 60*60*1000;
  var graphItemTimeToLiveMS = 60*60*1000;
  var relationshipsTimeToLiveMS = 30*60*1000;

  var obj =  {

    loadCategories: function loadCategories(){
      return dataService.getCategories().then(function(categories){
        localStorage["categories"] = JSON.stringify(categories);
        localStorage["categories-updated"] = ""+(new Date().getMilliseconds() + categoryTimeToLiveMS);
        return categories;
      })
    },

    addCategory: function addCategory(category){
      //dataService.createCategory(category);
      //TODO
      return dataService.createCategory(category).then(function(updatedCategory){
        return self.getCategories().then(function(categories){
          categories.push(updatedCategory);
          localStorage["categories"] = JSON.stringify( categories );
          return updatedCategory;
        });
      })
    },

    getAllCategories:function getAllCategories(){
      if ( !localStorage["categories"] ){
        return self.loadCategories().then(function(categories){
          return categories;
        });
      }else{
        var deferred = Q.defer();
        deferred.resolve(JSON.parse(localStorage["categories"]));
        return deferred.promise;
      }

    },

    categoriesExpired: function categoriesExpired(){
      return false;
    },

    loadGraphItems: function loadGraphItems(){
      return dataService.getAllGraphItems().then(function(items){
        items.forEach(function(item){
          localStorage["graph-item:"+item.id] = JSON.stringify( item );
        });
        localStorage["graph-item-updated"] = ""+(new Date().getMilliseconds() + graphItemTimeToLiveMS);
        return items;
      });
    },

    addGraphItem: function addGraphItem(graphItem){
      return dataService.createGraphItem(graphItem).then(function(updatedItem){
        localStorage["graph-item:"+updatedItem.id] = JSON.stringify( updatedItem);
        return updatedItem;
      })
    },

    getAllGraphItems: function getAllGraphItems(){
      if ( !localStorage["graph-item-updated"] ){
        return self.loadGraphItems().then(function(items){
          return items;
        });
      }else{
        var deferred = Q.defer();
        var items = [];
        for(var i = 0; i != localStorage.length; ++i){
          if (localStorage.key(i).startsWith("graph-item:")){
            var key = localStorage.key(i);
            items.push(  JSON.parse(localStorage[key]) );
          }
        }
        deferred.resolve(items);
        return deferred.promise;
      }
    },

    getGraphItem: function getGraphItem(id){
      if ( !localStorage["graph-item:"+id] ){
        return dataService.getGraphItem().then(function(item){
          localStorage["graph-item:"+ id] = JSON.stringify(item);
          return item;
        });
      }else{
        var deferred = Q.defer();
        var items = [];
        deferred.resolve(JSON.parse(localStorage["graph-item:"+ id]));
        return deferred.promise;
      }
    },

    graphItemsExpired: function graphItemsExpired(){
      return false;
    },

    loadRelationships: function loadRelationships(){
      return dataService.getRelationshipDefs().then(function(relationships){
        localStorage["graph-relationships"] = JSON.stringify(relationships);
        localStorage["graph-relationships-updated"] = ""+(new Date().getMilliseconds());
        return relationships;
      });
    },
    addRelationship: function addRelationship(relationship){
      return dataService.createRelationship(relationship).then(function(updatedRelationship){
        return self.getAllRelationships.then(function(relationships){
          relationships.push(updatedRelationship);
          localStorage["relationships"] = JSON.stringify( relationships );
          return updatedRelationship;
        });
      })

    },
    getAllRelationships:function getAllRelationships(){
      if ( !localStorage["relationships"] ){
        return self.loadRelationships().then(function(relationships){
          return relationships;
        })

      }else{
        var deferred = Q.defer();
        deferred.resolve(JSON.parse(localStorage["relationships"]));
        return deferred.promise;
      }

    },
    relationshipsExpired: function relationshipsExpired(){
      return false;
    }

  };

  var self = obj;

  return obj;

});
