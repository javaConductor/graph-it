/**
 * Created by lcollins on 6/24/2015.
 */

define ("relationship", ["data"], function(dataService) {
    var obj = {
      drawRelationship: function (itemId, relatedItemId, relationshipId, callbackFn) {

        jsPlumb.connect(itemId, relatedItemId);

      },
      getGraphItem: function (graphItemId, callbackFn) {
        dataService.getGraphItem(graphItemId, callbackFn)
      },
      findRelatedItem: function (relatedItemId, forced, callbackFn) {
        var relatedItem = this.findGraphItem(relatedItemId);
        if (relatedItem)
          return callbackFn( relatedItem);
        if(forced){
          // must load the item from server
          this.getGraphItem(relatedItemId, callbackFn)
        }else{
          callbackFn(null);
        }

      },
      ///// parent to search for the related items and to add to
      createRelationshipElement: function (graphItem, relationship, parent, force) {
        /// get the relatedGraphItem element

        var jqGraphItem = this.findGraphItem(graphItem.id, parent);
        var jqRelated = this.findGraphItem(relationship.relatedItemId, parent);
        /// if its not in the view and we don't want to create it
        if (jqRelated.size() == 0 && !force) {
          return null;
        }
        /// if its not found and we are forcing it then create it
        if (force && jqRelated.size() == 0) {
          dataService.getGraphItem(relationship.relatedItemId, function (relatedItem) {
            this.createGraphItemElements(parent, relatedItem);
            jqRelated = this.findGraphItem(relationship.relatedItemId, parent);
            if (!jqRelated) {
              throw Error("Could not display graphItem: " + relationship.relatedItemId);
            }
          });
        }

        this.createGraphItemRelationship(jqGraphItem, jqRelated, relationship.relationshipId);

      },
      findGraphItem: function (graphItemId, parent) {
        $("#graph-item:" + graphItemId);
      },
      createGraphItemRelationship: function (item, relatedItem, relationshipId) {

        //TODO do it
        jsPlumb.connect(item, relatedItem);

      },
      ///// parent to search for the related items and to add to
      createRelationshipElements: function (graphItem, parent, force) {
        graphItem.relationships.each(function (rel) {

        /// TODO do it
        });
      }
    };
    return obj;
});
