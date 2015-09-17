/**
 * Created by lcollins on 6/24/2015.
 */



function GraphItem(config) {

  config = config ? config : {};

  if (!config.title) {
    throw Error("Graph Item must have title.");
  }
  this.title = config.title ? config.title : ""
  this.categories = config.categories ? config.categories : [];
  this.images = [];
  this.data = config.data ? config.data : {}
  this.position = config.position ? config.position : {x: 0, y: 0};
  this.expanded = config.expanded ? config.expanded : false;
  this.links = config.links ? config.links : [];
  /// ItemRelationship - DO this in its own collection
  ///this.relationships = config.relationships ? config.relationships : [];
  this.notes = [];
  this.typeName =  config.typeName || "";
  return this;
};

function Relationship() {
  this.name = "";
  this.typeId = ""

  return this;
}


function RelationshipType() {
  this.typeName = "";
  this.id = "";

  return this;
}

function ItemRelationship() {
  this.sourceItemId = "";
  this.relatedItemId = "";
  this.relationshipId = "";
  this.notes = [];
  return this;
};

function createGraphItem(config) {
  var gi = new GraphItem(config);
  return gi;
}
