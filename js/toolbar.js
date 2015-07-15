/**
 * Created by lcollins on 7/12/2015.
 */


define("toolbar",["graph","relationship","storage"], function(graphService, relationshipService, storageService){

  $().ready(function() {
    var $toolbar = $("#graph-toolbar");
  });

  // New Item Dialog
  var newItemDialog = $("#new-item-dialog").dialog({
    autoOpen: false,
    height: 300,
    width: 350,
    modal: true,
    title: "New Item",
    buttons: {
      "Create Item": function (evt) {
        var title = $("#new-item-title").val();
        var categories = $("#new-item-categories").val();
        createNewItem({position: {x: 200, y: 200}, title: title}).then(function (graphItem) {
          newItemDialog.dialog("close");
        })
      },
      Cancel: function () {
        newItemDialog.dialog("close");
      }
    }
  });

  $("#graph-toolbar-new-item").click(function(){
    newItemDialog.dialog('open');
  });

  var createNewItem = function createNewItem(config){
    return storageService.addGraphItem( new GraphItem(config)). then(function( graphItem){
      var div = graphService.createGraphItemElement(graphItem);
      $("#graph-view").append( div );
      return graphItem;
    });
  };

  var obj = {

    openNewItemDialog: function() {
      newItemDialog.dialog("open");
      return storageService.getCategories().then(function (categories) {
        categories.forEach(function (category) {
          var $opt = $("<option value='" + category.id + "'>" + category.name + "</option>")
          $("#new-item-categories").append($opt);
        });

        newItemDialog.dialog("open");
        return newItemDialog;
      });
    }
  };
  var self = obj;
  return obj;

});
