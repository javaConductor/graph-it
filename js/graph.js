/**
 * Created by lcollins on 6/24/2015.
 */

define("graph", ["data", "storage", "relationship"], function (dataService, storage, relationshipService) {

  var obj = {
    getCategories: function () {
      return storage.getCategories()
    },

    getAllGraphItems: function () {
      return storage.getAllGraphItems();
    },

    findAllGraphItems: function () {
      return $('div[id^="graph-item:"]').filter(
        function () {
          return this.id.match(/\d+$/);
        });
    },

    getGraphItem: function (graphItemId) {
      return storage.getGraphItem(graphItemId)
    },

    createGraphItem: function (graphItem) {
      return storage.addGraphItem(graphItem)
    },

    createGraphItemElement: function (graphItem) {
      // use the template to create the graphItem Element
      var template = _.template(
        $("#graph-item-template").html()
      );
//      $("body").append(template(graphItem));
      var div = $(template(graphItem));
      div.draggable({
          cursor: "move",
          opacity: 0.35,
          snap: true,
          scroll: true,
          drag: function(){
            jsPlumb.repaint($(this));
          },

          start: function () {
            var pos = div.position();
            console.log("Start ", {x: pos.left, y: pos.top});
//            jsPlumb.repaint($(this));
          },
          stop: function (event, ui) {
            var pos = div.position();
            console.log("End (pos)", {x: pos.left, y: pos.top});
            console.log("End ", {x: ui.position.left, y: ui.position.top});
            graphItem.position.x = Math.max(pos.left, 0);
            graphItem.position.y = Math.max(pos.top, 0);
            div.animate({top: graphItem.position.y}, function () {
              div.animate({left: graphItem.position.x}, function () {
                jsPlumb.repaintEverything();
                self.updateItemPosition(graphItem).then( function (newGraphItem) {
                  console.log("Graph Item updated ", newGraphItem.position);
                })
              });
            });
          }
        });
        div.css({top: graphItem.position.y, left: graphItem.position.x, position: 'absolute'});
        var divSelector = '#'+div.attr("id");
        $(divSelector).focusin(function(){
            console.log("focus: "+ this);
            $(divSelector).css('border-style','solid');
        }).focusout(function(){
            console.log("blur: "+ this);
            $(divSelector).css('border-style','dashed');
        });

        div.find(".graph-item-notes" ).blur(function(evt){
            var notes = div.find(".graph-item-notes" ).val();
            console.log("updating notes: "+graphItem.id+" to "+ "["+notes+"]" );
            storage.getGraphItem(graphItem.id).then(function(item){
                if(notes != item.notes){
                    storage.updateGraphItemNotes( graphItem.id, notes).then(function(updatedItem){
                        div.find(".graph-item-notes" ).val( updatedItem.notes );
                    });
                }
            });
        });

        return div;
    },

    createGraphItemElements: function (parent, graphItems) {
      var divs =  graphItems.map(function (graphItem, idx) {
        var div = self.createGraphItemElement(graphItem);
        parent.append(div);
        var dynamicAnchors = [ [ 0.2, 0, 0, -1 ],  [ 1, 0.2, 1, 0 ],
          [ 0.8, 1, 0, 1 ], [ 0, 0.8, -1, 0 ] ];

          
          var endpointOptions = {
    anchor:[ "TopCenter", "BottomCenter" ], 
      isSource:true, 
      isTarget:true,
      connector : "Straight",
      connectorStyle: { lineWidth:2, strokeStyle:'navy' },
      scope:"blueline",
      dragAllowedWhenFull:false  
}; 
   
    jsPlumb.addEndpoint( div.attr("id"), { uuid: div.attr("id")}, endpointOptions );
/*
        jsPlumb.makeSource(div,{
          //endPoint: [ "Dot", { radius:50 } ],
          //anchor: dynamicAnchors,//["Continuous", {faces:["top","bottom","left","right"]}],
          cssClass:"graph-relationship"
        });

        jsPlumb.makeTarget(div,{
          //endpoint:[ "Rectangle", {width:30, height:5}],
          //anchor: ["Continuous", {faces:["top","bottom","left","right"]}],
          cssClass:"graph-relationship"
        });
  */        
        var tabIndex = 1 + (idx * 10);
        div.attr("tabIndex", tabIndex);
        div.find(".graph-item-notes" ).attr("tabIndex", tabIndex + 1);
        return div;
      });
      return divs;
    },

    initGraphItemElements: function (parent) {
      return storage.getAllGraphItems().then(function(graphItems){

        var itemElements = self.createGraphItemElements(parent, graphItems);
        relationshipService.view.refreshRelationships();
        return itemElements;
        });
    },

    updateItemPosition: function (graphItem) {
      return dataService.updateGraphItemPosition(graphItem).then(function(graphItem){
        return storage.updateGraphItem(graphItem);
      });
    },

    findGraphItem: function (graphItemId, parent) {
      var item = $("#graph-item:" + graphItemId);
      return item.size() > 0 ? item : null;
    }
  };
  var self = obj;
  return obj;
});


