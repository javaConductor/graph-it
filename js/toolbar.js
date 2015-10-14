/**
 * Created by lcollins on 7/12/2015.
 */

define("toolbar", ["Q", "graph", "relationship", "storage", "data", "typeSystem", "underscore", "elementId", "popupService", "category-ui"],
    function (Q, graphService, relationshipService, storageService, dataService, typeSystem, _, elementId, popupService, categoryUI) {

        var creationPosition = {x: 100, y: 100}

        $().ready(function () {
            var $toolbar = $("#graph-toolbar");
        });

        var selectedTypeId;
        var newItemDialogSelector = "#new-item-dialog";
        var newItemDialog
        var obj = {

            _handleCategoryChange: function (category) {
                /// add to the selection
                var categoryTree = $(newItemDialogSelector).find("#new-item-category");
                self._updateDialogCategories( categoryTree , category );
                if(category)
                    categoryTree.val( category.id );
            },

            _init: function () {
                // New Item Dialog
                newItemDialog = $(newItemDialogSelector).dialog({
                    autoOpen: false,
                    height: 570,
                    width: 630,
                    modal: true,
                    title: "New Item",
                    buttons: {
                        "Create Item": function (evt) {
                            var title = $("#new-item-title").val();
                            // alert("Creating item " + title);
                            evt.preventDefault();
                            var formData = new FormData($('#graph-item-form')[0])
                            return obj.createNewItemFromForm({
                                formData: formData
                            })
                                .then(function (graphItem) {
                                    newItemDialog.dialog("close");
                                    newItemDialog.hide();
                                    return graphItem;
                                })
                        },
                        Cancel: function () {
                            newItemDialog.dialog("close");
                            newItemDialog.hide();
                        }
                    }
                });
                newItemDialog.hide();

                $("new-category-button").on("click", function (evt) {
                    popupService.editCategory(null).then(self._handleCategoryChange);
                });

                $("#new-item-type").on("change", function (event) {

                    // if the selected type changed
                    if ($("#new-item-type").val() != selectedTypeId) {
                        /// get the current data values
                        selectedTypeId = $("#new-item-type").val();
                        typeSystem.getTypeById(selectedTypeId).then(function (type) {
                            $("#new-item-type-name").val(type.name);
                        });
                        if (selectedTypeId)
                            self.handleItemTypeChange(selectedTypeId, $("#new-graph-item-properties"));
                    }
                });

                $("#new-item-form").on("submit", function (event) {
                    event.preventDefault();
                    var title = $("#new-item-title").val();
                    console.log("Creating item " + title);

                    var formData = new FormData(document.querySelector("#graph-item-form"))
                    return self.createNewItemFromForm({
                        formData: formData
                    })
                        .then(function (graphItem) {
                            console.log("Created item " + title);
                            newItemDialog.dialog("close");
                            newItemDialog.hide();
                            return graphItem;
                        })

                });

                $("#graph-toolbar-new-item").click(function () {
                    obj.openNewItemDialog();
                });

                typeSystem.resolveType(typeSystem.BASE_TYPE_NAME).then(function (baseType) {
                    return self.handleItemTypeChange(baseType.id, $("#new-graph-item-properties"));
                })
            },

            handleItemTypeChange: function (newTypeId, $parent) {

                // get type
                return typeSystem.getTypeById(newTypeId).then(function (newType) {

                    // get the defaults from type
                    var defaultValues = typeSystem.getDefaultsForType(newType);


                    // get the data
                    var currentUIValues =
                        graphService.getCurrentPropertyValues($parent)

                    var currentValues = $.extend({}, defaultValues, currentUIValues);
                    // remove the old rows
                    $parent.empty();

                    /// create the new rows
                    graphService.createPropertyRows(null, newType, currentValues, $parent, "graph-item-data-name");
                    return newType;
                })
            },

            createNewItemFromForm: function (newItemProperties) {
                var formData = newItemProperties.formData;
                var categorySelectorDialog = $(newItemDialogSelector);
                var $categoryTree = categorySelectorDialog.find("#new-item-category");
                var baseCategory = storageService.baseCategory;
                $categoryTree.data("id", baseCategory.id);
                $categoryTree.data("name", baseCategory.name);

                return storageService.getCategory($categoryTree.data("id")).then(function( category ){
                    if(!category){
                        return Q.reject("No such category: "+ $categoryTree.data("id"));
                    }
                    formData.append("categories",
                        JSON.stringify( [category]  ) );
                    formData.append( "category", category.id );
                    /// add data to formData
                    formData.append("data",
                        JSON.stringify(graphService.getCurrentPropertyValues($("#new-graph-item-properties"))));

                    return storageService.addGraphItemFromForm(formData).then(function (graphItem) {
                        graphService.createGraphItemElements($("#graph-view"), [graphItem]);
                        return graphItem;
                    });
                });
            },

            updateTypes: function ($select) {
                $select.empty();
                typeSystem.getAllTypes().then(function (types) {
                    _.each(types, function (type) {
                        var opt = $("<option></option>");
                        opt.attr("value", type.id);
                        opt.html(type.name)
                        $select.append(opt);
                    });

                });
                return $select;
            },

            _updateDialogCategories: function ($categoryTree, currentCategory ) {
                return categoryUI.createCategorySelection($categoryTree, currentCategory, function(category){
                    console.log("tree: ", $categoryTree, "cat: ", category);
                    $categoryTree.data("name", category.name);
                    $categoryTree.data("id", category.id);
                });
            },
            openNewItemDialog: function () {

                self._updateDialogCategories($("#new-item-category"), storageService.baseCategory).then(function (cats) {

                    /// fill the type select
                    self.updateTypes($("#new-item-type"));
                    typeSystem.resolveType(typeSystem.BASE_TYPE_NAME).then(function (baseType) {
                        return self.handleItemTypeChange(baseType.id, $("#new-graph-item-properties"));
                    });

                    $("#new-item-creation_date").val(new Date().toUTCString());
                    newItemDialog.show();
                    newItemDialog.dialog("open");
                    return newItemDialog;
                });
            }
        };
        var self = obj;
        obj._init();
        return obj;

    });
