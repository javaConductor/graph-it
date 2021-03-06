/**
 * Created by lcollins on 7/14/2015.
 */

define("storage", ["Q", "data"], function (Q, dataService) {

    var categoryTimeToLiveMS = 60 * 60 * 1000;
    var graphItemTimeToLiveMS = 60 * 60 * 1000;
    var relationshipsTimeToLiveMS = 30 * 60 * 1000;
    var relationshipKey = "graph-relationships";
    var relationshipUpdatedKey = "graph-relationships-updated";
    var categoryKey = "categories";
    var categoryUpdateKey = "categories-updated";
    var graphItemKeyPrefix = "graph-item:";
    var graphItemUpdateKey = "graph-item-updated";
    var itemRelationshipKeyPrefix = "graph-item-relationships:"
    var itemRelationshipUpdateKey = "graph-item-relationships-updated"
    var graphItemTypePrefix = "graph-item-type:"
    var graphItemTypeUpdateKey = "graph-item-type-updated"
    var obj = {

        ///////////////////////////////////////////////////////////////////
        /// Category Stuff
        ///////////////////////////////////////////////////////////////////
        loadCategories: function loadCategories() {
            return dataService.getCategories().then(function (categories) {

                var baseCategory = _.find(categories, function (category) {
                    return category.name = "ALL";
                });
                self.baseCategory = baseCategory;
                localStorage[categoryKey] = JSON.stringify(categories);
                console.dir("Storage: Added categories:", categories);
                localStorage[categoryUpdateKey] = "" + (new Date().getMilliseconds() + categoryTimeToLiveMS);
                return categories;
            })
        },

        baseCategory: {},
        addCategory: function addCategory(category) {
            return dataService.createCategory(category).then(function (updatedCategory) {
                return self.getCategories().then(function (categories) {
                    categories.push(updatedCategory);
                    localStorage[categoryKey] = JSON.stringify(categories);
                    return updatedCategory;
                });
            })
        },

        getAllCategories: function getAllCategories() {
            if (!localStorage[categoryKey]) {
                return self.loadCategories().then(function (categories) {
                    return categories;
                });
            } else {
                var deferred = Q.defer();
                deferred.resolve(JSON.parse(localStorage[categoryKey]));
                return deferred.promise;
            }

        },

        getCategory: function getCategory(id) {
            if (!localStorage[categoryKey]) {
                return self.loadCategories().then(function (categories) {
                    return categories;
                });
            } else {
                return self.getAllCategories().then(function (categories) {
                    var ret = categories.filter(function (category) {
                        return category.id == id;
                    });
                    return (ret.length > 0) ? ret[0] : null;
                });
            }
        },

        categoriesExpired: function categoriesExpired() {
            return false;
        },

        ///////////////////////////////////////////////////////////////////
        /// Graph Item Stuff
        ///////////////////////////////////////////////////////////////////
        loadGraphItems: function loadGraphItems() {
            return dataService.getAllGraphItems().then(function (items) {
                items.forEach(function (item) {
                    localStorage[graphItemKeyPrefix + item.id] = JSON.stringify(item);
                    console.dir("Storage: Added graph-item:" + item.id, item);
                });
                localStorage[graphItemUpdateKey] = "" + (new Date().getMilliseconds() + graphItemTimeToLiveMS);
                return items;
            });
        },

        addGraphItem: function addGraphItem(graphItem) {
            return dataService.createGraphItem(graphItem).then(function (updatedItem) {
                localStorage[graphItemKeyPrefix + updatedItem.id] = JSON.stringify(updatedItem);
                return updatedItem;
            })
        },

        addGraphItemFromForm: function addGraphItemFromForm(formData) {
            var p = dataService.createGraphItemFromForm(formData);
            p.then(function (updatedItem) {
                localStorage[graphItemKeyPrefix + updatedItem.id] = JSON.stringify(updatedItem);
                return updatedItem;
            });
            return p
        },

        updateGraphItem: function updateGraphItem(graphItem) {
            return dataService.updateGraphItem(graphItem).then(function (updatedItem) {
                localStorage[graphItemKeyPrefix + updatedItem.id] = JSON.stringify(updatedItem);
                return updatedItem;
            })
        },

        updateGraphItemNotes: function updateGraphItemNotes(graphItemId, notes) {
            return dataService.updateGraphItemNotes(graphItemId, notes).then(function (updatedItem) {
                localStorage[graphItemKeyPrefix + updatedItem.id] = JSON.stringify(updatedItem);
                return updatedItem;
            })
        },


        getAllGraphItems: function getAllGraphItems() {
            if (!localStorage["graph-item-updated"]) {
                return self.loadGraphItems().then(function (items) {
                    return items;
                });
            } else {
                var deferred = Q.defer();
                var items = [];
                for (var i = 0; i != localStorage.length; ++i) {
                    if (localStorage.key(i).startsWith(graphItemKeyPrefix)) {
                        var key = localStorage.key(i);
                        items.push(JSON.parse(localStorage[key]));
                    }
                }
                deferred.resolve(items);
                return deferred.promise;
            }
        },

        removeGraphItem: function removeGraphItem(id) {
            console.log("Removing item: "+ id);
            if (localStorage[graphItemKeyPrefix + id]) {
                return dataService.deleteGraphItem(id).then(function (success) {
                    if(success)
                        localStorage[graphItemKeyPrefix + id] = undefined;
                    return success;
                });
            }
            Q.resolve(false);
        },

        getGraphItem: function getGraphItem(id) {
            if (!localStorage[graphItemKeyPrefix + id]) {
                return dataService.getGraphItem().then(function (item) {
                    localStorage[graphItemKeyPrefix + id] = JSON.stringify(item);
                    return item;
                });
            } else {
                var deferred = Q.defer();
                var items = [];
                deferred.resolve(JSON.parse(localStorage[graphItemKeyPrefix + id]));
                return deferred.promise;
            }
        },

        graphItemsExpired: function graphItemsExpired() {
            return false;
        },
        ///////////////////////////////////////////////////////////////////
        /// Relationship Def Stuff
        ///////////////////////////////////////////////////////////////////
        loadRelationships: function loadRelationships() {
            return dataService.getRelationshipDefs().then(function (relationships) {
                localStorage[relationshipKey] = JSON.stringify(relationships);
                console.dir("Storage: Added graph-relationships:", localStorage[relationshipKey]);
                localStorage[relationshipUpdatedKey] = "" + (new Date().getMilliseconds());
                return relationships;
            });
        },
        addRelationship: function addRelationship(relationship) {
            return dataService.createRelationship(relationship).then(function (updatedRelationship) {
                return self.getAllRelationships.then(function (relationships) {
                    relationships.push(updatedRelationship);
                    localStorage[relationshipKey] = JSON.stringify(relationships);
                    return updatedRelationship;
                });
            })
        },

        getRelationship: function getRelationship(id) {
            return self.getAllRelationships().then(function (relationships) {
                var ret = relationships.filter(function (relationship) {
                    return relationship.id == id;
                });
                return (ret.length > 0) ? ret[0] : null;
            });
        },

        getAllRelationships: function getAllRelationships() {
            if (!localStorage[relationshipKey]) {
                return self.loadRelationships().then(function (relationships) {
                    return relationships;
                })

            } else {
                var deferred = Q.defer();
                deferred.resolve(JSON.parse(localStorage[relationshipKey]));
                return deferred.promise;
            }

        },
        relationshipsExpired: function relationshipsExpired() {
            return false;
        },
        ///////////////////////////////////////////////////////////////////
        /// Item Relationship Stuff
        ///////////////////////////////////////////////////////////////////
        loadItemRelationships: function loadItemRelationships() {
            return dataService.getAllItemRelationships().then(function (itemRelationships) {
                itemRelationships.forEach(function (itemRelationship) {
                    localStorage[itemRelationshipKeyPrefix + itemRelationship.id] = JSON.stringify(itemRelationship);
                    console.dir("Storage: Added graph-item-relationship:" + itemRelationship.id, itemRelationship);
                });
                localStorage[itemRelationshipUpdateKey] = "" + (new Date().getMilliseconds());
                return itemRelationships;
            });
        },

        addItemRelationship: function addItemRelationship(itemRelationship) {
            return dataService.createItemRelationship(itemRelationship).then(function (updatedRelationship) {
                localStorage[itemRelationshipKeyPrefix + updatedRelationship.id] = JSON.stringify(updatedRelationship);
                return updatedRelationship;
            })
        },

        removeItemRelationship: function removeItemRelationship(id) {
            return dataService.removeItemRelationship(id).then(function (ok) {
                localStorage[itemRelationshipKeyPrefix + id] = null;
                return ok;
            })
        },

        getAllItemRelationships: function getAllItemRelationships() {
            if (!localStorage[itemRelationshipUpdateKey]) {
                return self.loadItemRelationships().then(function (relationships) {
                    return relationships;
                })
            } else {
                var deferred = Q.defer();
                var relationships = [];
                for (var i = 0; i != localStorage.length; ++i) {
                    if (localStorage.key(i).startsWith(itemRelationshipKeyPrefix)) {
                        var key = localStorage.key(i);
                        relationships.push(JSON.parse(localStorage[key]));
                    }
                }
                deferred.resolve(relationships);
                return deferred.promise;
            }

        },

        itemRelationshipsExpired: function itemRelationshipsExpired() {
            return false;
        },
        ///////////////////////////////////////////////////////////////////
        /// Item Type Stuff
        ///////////////////////////////////////////////////////////////////

        loadItemTypes: function loadItemTypes() {
            return dataService.getAllTypes().then(function (itemTypes) {
                itemTypes.forEach(function (itemType) {
                    localStorage[graphItemTypePrefix + itemType.id] = JSON.stringify(itemType);
                    //console.dir("Storage: Added item-type:"+itemType.id, itemType);
                });
                localStorage[graphItemTypeUpdateKey] = "" + (new Date().getMilliseconds());
                return itemTypes;
            });
        },

        findTypeByName: function (types, typeName) {
            return _.find(types, function (type) {
                return typeName == type.name;
            });
        },

        getTypeByName: function (typeName) {
            return self.getAllTypes().then(function (types) {
                return self.findTypeByName(types, typeName);
            });
        },

        getAllTypes: function getAllTypes() {
            if (!localStorage[graphItemTypeUpdateKey]) {
                return self.loadItemTypes().then(function (itemTypes) {
                    return itemTypes;
                })
            } else {
                var deferred = Q.defer();
                var ret = [];
                var itemTypeRegEx = new RegExp('^' + graphItemTypePrefix);

                for (var i = 0, len = localStorage.length; i < len; ++i) {
                    var key = localStorage.key(i);
                    var value = localStorage.getItem(key);
                    //console.log( localStorage.getItem( localStorage.key( i ) ) );
                    if (itemTypeRegEx.test(key)) {
                        // add type to list
                        ret.push(JSON.parse(value));
                    }
                }

                deferred.resolve(ret);
                return deferred.promise;
            }

        },


        getType: function getType(typeId) {
            if (!localStorage[graphItemTypePrefix + typeId]) {
                return dataService.getType(typeId).then(function (type) {
                    localStorage[graphItemTypePrefix + typeId] = JSON.stringify(type);
                    return type;
                });
            } else {
                var deferred = Q.defer();
                deferred.resolve(JSON.parse(localStorage[graphItemTypePrefix + typeId]));
                return deferred.promise;
            }
        }

    };

    var self = obj;

    return obj;

});
