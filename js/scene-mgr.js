/**
 * Created by lcollins on 10/25/2015.
 */

define("scene-mgr",
    ["require", "storage","Q"],
    function (require, storage, Q) {

        function prepareTemplates(){
        }

        var obj = {

            /// Must return promise
            panel: function($parent, scene, sceneTypeName){
                var factory = self.panelFactory(sceneTypeName);
                return factory($parent, scene, self );
            },

            /// Must return promise
            panelFactory: function(sceneTypeName) {
                return require("scene-types/" + sceneTypeName + "/scene-panel-factory.js");
            },

            getSceneTemplate: function (sceneTypeName) {
                    var url = "/js/scene-types/"+sceneTypeName+"/scene-template.html";
                    return self._sceneTemplateFn
                        ? Q ( self._sceneTemplateFn( {} ))
                        : Q($.get( url, function( template ) {
                            self._sceneTemplateFn = _.template( template );
                            return self._sceneTemplateFn( {} );
                        }));
            },

            // returns Promise
            getTemplatesForType: function(typeName, sceneTypeName){
                storage.getTypeByName(typeName).then(function (itemType) {
                        var  path = "/scene-types/"+sceneTypeName+"/type-templates/"+typeName;
                        var templates = self.getTemplatesFromFolder("/scene-types/"+sceneTypeName+"/type-templates/"+typeName);

                        if(! templates ){
                            templates = self.getTemplatesFromFolder("/type-templates/"+typeName);
                        }
                        if (!templates){
                            if (itemType.parent){
                                return self.getTemplatesForType(itemType.parent.name, sceneTypeName);
                            }
                            else{
                                return null;
                            }
                        }
                    // we got some templates
                    return templates;

                });


            },
            getTemplatesFromFolder : function(path){
                var prefix = "http://localhost:8888"+path;
                var files = ["compact.html","normal.html","max.html"];

                var plist = _.map(files, function (file) {
                    Q ( $ajax( prefix + "/" + file ) );
                });

                Q.all(plist).spread(function (compactTemplate, normalTemplate, maxTemplate) {
                    return {
                        compact: _.template(compactTemplate),
                        normal : _.template(normalTemplate),
                        max : _.template(maxTemplate)
                    }
                }, function (error) {
                    console.log("Could not load templates from : "+path);
                    return null;
                });

            }


        };
    var self = obj;
    return obj;
    });
