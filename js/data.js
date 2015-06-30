/**
 * Created by lcollins on 6/29/2015.
 */

var dataServiceFactory = (function(host, port){

  var prefix = "http://"+host+":"+port+"/";
  return {
    getAllGraphItems: function(fn){
      $.get( prefix+"graph-item", function( data ) {

        alert( "Load was performed." );
        fn(data);
      });
    },

    updateGraphItemPosition: function(graphItem, fn){
      $.put( prefix+"graph-item/"+graphItem.id+"/position/"+ graphItem.position.x+"/"+graphItem.position.y ,  function( data ) {
        alert( "Updated graph item :"+graphItem.id +" position: " + graphItem.position.x + "," + graphItem.position.y );
        fn(data);
      });
    }

  }

});
