/**
 * Created by lcollins on 6/24/2015.
 */

define("graph",
    ["data", "storage", "relationship", "typeSystem", "elementId", "Q", "selection", "popupService"],
    function (dataService, storage, relationshipService, typeSystem, elementId, Q, selection, popupService) {

        var obj = {
            getCategories: function () {
                return storage.getCategories()
            },

            getAllGraphItems: function () {
                return storage.getAllGraphItems();
            },

            findAllGraphItems: function () {
                return $('div[id^="graph-item:"]').filter(
                    function () {
                        return this.id.match(/\d+$/);
                    });
            },

            getGraphItem: function (graphItemId) {
                return storage.getGraphItem(graphItemId)
            },

            createGraphItem: function (graphItem) {
                return storage.addGraphItem(graphItem)
            },

            resizeParentByItemPosition: function ($graphView, positionX, positionY, height, width) {
                var totalWidth = 30 + Math.max(positionX + width, $graphView.width());
                var totalHeight = 30 + Math.max(positionY + height, $graphView.height());

                $graphView.css({
                    height: totalHeight + "px",
                    width: totalWidth + "px"
                });

                //console.log("resizing", $graphView, totalWidth, totalHeight);
                return {x: totalWidth, y: totalHeight};
            },

            copyGraphItem: function (item) {
                return _.clone(item)
            },
            createGraphItemElement: function (graphItem) {
                // use the template to create the graphItem Element
                var template = _.template(
                    $("#graph-item-template").html()
                );
                var div = $(template(graphItem));
                div.draggable({
                    cursor: "move",
                    opacity: 0.35,
                    snap: true,
                    scroll: true,
                    drag: function () {
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
                        graphItem.position.x = Math.max(pos.left, 0);
                        graphItem.position.y = Math.max(pos.top, 0);
                        div.animate({top: graphItem.position.y}, function () {
                            div.animate({left: graphItem.position.x}, function () {
                                relationshipService.jsPlumb.repaintEverything();
                                self.updateItemPosition(graphItem).then(function (newGraphItem) {
                                    /// resize the parent
                                    self.resizeParentByItemPosition($("#graph-view"), graphItem.position.x, graphItem.position.y, div.height(), div.width());

                                    console.log("Graph Item updated ", newGraphItem.position);
                                })
                            });
                        });
                    }
                });
                div.css({top: graphItem.position.y, left: graphItem.position.x, position: 'absolute'});
                var divSelector = '#' + div.attr("id");
                $(divSelector).focusin(function () {
                    console.log("focus: " + this);
                    $(divSelector).css('border-style', 'solid');
                }).focusout(function () {
                    console.log("blur: " + this);
                    $(divSelector).css('border-style', 'dashed');
                });

                div.find(".graph-item-notes").blur(function (evt) {
                    var notes = div.find(".graph-item-notes").val();
                    console.log("updating notes: " + graphItem.id + " to " + "[" + notes + "]");
                    storage.getGraphItem(graphItem.id).then(function (item) {
                        if (notes != item.notes) {
                            storage.updateGraphItemNotes(graphItem.id, notes).then(function (updatedItem) {
                                div.find(".graph-item-notes").val(updatedItem.notes);
                            });
                        }
                    });
                });
                div.find(".graph-item-copy").on("click", function (evt) {
                    storage.getGraphItem(graphItem.id).then(function (item) {

                        /// create a copy of graphItem
                        var newItem = self.copyGraphItem(item);
                        var newName = "";
                        while (!newName || newName == item.title) {
                            newName = popupService.promptForItemName(item.title);
                            if (!newName) {
                                alert("Must enter a new name for this item.")
                            }
                        }
                        /// we want a new identity
                        newItem._id = undefined;
                        newItem.id = undefined;
                        // ... and a new title
                        newItem.title = newName;
                        storage.addGraphItem(newItem).then(function (savedItem) {
                            self.createGraphItemElement(savedItem);
                        });
                    });

                div.find(".graph-item-delete").on("click", function (evt) {
                    storage.getGraphItem(graphItem.id).then(function (item) {

                        /// create a copy of graphItem
                        var newItem = self.copyGraphItem(item);
                        var newName = "";
                        while (!newName || newName == item.title) {
                            newName = popupService.promptForItemName(item.title);
                            if (!newName) {
                                alert("Must enter a new name for this item.")
                            }
                        }
                        /// we want a new identity
                        newItem.id = undefined;
                        // ... and a new title
                        newItem.title = newName;
                        storage.addGraphItem(newItem).then(function (savedItem) {
                            self.createGraphItemElement(savedItem);
                        });
                    });
                });

                    var notes = div.find(".graph-item-notes").val();
                    console.log("updating notes: " + graphItem.id + " to " + "[" + notes + "]");
                    storage.getGraphItem(graphItem.id).then(function (item) {
                        if (notes != item.notes) {
                            storage.updateGraphItemNotes(graphItem.id, notes).then(function (updatedItem) {
                                div.find(".graph-item-notes").val(updatedItem.notes);
                            });
                        }
                    });
                });

                div.addClass("selection-off");
                div.click(function (e) {
                    selection.selectItem($("#graph-view"), div);
                });

                typeSystem.resolveType(graphItem.typeName).then(function (type) {
                    self.createPropertyRows(graphItem.id, type,
                        graphItem.data,
                        div.find("#graph-item-properties"), "graph-item-data-name", "graph-item-data-value");
                });

                return div;
            },

            createGraphItemElements: function (parent, graphItems) {
                var divs = graphItems.map(function (graphItem, idx) {
                    var div = self.createGraphItemElement(graphItem);
                    parent.append(div);
                    var dynamicAnchors = [[0.2, 0, 0, -1], [1, 0.2, 1, 0],
                        [0.8, 1, 0, 1], [0, 0.8, -1, 0]];


                    var endpointOptions = {
                        anchor: ["AutoDefault"],
                        isSource: true,
                        isTarget: true,
                        connector: "Straight",
                        connectorStyle: {lineWidth: 2, strokeStyle: 'navy'},
                        scope: "blueline",
                        dragAllowedWhenFull: false
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

                    relationshipService.jsPlumb.addEndpoint(div.attr("id"), {uuid: div.attr("id")}, endpointOptions);
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
                    div.find(".graph-item-notes").attr("tabIndex", tabIndex + 1);
                    return div;
                });
                var maxX = parent.width(), maxY = parent.height();

                divs.forEach(function (div) {
                    maxX = Math.max(div.width() + div.position().left, maxX);
                    maxY = Math.max(div.height() + div.position().top, maxY);
                });
                parent.css({
                    height: (maxY + 30) + "px",
                    width: (maxX + 30) + "px"
                });
                return divs;
            },

            initGraphItemElements: function (parent) {
                return storage.getAllGraphItems().then(function (graphItems) {

                    var itemElements = self.createGraphItemElements(parent, graphItems);
                    relationshipService.view.refreshRelationships();
                    return itemElements;
                });
            },

            /// setup the linkage between the itemType select value and the
            /// data properties ( name and value )
            createPropertyRows: function (itemId, itemType, currentUIValues, $targetTable, labelClass, valueClass) {
                var rows = {};
                var promises = [];
                $targetTable.empty();
                /// loop through the properties and make a row for each one
                /// and the ones from the currentUIValues not yet represented
                promises = _.map(itemType.propertyDefs, function (propDef, propertyName) {
                    return typeSystem.createPropertyTableRow(itemId,
                        propDef.typeName,
                        propertyName,
                        currentUIValues[propertyName],
                        propDef.required, propDef.readOnly,
                        $targetTable, labelClass, valueClass);
                });
                Q.all(promises).then(function (tableRows) {
                    _.each(tableRows, function (tr) {
                        $targetTable.append(tr);
                    });
                }, function (err) {
                    console.log("Error: " + err);
                });
                return rows;
            },

            getCurrentPropertyValues: function ($propertyTable) {
                var ret = {};
                _.each(elementId.findItemPropertyValueElements($propertyTable), function (valueElement) {
                    var $value = $(valueElement);
                    var propName = $value.data('propertyName');
                    var value = $value.val() || $value.text();
                    if (value)
                        ret[propName] = value;
                });
                return ret;
            },

            updateItemPosition: function (graphItem) {
                return dataService.updateGraphItemPosition(graphItem).then(function (graphItem) {
                    return storage.updateGraphItem(graphItem);
                });
            },

            findGraphItem: function (graphItemId, parent) {
                var item = $("#graph-item:" + graphItemId);
                return item.size() > 0 ? item : null;
            }
        };
        var self = obj;
        return obj;
    });


