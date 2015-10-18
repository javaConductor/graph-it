/**
 * Created by lcollins on 6/29/2015.
 */

define("selection", ["Q", "relationship"], function (Q,relationship) {

  var self;
  var obj =  {

    selectItem: function selectItem($graphView, $graphItem){
        $graphView.find("div.selection-on").switchClass("selection-on","selection-off");
        if($graphItem)
            $graphItem.switchClass("selection-off","selection-on");
        self.moveToTop($graphView, $graphItem);
        $graphView.find(".graph-relationship.selection-on").switchClass("selection-on","selection-off");
        var conns =relationship.view.findRelationshipsForItem($graphItem);

        conns.forEach(function (connection) {
            connection.addClass("selection-on");
            connection.removeClass("selection-off");
        });

    },
      moveToTop: function($parent, $graphItem){
        $graphItem.appendTo($parent);
      }


  };//obj
    self = obj;
    return obj;
});
