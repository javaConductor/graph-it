/**
 * Created by lcollins on 7/12/2015.
 */


define("toolbar",["graph","relationship"], function(graphService, relationshipService){

  $().ready(function() {
    var $toolbar = $("#graph-toolbar");

    $(window).scroll(function(){
      $toolbar
        .stop()
        .animate({"marginTop": ($(window).scrollTop() + 30) + "px"}, "slow" );
    });
  });




  var newItemDialog = $("#new-item-dialog").dialog({
    autoOpen: false,
    height: 300,
    width: 350,
    modal: true,
    title: "New Item",
    buttons: {
      "Create Item": function (evt) {
        var title = $("#new-item-title").val();
        //var categories = $("#new-item-categories").val();
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

    return graphService.createGraphItem( new GraphItem(config)). then(function( graphItem){
      var div = graphService.createGraphItemElement(graphItem);
      $("#graph-view").append( div );
    });
  };

  var obj = {

    openNewItemDialog: function() {

      newItemDialog.dialog("open");
//
//      return graphService.getCategories().then(function (categories) {
//
//        if(false) categories.forEach(function (category) {
//          var $opt = $("<option value='" + category.id + "'>" + category.name + "</option>")
//          $("#new-item-categories").append($opt);
//        });
//
////        $("#new-item-dialog").show();
//        newItemDialog.dialog("open");
//      });
    }
  };
  var self = obj;
  return obj;

});


