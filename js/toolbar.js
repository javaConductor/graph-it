/**
 * Created by lcollins on 7/12/2015.
 */

define("toolbar",["graph","relationship","storage","data"], function(graphService, relationshipService, storageService, dataService){

    var creationPosition  = {x: 100, y:100}
    
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
          alert("Creating item "+ title);
          var formData = new FormData($('#graph-item-form')[0])
            return createNewItemFromForm({
                formData: formData })
          .then(function (graphItem) {
            alert("Created item "+ title);
            newItemDialog.dialog("close");
            newItemDialog.hide();
            return graphItem;})          
      },
      Cancel: function () {
        newItemDialog.dialog("close");
        newItemDialog.hide();
      }
    }
  });

    $("#new-item-form").on("submit",function(event){
         event.preventDefault();
        var title = $("#new-item-title").val();
          console.log("Creating item "+ title);
        
          var formData = new FormData(document.querySelector("#graph-item-form"))
            return createNewItemFromForm({
                formData: formData })
          .then(function (graphItem) {
            console.log("Created item "+ title);
            newItemDialog.dialog("close");
            newItemDialog.hide();
            return graphItem;})          
    
    });
  var createNewItemFromForm = function( newItemProperties ){
      var formData = newItemProperties.formData;
      return storageService.addGraphItemFromForm(formData ).then(function(graphItem){
        graphService.createGraphItemElements($("#graph-view"), [graphItem]);

        return graphItem;
      });
  };
    

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
        $("#new-item-category").empty();
        categories.forEach(function (category) {
          var $opt = $("<option value='" + category.id + "'>" + category.name + "</option>");
          $("#new-item-category").append($opt);
        });

          $("#new-item-creation_date").val(new Date().toUTCString());
        newItemDialog.show();
        newItemDialog.dialog("open");
        return newItemDialog;
      });
    }
  };
  var self = obj;
  return obj;

});
