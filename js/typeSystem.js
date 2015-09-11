/**
 * Created by lcollins on 8/27/2015.
 */
define("typeSystem", ["storage", "Q", "elementId"], function (storage, Q, elementId) {
    var self
    var typeCache = {}
    function handleNewType(itemType){
        typeCache[itemType.name] = itemType;
        return itemType;
    }

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

        createEditor: function(typeName, propertyName, value, required, $parent){
            var isPrimitive = self.isPrimitiveType(typeName);
            return (isPrimitive
                ? (self.createPrimitiveTypeEditor(typeName, propertyName, value, required, $parent))
                : (  self.resolveType(typeName).then(function(itemType){
                        return self.createItemTypeEditor(itemType, propertyName, value, required, $parent);
                    })
                )
            );
        },
        createPrimitiveTypeEditor: function(typeName, propertyName, value, required, $parent){
            var $element;

            switch (typeName){
                case "text":
                    $element = $("<input type='text' />");
                    if(value)
                        $element.val(value);
                    if(required){
                        $element.attr("placeHolder", "Required")
                    }else{
                        $element.attr("placeHolder", "Optional")
                    }
                        break;
                case "number":
                    $element = $("<input type='number' />");
                    if(value)
                        $element.val(value);
                    if(required){
                        $element.attr("placeHolder", "Required")
                    }else{
                        $element.attr("placeHolder", "Optional")
                    }
                    break;
                case "dateTime":
                    $element = $("<input type='datetime' />");

                    if( value )
                        $element.val( value);
                    if(required){
                        $element.attr("placeHolder", "Required")
                    }else{
                        $element.attr("placeHolder", "Optional")
                    }
                    //TODO: handle constraints (min,max, etc)
                    break;
                case "dateTimeXXXXX":
                    $.datepicker.setDefaults({
                        dateFormat: 'yyyy-mm-dd',
                        showOn: "both",
                        buttonText: "Calendar"
                    });
                    $element = $("<input type='text' />");
                    $element.datetimepicker({
                        formatDate: 'YYYY-MM-DD',
                        formatTime: 'hh:mm:ss:u',
                        showOn: "both",
                        buttonText: "Calendar"
                    });
                    //$.datetimepicker.setOptions();
                    if( value )
                        $element.datetimepicker("setDate", value);
                    if(required){
                        $element.prop("placeHolder", "Required")
                    }else{
                        $element.prop("placeHolder", "Optional")
                    }
                    //TODO: handle constraints (min,max, etc)
                    break;
                case "link":
                    //$element = $("<a type='text' />");
                    $element = $("<input  type='url' />");
                    if( value )
                        $element.val( value );
                    if(required){
                        $element.attr("placeHolder", "Required")
                    }else{
                        $element.attr("placeHolder", "Optional")
                    }
                    break;

                case "emailAddress":
                    break;
                case "boolean":
                    $element = $("<input type='checkbox' />");
                    $element.attr('checked', !!value);
                    break;
                default :
                        throw Error("Not a valid item reference: "+ itemRef);
            }
            return Q($element);
        },

        getCompatibleItems: function (typeName) {
            return storage.getAllGraphItems().then(function(graphItems){
                return _.filter(graphItems, function(item){
                    self.canAssign( typeName,  item.typeName)
                });
            });
        },

        createItemTypeEditor: function(typeName, propertyName, value, required, $parent){
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

        createPropertyTableRow: function(typeName, propertyName, value, required, $parent){
            var $tr = $("<tr/>");
            $tr.attr("id", elementId.createItemPropertyRowId(propertyName));
            if (required){
                $tr.addClass("required-item-property");
            }
            var $tdName = $("<td/>");
            var $lblName = $("<label>"+propertyName+"</label>");
            $lblName.attr("id", elementId.createItemPropertyNameId(propertyName));
            $lblName.addClass("item-property-name");

            var $tdValueEditor = $("<td/>");

            return self.createEditor(typeName, propertyName, value, required, $tdValueEditor).then(function($editor){
                $editor.attr("id", elementId.createItemPropertyValueId(propertyName));
                $editor.addClass("item-property-value");
                $tdValueEditor.append($editor);
                $tdName.append($lblName);
                $tr.append($tdName);
                $tr.append($tdValueEditor);
                return Q( $tr );
            });
        }//createPropertyTableRow
    }
    self = obj;
    return obj;

});
