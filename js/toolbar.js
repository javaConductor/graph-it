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
        var categoryId = $("#new-item-category").val();
        storageService.getCategory( categoryId)
          .then(function(category){
            return createNewItem({
            position: {x: 200, y: 200},
            categories: [ category ],
            title: title})
          .then(function (graphItem) {
            newItemDialog.dialog("close");
            newItemDialog.hide();
            return graphItem;})
        })
      },
      Cancel: function () {
        newItemDialog.dialog("close");
        newItemDialog.hide();
      }
    }
  });

  newItemDialog.hide();

  $("#graph-toolbar-new-item").click(function(){
    obj.openNewItemDialog();
  });

  var createNewItem = function createNewItem(config){
    return storageService.addGraphItem( new GraphItem(config)). then(function( graphItem){
      graphService.createGraphItemElements($("#graph-view"), [graphItem]);
      return graphItem;
    });
  };

  var obj = {

    openNewItemDialog: function() {
//      newItemDialog.dialog("open");
      return storageService.getAllCategories().then(function (categories) {
        categories.forEach(function (category) {
          var $opt = $("<option value='" + category.id + "'>" + category.name + "</option>")
          $("#new-item-category").append($opt);
        });

        newItemDialog.show();
        newItemDialog.dialog("open");
        return newItemDialog;
      });
    }
  };
  var self = obj;
  return obj;

});
