/**
 * Created by lcollins on 7/12/2015.
 */

define("toolbar", ["Q","graph", "relationship", "storage", "data","typeSystem", "underscore","elementId"],
    function (Q, graphService, relationshipService, storageService, dataService, typeSystem, _, elementId) {

  var creationPosition = {x: 100, y: 100}

  $().ready(function () {
    var $toolbar = $("#graph-toolbar");
  });

    var selectedTypeId;

  var newItemDialog
  var obj = {

    _init: function(){
      // New Item Dialog
      newItemDialog = $("#new-item-dialog").dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        title: "New Item",
        buttons: {
          "Create Item": function (evt) {
            var title = $("#new-item-title").val();
            // alert("Creating item " + title);
            var formData = new FormData($('#graph-item-form')[0])
            return obj.createNewItemFromForm({
              formData: formData
            })
                .then(function (graphItem) {
//                  alert("Created item " + title);
                  newItemDialog.dialog("close");
                  newItemDialog.hide();
                  return graphItem;
                })
          },
          Cancel: function () {
            newItemDialog.dialog("close");
            newItemDialog.hide();
          }
        }
      });
      newItemDialog.hide();

      $("#new-item-type").on("change", function (event) {

        // if the selected type changed
        if ($("#new-item-type").val() != selectedTypeId) {
          /// get the current data values
          selectedTypeId =  $("#new-item-type").val();
          typeSystem.getTypeById(selectedTypeId).then(function(type){
            $("#new-item-type-name").val(type.name);
          });
          if(selectedTypeId)
            self.handleItemTypeChange(selectedTypeId);
        }

      });

      $("#new-item-form").on("submit", function (event) {
        event.preventDefault();
        var title = $("#new-item-title").val();
        console.log("Creating item " + title);

        var formData = new FormData(document.querySelector("#graph-item-form"))
        return self.createNewItemFromForm({
          formData: formData
        })
            .then(function (graphItem) {
              console.log("Created item " + title);
              newItemDialog.dialog("close");
              newItemDialog.hide();
              return graphItem;
            })

      });

      $("#graph-toolbar-new-item").click(function () {
        obj.openNewItemDialog();
      });

      typeSystem.resolveType(typeSystem.BASE_TYPE_NAME).then(function(baseType){
        return self.handleItemTypeChange(baseType.id);
      })
    },

    handleItemTypeChange: function(newTypeId){

      /// get the current data values

      // get type
      return typeSystem.getTypeById(newTypeId).then(function(newType){

        // get the data
        var currentUIValues =
            self.getCurrentPropertyValues($("#graph-item-properties"))

        // remove the old rows
        $("#graph-item-properties").empty();

        /// create the new rows
        self.createPropertyRows( newType, currentUIValues, $("#graph-item-properties") );
        return newType;
      })
    },

    /// setup the linkage between the itemType select value and the
    /// data properties ( name and value )
    createPropertyRows:function (itemType, currentUIValues, $targetTable) {
      var rows = {};
      var promises = [];
      $targetTable.empty();
      /// loop through the properties and make a row for each one
      /// and the ones from the currentUIValues not yet represented
      promises = _.map(itemType.propertyDefs, function(propDef, propertyName){
        return typeSystem.createPropertyTableRow(
                propDef.typeName,
                propertyName,
                currentUIValues[propertyName],
                propDef.required,
                $targetTable) ;
      });
      Q.allSettled(promises).then(function(tableRows){
        _.each(tableRows, function(tr){
          $targetTable.append( tr.value );
        });

      });
      return rows;
    },

    getCurrentPropertyValues : function ($propertyTable) {
      var ret = {};
      _.each(elementId.findItemPropertyValueElements($propertyTable), function(valueElement){
        var $value = $(valueElement);
        var propName = $value.attr('id').substring(15);
        var value = $value.val();
        if(value)
          ret[ propName ] = value;
      });
      return ret;
    },

    createNewItemFromForm : function (newItemProperties) {
        var formData = newItemProperties.formData;
        /// add data to formData
      formData.append("data",  JSON.stringify( self.getCurrentPropertyValues($("#graph-item-properties"))) );
        return storageService.addGraphItemFromForm(formData).then(function (graphItem) {
          graphService.createGraphItemElements($("#graph-view"), [graphItem]);
          return graphItem;
        });
      },
    updateTypes: function($select){
      $select.empty();
      typeSystem.getAllTypes().then(function(types){
        _.each(types, function( type ){
          var opt =  $( "<option></option>" );
          opt.attr( "value", type.id );
          opt.html( type.name )
          $select.append( opt );
        });

      });
      return $select;
    },

      openNewItemDialog: function () {
        return storageService.getAllCategories().then(function (categories) {
          $("#new-item-category").empty();
          categories.forEach(function (category) {
            var $opt = $("<option value='" + category.id + "'>" + category.name + "</option>");
            $("#new-item-category").append($opt);
          });

          /// fill the type select
          self.updateTypes($("#new-item-type"));

          typeSystem.resolveType(typeSystem.BASE_TYPE_NAME).then(function(baseType){
            return self.handleItemTypeChange(baseType.id);
          });

          $("#new-item-creation_date").val(new Date().toUTCString());
          newItemDialog.show();
          newItemDialog.dialog("open");
          return newItemDialog;
      });
    }
  };
  var self = obj;
  obj._init();
  return obj;

});
