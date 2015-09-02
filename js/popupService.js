/**
 * Created by lcollins on 7/16/2015.
 */

define("popupService", ["storage", "Q", "underscore"], function (storageService, Q, _) {


  _.templateSettings.variable = "rc";

  //var updateSelect = function ($select, objectArray, valueField, displayField, currentValue) {
  //  objectArray.forEach(function (obj) {
  //    var s = (currentValue && currentValue == obj[valueField]) ? " selected='selected' " : "";
  //    $select.append($("<option " + s + " value='" + obj[valueField] + "'>" + obj[displayField] + "</option>"));
  //    console.debug("Select: " + obj[valueField] + "-->>" + obj[displayField]);
  //  });
  //};
  var relationshipSelectorDialog;
  var obj = {

    selectRelationship: function selectRelationship(currentSelectionValue) {
      var deferred = Q.defer();

      // if Relationship Dialog doesn't exist then create it
      //if (!relationshipSelectorDialog) {
        storageService.getAllRelationships().then(function (relationships) {

          var template = _.template(
            $("#relationship-selector-dialog-template").html()
          );

          $("body").append(template({
            relationships: relationships
          }));

          relationshipSelectorDialog = $("#relationship-selector-dialog").dialog({
            autoOpen: false,
            height: 300,
            width: 350,
            modal: true,
            title: "Select Relationship",
            buttons: {
              "Select": function (evt) {
                /// user chose a relationship
                var relationshipId = $('#relationship-selector-relationship').val();
                storageService.getRelationship(relationshipId).then(function (relationship) {
                  alert("Relationship: " + relationship.name + " was chosen.");
                  deferred.resolve(relationship)
                  $("#relationship-selector-dialog").dialog("close");
                });
              }
            },
            Cancel: function () {
              relationshipSelectorDialog.dialog("close");
              relationshipSelectorDialog.hide();
              alert("No relationship was chosen.");
              deferred.reject("Dialog Cancelled.")
            }
          });

          if ( currentSelectionValue )
            $("#relationship-selector-relationship").val(currentSelectionValue);
          relationshipSelectorDialog.dialog("open");
        });

      return deferred.promise;
    }
  };
  return obj;
});
