/**
 * Created by lcollins on 7/14/2015.
 */

define("elementId", [], function () {

    var obj = {


        createItemEditorId: function itemEditor(itemId) {
            return "itemEditor_" + ( itemId || "new");
        },

        itemIdFromEditorId: function itemIdFromEditorId(itemEditorId) {
            return itemEditorId.substr(12);
        },

        /**
         * Creates the HTML element id for a particular item
         * *** This must change when we show multiple views at once
         * @param elementId
         * @returns {string}
         */
        elementIdFromItemId: function elementIdFromItemId(elementId) {
            return 'graph-item:' + elementId;
        },

        itemIdFromItemPropertyEditorId: function itemIdFromEditorId(itemPropertyEditorId) {
            var itemId = itemPropertyEditorId.split('_')[0];
            return ( itemId == 'new') ? null : itemId;
        },

        createItemPropertyRowId: function createItemPropertyRowId(itemId, propertyName) {
            return "propertyRow_" + (itemId || 'new') + '_' + self._escapePropertyName(propertyName);
        },


        createItemPropertyNameId: function createItemPropertyNameId(itemId, propertyName) {
            return "propertyName_" + (itemId || 'new') + '_' + self._escapePropertyName(propertyName);
        },

        createItemPropertyDirtyFlagId: function createItemPropertyDirtyFlagId(itemId, propertyName) {
            return "propertyValueDirty_" + (itemId || 'new') + '_' + self._escapePropertyName(propertyName);
        },

        _escapePropertyName: function (propertyName) {
            return propertyName.replace(/[\s()]/g, '');//.propertyName.replace(/[(]/g, '').propertyName.replace(/[)]/g, '');
        },

        createItemPropertyValueId: function createItemPropertyValueId(itemId, propertyName) {
            return "" + (itemId || 'new') + '_' + self._escapePropertyName(propertyName);
        },

        findItemPropertyValueElements: function findItemPropertyValueElements($parent) {
            /// find all the children of $propertyTable with the class
            return $parent.find(".item-property-value").toArray();
        }
    };
    var self = obj;
    return obj;

});
