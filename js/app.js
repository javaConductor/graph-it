/**
 * Created by lcollins on 7/14/2015.
 */

define("graph-it-app",["data", "Q", "storage","toolbar"], function(dataService, Q, storageService, toolbar){

  var obj = {

    initialize: function($parent, initFn){

      jsPlumb.ready(function () {
        $(function () {
          require(["graph","relationship"], function (graph,  relationshipService ) {
            self.graphService = graph;
            //self.toolbar = toolbar;
            self.relationshipService = relationshipService;
            relationshipService.jsPlumb.Defaults.Connector = [ "Bezier", { curviness:140 } ];
            self.storageService = storageService;
            localStorage.clear();
            return storageService.loadCategories()
              .then(storageService.loadItemTypes)
              .then(storageService.loadRelationships)
              .then(storageService.loadGraphItems)
              .then(function(){
                if(initFn){
                  return initFn(self);
                }else{
                  return null;
                }
              })
              .then(function(initFnResult){
                return graph.initGraphItemElements($parent).then(function ($elements) {
                  console.log("Started...", $elements);
                  //alert("App initialized!!!");
                  relationshipService.jsPlumb.repaintEverything();
                });

              });

            }//require
          )
        });
      });
    }

  };
  var self = obj;
  return obj;
  });
