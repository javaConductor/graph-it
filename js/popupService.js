/**
 * Created by lcollins on 7/16/2015.
 */

define("popupService", ["storage", "Q", "underscore"], function (storageService, Q, _) {


        _.templateSettings.variable = "rc";

        var relationshipTemplateSelector = "#relationship-selector-dialog-template";
        var categoryTemplateSelector = "#category-editor-template";
        var relationshipSelectorDialog;
        var categoryDialog;
        var obj = {
            promptForItemName : function (suggestion) {
                return window.prompt("Item name:", suggestion || "");
            },

            editCategory: function editCategory(categoryToEdit) {
                var deferred = Q.defer();
                var template = _.template(
                    $(categoryTemplateSelector).html()
                );

                $("body").append(template({
                    category: categoryToEdit
                }));
                var saveOrCreate = categoryToEdit ? "Create" : "Save";

                var buttons = {};

                buttons[saveOrCreate] = function saveCategory(evt) {
                    /// user saved a category
                    // get name and parent
                    var name = $(categoryTemplateSelector).find(".category-name").val();
                    var parent = $(categoryTemplateSelector).find(".parent-name").val();
                    // get id if any
                    var catId = $(categoryTemplateSelector).find(".category-id").val();

                    var category = {
                        name : name
                    }
                    var relationshipId = $(categoryTemplateSelector).val();
                    storageService.getRelationship(relationshipId).then(function (relationship) {
                        alert("Relationship: " + relationship.name + " was chosen.");
                        deferred.resolve(relationship)
                        $("#relationship-selector-dialog").dialog("close");
                    });
                };

                buttons["Cancel"] = function () {
                    categoryDialog.dialog("close");
                    categoryDialog.hide();
                    alert("No category was chosen.");
                    deferred.reject("Dialog Cancelled.")
                };

                categoryDialog = $(categoryTemplateSelector).dialog({
                    autoOpen: false,
                    height: 300,
                    width: 350,
                    modal: true,
                    title: categoryToEdit ? "Edit Category" : "New Category",
                    buttons: buttons
                });

                if (currentSelectionValue)
                    $(categoryTemplateSelector).val(currentSelectionValue);
                categoryDialog.dialog("open");
                return deferred.promise;
            },

            selectRelationship: function selectRelationship(currentSelectionValue) {
                var deferred = Q.defer();

                // if Relationship Dialog doesn't exist then create it
                //if (!relationshipSelectorDialog) {
                storageService.getAllRelationships().then(function (relationships) {
                    if(!relationshipSelectorDialog) {
                        var template = _.template(
                            $(relationshipTemplateSelector).html()
                        );
                        relationshipSelectorDialog = $(template({
                                relationships: relationships
                            }));

                        $("body").append(relationshipSelectorDialog);

                        relationshipSelectorDialog.dialog({
                            autoOpen: false,
                            height: 300,
                            width: 350,
                            modal: true,
                            title: "Select Relationship",
                            buttons: {
                                "Select": function (evt) {
                                    /// user chose a relationship
                                    var relationshipId = $('#relationship-selector-relationship').val();
                                    storageService.getRelationship(relationshipId).then(function (relationship) {
                                        alert("Relationship: " + relationship.name + " was chosen.");
                                        deferred.resolve(relationship)
                                        relationshipSelectorDialog.dialog("close");
                                    });
                                }
                            },
                            Cancel: function () {
                                relationshipSelectorDialog.dialog("close");
                                relationshipSelectorDialog.hide();
                                alert("No relationship was chosen.");
                                deferred.reject("Dialog Cancelled.")
                            }
                        });
                    }
                    if (currentSelectionValue)
                        $("#relationship-selector-relationship").val(currentSelectionValue);
                    relationshipSelectorDialog.dialog("open");
                });

                return deferred.promise;
            }
        };
return obj;
});
