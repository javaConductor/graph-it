/**
 * Created by lcollins on 7/14/2015.
 */

define("elementId", [], function () {

  var obj =  {

    createItemEditorId: function itemEditor(itemId){
      return "item-editor:"+( itemId || "new");
    },

    itemIdFromEditorId: function itemIdFromEditorId(itemEditorId){
      return itemEditorId.substr(12);
    },

    createItemPropertyRowId: function createItemPropertyRowId(propertyName){
      return "property-row:"+propertyName;
    },

    propertyNameFromItemPropertyRowId: function propertyNameFromItemPropertyRowId(itemPropertyRowId){
      return itemPropertyRowId.split(":")[1];
    },

    createItemPropertyNameId: function createItemPropertyNameId(propertyName){
      return "property-name:"+propertyName;
    },

    findItemPropertyNameElements: function findItemPropertyNameElements($parent){
      /// find all the children of $propertyTable where the id="property:*;name"
      return $parent.find("[id|='property-name:']").toArray();
      //a[hreflang|='en']
    },

    propertyNameFromItemPropertyNameId: function propertyNameFromItemPropertyNameId(itemPropertyNameId){
      return itemPropertyNameId.split(":")[1];
    },

    createItemPropertyValueId: function createItemPropertyValueId(propertyName){
      return "property-value:"+propertyName;
    },

    findItemPropertyValueElements: function findItemPropertyValueElements($parent){
      /// find all the children of $propertyTable where the id="property:*;value"
      return $parent.find("[id|=property-value:]").toArray();
    },

    propertyNameFromItemPropertyValueId: function propertyNameFromItemPropertyValueId(itemPropertyValueId){
      return itemPropertyValueId.split(":")[1];
    }

  };

  var self = obj;

  return obj;

});
