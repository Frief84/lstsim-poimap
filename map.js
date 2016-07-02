var map            = null;
var osm		   = null;
var google         = null;
var iconSize       = null;
var iconOffset     = null;
var fromProjection = null;
var toProjection   = null;
var baselayer      = "osm";

function initMap() {
  map            = new OpenLayers.Map("map", {controls: []});
  osm            = new OpenLayers.Layer.OSM();
  //google         = new OpenLayers.Layer.Google("Google Streets",{numZoomLevels: 20});
  fromProjection = new OpenLayers.Projection("EPSG:4326");
  toProjection   = new OpenLayers.Projection("EPSG:900913");
  var center     = new OpenLayers.LonLat(10,51).transform(fromProjection,toProjection);
  var zoom       = 6;

  iconSize       = new OpenLayers.Size(19,25);
  iconOffset     = new OpenLayers.Pixel(-(iconSize.w/2), -iconSize.h);

  map.addControl(new OpenLayers.Control.ScaleLine());
  map.addControls([new OpenLayers.Control.Navigation(),
                   new OpenLayers.Control.PanZoomBar(),
                   new OpenLayers.Control.Attribution()]);

  map.addLayer(osm);
  map.setCenter(center, zoom);

}

function clickOnMarker(evt) {
  var marker = evt.object;
  if (marker.popup) {
    marker.popup.toggle();
    OpenLayers.Event.stop(evt);
  } else {
    text = "<strong>" + marker.poi.name + "</strong><br/>Tags: " + marker.poi.tags.toString();
    text += "<br/>Koordinaten: " + marker.poi.lat + "," + marker.poi.lon + "<br/>Genus: " + marker.poi.genus;
    if (marker.poi.comment.length > 0) text += "<br/>Kommentar: " + marker.poi.comment;
    marker.popup = new OpenLayers.Popup.FramedCloud("Popup",this.lonlat,new OpenLayers.Size(150,50),text,this.icon,true);  
    map.addPopup(marker.popup);
    OpenLayers.Event.stop(evt);
  }
}
