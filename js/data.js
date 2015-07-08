/**
 * Created by lcollins on 6/29/2015.
 */

    define("data", [  ], function(){

      var prefix = "http://localhost:"+8888+"/";
      return {
    getAllGraphItems: function(fn){
      $.get( prefix+"graph-item", function( data ) {

        //alert( "Load was performed." );
        fn(data);
      });
    },

    updateGraphItemPosition: function(graphItem, fn){

      var url = prefix+"graph-item/"+graphItem.id+"/position/"+ graphItem.position.x+"/"+graphItem.position.y;
      var xhr = $.ajax({
        type: "PUT",
        url: url,
//        contentType: 'application/json',
        //data:graphItem,
        dataType: 'json',
        timeout: 12000, // 12 seconds because server is so slow
        headers: {
          Accept: "application/json"
        }
      }).done(function( data, status, jqXHR ) {
        console.log('Update successful', data);
        fn(data);
      }).fail(function( response ) {
        console.log('Update failed: ', response);
      });
    }
  }
});
