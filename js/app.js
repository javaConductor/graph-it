/**
 * Created by lcollins on 7/14/2015.
 */

define("graph-it-app",["data", "Q", "storage"], function(dataService, Q, storageService){

  var obj = {

    initialize: function($parent, initFn){

      jsPlumb.ready(function () {
        jsPlumb.Defaults.Connector = [ "Bezier", { curviness:140 } ];
        $(function () {
          require(["graph","toolbar","relationship"], function (graph, toolbar, relationshipService ) {
            self.graphService = graph;
            self.toolbar = toolbar;
            self.relationshipService = relationshipService;
            self.storageService = storageService;
            localStorage.clear();
            return storageService.loadCategories()
              .then(storageService.loadRelationships)
              .then(storageService.loadGraphItems)
              .then(function(){
                if(initFn){
                  return initFn(self);
                }else{
                  return null;
                }
              })
              .then(function(){
                return graph.initGraphItemElements($parent).then(function ($elements) {
                  console.log("Started...", $elements);
                  //alert("App initialized!!!");
                  jsPlumb.repaintEverything();
                });

              });

            }
          )
        });
      });
    }

  };
  var self = obj;
  return obj;
  });
