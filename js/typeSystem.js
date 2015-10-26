/**
 * Created by lcollins on 8/27/2015.
 */
define("typeSystem", ["storage", "Q", "elementId"], function (storage, Q, elementId) {
    var self;
    var typeCache = {}
    function handleNewType(itemType){
        typeCache[itemType.name] = itemType;
        return itemType;
    }
    $.fn.editable.defaults.mode = 'inline';
    var obj = {

        BASE_TYPE_NAME : "$thing",
        itemReferenceToItemId:function(itemRef){
            // parse the string
            // $ref:[(id)] -> reference to an item
            // $ref:[(id).name] -> reference to an item property called name
            var reggie = "^\$ref:\[(\(\S\))(\.\S) \]";
            if (!itemRef.match(reggie)){
                throw Error("Not a valid item reference: "+ itemRef);
            }
            //TODO get the matches ....
        },

        getItemByReference: function(itemReference){
            // read the item from storage
            var id = self.itemReferenceToItemId( itemReference );// just parsing
            return storage.getGraphItem(id);
        },

        getTypeById: function(id){
            // read the item from storage
            return storage.getType(id);
        },

        getAllTypes: function(){
            // read the items from storage
            return storage.getAllTypes();
        },

        canAssign: function(sourceTypeName, targetTypeName){
            self.resolveType( sourceTypeName).then(function(sourceType){
                return (sourceType.hierarchy) ? sourceType.hierarchy.contains(targetTypeName) : null;
            });
        },

        resolveType: function( typeName){
            if (typeCache[typeName]){
                return Q(typeCache[typeName] )
            }
            return storage.getTypeByName( typeName).then(handleNewType);
        },

        createEditor: function(itemId, typeName, propertyName, value, required, readOnly, $parent){
            var isPrimitive = self.isPrimitiveType(typeName);
            return (isPrimitive
                ? (self.createPrimitiveTypeEditor(itemId, typeName, propertyName, value, required, readOnly, $parent))
                : (  self.resolveType(typeName).then(function(itemType){
                        return self.createItemTypeEditor(itemId, itemType, propertyName, value, required, readOnly, $parent);
                    })
                )
            );
        },
        createPrimitiveTypeEditor: function(itemId, typeName, propertyName, value, required, readOnly, $parent){
            var $element;
            switch (typeName){
                case "text":
                    $element = $("<label  />");
                    if(value)
                        $element.text(value);
                        break;
                case "number":
                    $element = $("<label></label>");
                    if(value)
                        $element.text(value);
                    break;
                case "dateTime":
                    $element = $("<label></label>");
                    if( value )
                        $element.text( value);
                    break;

                 case "link":
                    $element = $("<label />");
                    if( value )
                        $element.text( value );
                    break;

                case "emailAddress":
                    $element = $("<label />");
                    if( value )
                        $element.text( value );
                    break;

                case "boolean":
                    $element = $("<input type='checkbox' />");
                    $element.attr('checked', !!value);
                    break;

                default :
                        throw Error("Not a valid item reference: "+ itemRef);
            }
            $element.attr("id", elementId.createItemPropertyValueId(itemId, propertyName));
            $element.attr("name", propertyName);
            $element.data("propertyName", propertyName);
            $element.data("itemId", itemId);
            $element.data("required", required) ;
            //  $element.data("readOnly", false) ;
            if(!readOnly)
                $element = self._makeEditable(itemId, $element, typeName, propertyName, required);
            return Q($element);
        },

        _makeEditable: function(itemId, $element, typeName, propertyName, required){
            var type
            var isNewItem =  (!itemId || itemId == "new");
            switch (typeName){
                case "text":
                    type='text';
                    break;
                case "number":
                    type='number'
                    break;
                case "dateTime":
                    type='dateui'
                    break;
                case "link":
                    type='url'
                    break;
                case "emailAddress":
                    type='email'
                    break;
                case "boolean":
                    break;
                default :
                    throw Error("Not a valid type reference: "+ typeName);
            }

        if(type)
            $element.editable({
                type: type,
                placeholder: required ? "Required" : "Enter...",
                showbuttons:false,
                onblur:"submit",
                pk: propertyName,
                success: function(resp, newValue){
                    console.log(propertyName+':success', newValue );
                },
                url: function(params){
                    console.log(propertyName+':url',  params );
                    if(!isNewItem ) {
                        self.updateItemProperty(
                            elementId.itemIdFromItemPropertyEditorId($element.attr('id')),
                            propertyName,
                            params.value).then(function(updatedItem){
                                console.log("Saved "+propertyName+ ": "+params.value+" --> "+updatedItem.data[propertyName]);
                                if (type == "number")
                                    $element.text(params.value);
                                $element.val(params.value);
                            });
                    } else{
                        $element.val(params.value);
                    }
                }
            });
        return $element;
        },
        updateItemProperty:function(itemId, propertyName, propertyValue){
            var $dirtyFlag = $('#'+elementId.createItemPropertyDirtyFlagId(itemId,propertyName));
            $dirtyFlag.text('*');
            return storage.getGraphItem(itemId).then(function (item) {
                item.data[propertyName] = propertyValue;
                return storage.updateGraphItem(item).then(function (savedItem) {
                    $dirtyFlag.text('');
                    return savedItem;
                });
            });

        },
        getCompatibleItems: function (typeName) {
            return storage.getAllGraphItems().then(function(graphItems){
                return _.filter(graphItems, function(item){
                    return self.canAssign( typeName,  item.typeName);
                });
            });
        },

        createItemTypeEditor: function(itemId, typeName, propertyName, value, required, readOnly, $parent){
            /// get the type of the referenceType(String ref)
            return self.getItemByReference(value).then(function(graphItem){
                // get the items of that type and put them into the OPTIONS of the select.
                return self.getCompatibleItems (typeName).then(function(items){
                    // To select the active one, the parse the value as a reference
                    var $select = $("<select></select>")
                    ///TODO:  for now, we only have the 'title'  of the item in the list
                    var options = self.createSelectOptions(items);
                    options.each(function(opt){
                        $select.append(opt);
                    });
                    return $select;
                })
            });

        },
        createSelectOptions: function(items){
            return items.map(function(item){
                return  $("<option id='" + item.id + "'>" + item.title + "</option>");
            });
        },

        isPrimitiveType: function (typeName) {
            return $.inArray( typeName, ['number','text','dateTime','emailAddress','link', 'boolean'] ) >= 0;
        },

        getDefaultsForType : function(type){
            return $.extend({}, {"createDateTime" : $.datepicker.formatDate("yy-mm-dd", new Date()) }, type.defaults || {});
        },

        createPropertyTableRow: function(itemId, typeName, propertyName, value, required, readOnly, $parent, labelClass, valueClass){
            var $tr = $("<tr/>");
            $tr.attr("id", elementId.createItemPropertyRowId(itemId, propertyName));
            if (required){
                $tr.addClass("required-item-property");
            }
            var $tdName = $("<td style='text-align: right;padding: 5px;' />");
            var $lblDirty = $("<label></label>");
            $lblDirty.attr("id", elementId.createItemPropertyDirtyFlagId( itemId, propertyName));
            var $lblName = $("<label>"+propertyName+"</label>");
            $lblName.attr("id", elementId.createItemPropertyNameId( itemId, propertyName));
            $lblName.addClass("item-property-name");
           // $lblName.addClass("graph-item-data-name");
            if(labelClass)
                $tdName.addClass(labelClass);

            var $tdValueEditor = $("<td style='text-align: left;padding: 5px;' />");
            if(valueClass)
                $tdValueEditor.addClass(valueClass);

            return self.createEditor(itemId,
                typeName,
                propertyName,
                value,
                required, readOnly,
                $tdValueEditor).then(function($editor){
                    $editor.addClass("item-property-value");
                    if(valueClass)
                        $editor.addClass(valueClass);
                    $tdValueEditor.append($editor);
                    $tdName.append($lblName);
                    $tdName.append($lblDirty);
                    $tr.append($tdName);
                    $tr.append($tdValueEditor);
                    return Q( $tr );
                });
        }//createPropertyTableRow
    };
    self = obj;
    return obj;

});
