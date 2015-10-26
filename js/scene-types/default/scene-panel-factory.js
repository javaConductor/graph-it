/**
 * Created by lcollins on 10/25/2015.
 */




define("scene-panel-factory",
    ["storage","Q"],
    function (storage, Q) {


        function ScenePanel( $parent, scene, sceneMgr ) {



            var obj = {
                _init : function(){
                    // create underscore templates
                    self.$scene = self._createSceneElement ( scene ),
                        self._prepareTemplates( $scene )

// set the items
                    self._setItems(scene.getSceneItems() )
                    var relationships = self._getRelationships(scene.getSceneItems() )
                    self._addRelationships(relationships);

                },
                $scene: {},
                _createSceneElement: function (scene) {
                    /// get the scene template - background element for the items

                },
                _createSceneItemElement: function( sceneItem) {
                    // use the template to create the sceneItem Element
                    var template = _.template(
                        $("#graph-item-template").html()
                    );
                    var div = $(template(sceneItem));
                    div.draggable({
                        cursor: "move",
                        opacity: 0.35,
                        snap: true,
                        scroll: true,
                        drag: function(){
                            relationshipService.jsPlumb.repaint($(this));
                        },

                        start: function () {
                            var pos = div.position();
                            console.log("Start ", {x: pos.left, y: pos.top});
//            jsPlumb.repaint($(this));
                        },
                        stop: function (event, ui) {
                            var pos = div.position();
                            console.log("End (pos)", {x: pos.left, y: pos.top});
                            console.log("End ", {x: ui.position.left, y: ui.position.top});
                            sceneItem.position.x = Math.max(pos.left, 0);
                            sceneItem.position.y = Math.max(pos.top, 0);
                            div.animate({top: sceneItem.position.y}, function () {
                                div.animate({left: sceneItem.position.x}, function () {
                                    relationshipService.jsPlumb.repaintEverything();
                                    self.updateItemPosition(sceneItem).then( function (newsceneItem) {
                                        /// resize the parent
                                        self.resizeParentByItemPosition($("#graph-view"), sceneItem.position.x, sceneItem.position.y, div.height(), div.width());

                                        console.log("Graph Item updated ", newsceneItem.position);
                                    })
                                });
                            });
                        }
                    });
                    div.css({top: sceneItem.position.y, left: sceneItem.position.x, position: 'absolute'});
                    var divSelector = '#'+div.attr("id");
                    $(divSelector).focusin(function(){
                        console.log("focus: "+ this);
                        $(divSelector).css('border-style','solid');
                    }).focusout(function(){
                        console.log("blur: "+ this);
                        $(divSelector).css('border-style','dashed');
                    });

                    div.find(".graph-item-notes" ).blur(function(evt){
                        var notes = div.find(".graph-item-notes" ).val();
                        console.log("updating notes: "+sceneItem.id+" to "+ "["+notes+"]" );
                        storage.getSceneItem(sceneItem.id).then(function(item){
                            if(notes != item.notes){
                                storage.updateGraphItemNotes( sceneItem.id, notes).then(function(updatedItem){
                                    div.find(".graph-item-notes" ).val( updatedItem.notes );
                                });
                            }
                        });
                    });

                    div.addClass("selection-off");
                    div.click(function(e){
                        selection.selectItem($("#graph-view"), div);
                    });

                    typeSystem.resolveType(sceneItem.typeName).then(function(type){
                        self.createPropertyRows(sceneItem.id ,type,
                            sceneItem.data,
                            div.find("#graph-item-properties"), "graph-item-data-name","graph-item-data-value" );
                    });

                    return div;
                },
                    _createSceneItemElements: function( $parent, sceneItem){
                    var divs =  sceneItems.map(function (sceneItem, idx) {
                        var div = self._createSceneItemElement(sceneItem);
                        parent.append(div);
                        var dynamicAnchors = [ [ 0.2, 0, 0, -1 ],  [ 1, 0.2, 1, 0 ],
                            [ 0.8, 1, 0, 1 ], [ 0, 0.8, -1, 0 ] ];

                        var endpointOptions = {
                            anchor:[ "AutoDefault" ],
                            isSource:true,
                            isTarget:true,
                            connector : "Straight",
                            connectorStyle: { lineWidth:2, strokeStyle:'navy' },
                            scope:"blueline",
                            dragAllowedWhenFull:false
                        };

                        relationshipService.jsPlumb.registerConnectionTypes({
                            "normal": {
                                paintStyle: {
                                    strokeStyle: "yellow",
                                    lineWidth: 5,
                                    cssClass: "foo"
                                }
                            }
                        });

                        relationshipService.jsPlumb.addEndpoint( div.attr("id"), { uuid: div.attr("id")}, endpointOptions );
                        /*
                         jsPlumb.makeSource(div,{
                         //endPoint: [ "Dot", { radius:50 } ],
                         //anchor: dynamicAnchors,//["Continuous", {faces:["top","bottom","left","right"]}],
                         cssClass:"graph-relationship"
                         });

                         jsPlumb.makeTarget(div,{
                         //endpoint:[ "Rectangle", {width:30, height:5}],
                         //anchor: ["Continuous", {faces:["top","bottom","left","right"]}],
                         cssClass:"graph-relationship"
                         });
                         */
                        var tabIndex = 1 + (idx * 10);
                        div.attr("tabIndex", tabIndex);
                        div.find(".graph-item-notes" ).attr("tabIndex", tabIndex + 1);
                        return div;
                    });
                    var maxX=parent.width(),maxY=parent.height();

                    divs.forEach(function (div) {
                        maxX = Math.max( div.width() + div.position().left, maxX);
                        maxY = Math.max( div.height() + div.position().top, maxY);
                    });
                    parent.css({
                        height : (maxY+30)+"px",
                        width: (maxX+30)+"px"
                    });
                    return divs;

                },
                _prepareTemplates: function( $sceneElement ) {

                },
                _getRelationships: function(sceneItems){

                },
                _addRelationships: function(relationships){

                },
                _setItems: function(sceneItems){
                    self.createSceneItemElements($parent, sceneItems);
                }

            };
            return obj;
        }
        var self = obj;

        return function createPanel($parent, scene, sceneMgr){
        return ScenePanel($parent, scene, sceneMgr )
    }
    });

