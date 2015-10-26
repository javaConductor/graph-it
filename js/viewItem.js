/**
 * Created by lcollins on 6/29/2015.
 */

define("viewItem", ["Q", "relationship"], function (Q,relationship) {

  var self;

      var ExampleApplication = React.createClass({
          render: function() {
              var elapsed = Math.round(this.props.elapsed  / 100);
              var seconds = elapsed / 10 + (elapsed % 10 ? '' : '.0' );
              var message =
                  'React has been successfully running for ' + seconds + ' seconds.';
              return React.DOM.p(null, message);
          }
      });

    // Call React.createFactory instead of directly call ExampleApplication({...}) in React.render
    var ExampleApplicationFactory = React.createFactory(ExampleApplication);

    var obj =  {

        selectItem: function selectItem($graphView, $graphItem){
        if($graphView.find("div.selection-on").index($graphItem) > -1 )
            return;
        $graphView.find("div.selection-on").switchClass("selection-on","selection-off");
        if($graphItem)
            $graphItem.switchClass("selection-off","selection-on");
        self._moveToTop($graphView, $graphItem);
        var conns =relationship.view.allRelationships();
        conns.forEach(function (connection){

            var currentRelationshipId = connection.getParameter("relationshipId");
            //var labelOverlay = connection.getOverlays()["graph-relationship-label:"+currentRelationshipId];
            var labelOverlay = connection.getOverlays()["graph-relationship-label:"+currentRelationshipId];
            if (connection.sourceId ==  $graphItem.attr("id") || connection.targetId ==  $graphItem.attr("id") ) {

                if(connection.hasClass("selection-on")){
                    return;
                }
                connection.setPaintStyle({"lineWidth":7, "strokeStyle": 'white' });

                labelOverlay.addClass("selection-on")
                labelOverlay.removeClass("selection-off")

                connection.updateClasses(["selection-on"],["selection-off"]);

            }else{

                if(connection.hasClass("selection-off")){
                    return;
                }
                connection.setPaintStyle({"lineWidth":4, "strokeStyle": 'gray'});

                labelOverlay.addClass("selection-off")
                labelOverlay.removeClass("selection-on")

                connection.updateClasses(["selection-off"],["selection-on"]);

                //connection.endpoints[0].addClass("selection-off")
                //connection.endpoints[1].addClass("selection-off")
                //connection.endpoints[0].removeClass("selection-on")
                //connection.endpoints[1].removeClass("selection-on")
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
