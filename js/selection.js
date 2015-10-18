/**
 * Created by lcollins on 6/29/2015.
 */

define("selection", ["Q", "relationship","elementId"], function (Q,relationship,elementId) {

  var self;
  var obj =  {

    selectItem: function selectItem($graphView, $graphItem){
        $graphView.find("div.selection-on").switchClass("selection-on","selection-off");
        if($graphItem)
            $graphItem.switchClass("selection-off","selection-on");
        self._moveToTop($graphView, $graphItem);
        //$graphView.find(".graph-relationship.selection-on").switchClass("selection-on","selection-off");
        var conns =relationship.view.allRelationships();
        conns.forEach(function (connection) {
            if (connection.sourceId ==  $graphItem.attr("id") || connection.targetId ==  $graphItem.attr("id") ) {

                connection.getOverlays()["graph-relationship-label:"+connection.getParameter("relationshipId")].addClass("selection-on")
                connection.getOverlays()["graph-relationship-label:"+connection.getParameter("relationshipId")].removeClass("selection-off")

                connection.addClass("selection-on");
                connection.removeClass("selection-off");
            }else{
                connection.getOverlays()["graph-relationship-label:"+connection.getParameter("relationshipId")].addClass("selection-off")
                connection.getOverlays()["graph-relationship-label:"+connection.getParameter("relationshipId")].removeClass("selection-on")

                connection.addClass("selection-off");
                connection.removeClass("selection-on");
            }
        });
    },
      _moveToTop: function($parent, $graphItem){
        $graphItem.appendTo($parent);
      }


  };//obj
    self = obj;
    return obj;
});
