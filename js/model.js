/**
 * Created by lcollins on 6/24/2015.
 */


function GraphItem(){

  this.title = "";
  this.images = [];
  this.data = {};
  this.position = {x: 0, y: 0 };
  this.expanded = false;
  this.links = {}
  this.links.updatePosition = ""
  this.links.update = ""
  this.links.delete = ""

  return this;
};

function createGraphItem(title, position, images, expanded, data, links){

  var gi = new GraphItem();
  gi.title = title ? title : ""
  gi.title = title ? title : ""
  gi.data = title ? title : ""
  gi.position = title ? title : ""
  gi.expanded = title ? title : ""
  gi.links = links ? links : ""
}
