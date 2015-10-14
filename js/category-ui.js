/**
 * Created by lcollins on 10/11/2015.
 */


define("category-ui",
    ["data", "storage", "underscore", "Q"],
    function (dataService, storage, _, Q) {

        var templateSelector = "#category-selector-template"
        var obj = {

            createZNodes: function (category, currentCategory) {
                var zNodes = [
                    {id: 1, pId: 0, name: "can check 1", open: true},
                    {id: 11, pId: 1, name: "can check 1-1", open: true},
                    {id: 111, pId: 11, name: "can check 1-1-1"},
                    {id: 112, pId: 11, name: "can check 1-1-2"},
                    {id: 12, pId: 1, name: "can check 1-2", open: true},
                    {id: 121, pId: 12, name: "can check 1-2-1"},
                    {id: 122, pId: 12, name: "can check 1-2-2"},
                    {id: 2, pId: 0, name: "can check 2", checked: true, open: true},
                    {id: 21, pId: 2, name: "can check 2-1"},
                    {id: 22, pId: 2, name: "can check 2-2", open: true},
                    {id: 221, pId: 22, name: "can check 2-2-1", checked: true},
                    {id: 222, pId: 22, name: "can check 2-2-2"},
                    {id: 23, pId: 2, name: "can check 2-3"}
                ];
                var parentId =  category.parent ? category.parent.id : 0;

                var node = {
                    id: category.id,
                    pId: parentId,
                    name: category.name,
                    open: false
                };
                if (currentCategory) {
                    if (category.id == currentCategory.id) {
                        node["checked"] = true;
                    }
                }
                var childNodes =
                    _.flatten(_.map(category.children || [], function (child) {
                        return self.createZNodes(child);
                    }));
                return [node].concat(childNodes);
            },

            createCategorySelection: function ($categoryTree, currentCategory, onSelectFn) {
                return storage.getAllCategories().then(function (categories) {
                    self.populateTree($categoryTree, categories, currentCategory, function(category){
                        //$parent.remove(categorySelectorDialog);
                        return onSelectFn( category );
                    });
                    if (currentCategory) {
                        $categoryTree.data("category", currentCategory);
                        $categoryTree.data("name", currentCategory.name);
                        $categoryTree.data("id", currentCategory.id);
                    }
                    return  ($categoryTree);
                });
            },

            populateTree: function populateTree($categoryTree, categories, currentCategory, callbackFn) {
                var zNodes = _.flatten(_.map(categories, function (category) {
                    return self.createZNodes(category, currentCategory);
                }));
                var zNodeSettings = {
                    check: {
                        radioType: "all",
                        enable: true,
                        chkStyle: "radio"
                    },
                    data: {
                        simpleData: {
                            enable: true
                        }
                    },
                    callback: {
                        onCheck: function (e, treeId, treeNode) {
                            storage.getCategory( treeNode.id ).then( callbackFn );
                        }
                    }
                };
                if ( self.ztree){
                    $categoryTree.empty();
                    self.ztree.destroy();
                }
                self.ztree = $.fn.zTree.init($categoryTree, zNodeSettings, zNodes);
                return self.ztree;
            },
            ztree: null
        };
        var self = obj;
        return self;
    });
