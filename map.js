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

function isNewPOI(poi) {
  return newPOIList.some(p => 
    p.lat == poi.lat && 
    p.lon == poi.lon && 
    p.name == poi.name &&
    p.comment == poi.comment
  );
}

function clickOnMarker(evt) {
  var marker = evt.object;
  var poi = marker.poi;

  if (marker.popup) {
    marker.popup.toggle();
    OpenLayers.Event.stop(evt);
  } else {
    let text = "<strong>" + poi.name + "</strong><br/>Tags: " + poi.tags.toString();
    text += "<br/>Koordinaten: " + poi.lat + "," + poi.lon + "<br/>Genus: " + poi.genus;
    if (poi.comment.length > 0) {
      text += "<br/>Kommentar: " + poi.comment;
    }

    // Buttons nur bei neuen POIs
    if (isNewPOI(poi)) {
      text += `
        <div style="margin-top: 10px; text-align: right;">
          <button title="Bearbeiten" style="margin-right: 5px; padding:2px 6px; border:1px solid #ccc; background:#f8f8f8; border-radius:4px; cursor:pointer;"
            onclick='window.editNewPOIFromPopup(${JSON.stringify(poi).replace(/'/g, "\\'")})'>✏️</button>
          <button title="Löschen" style="padding:2px 6px; border:1px solid #ccc; background:#fff0f0; border-radius:4px; cursor:pointer; color:#a00;"
            onclick='window.deleteNewPOIFromPopup(${JSON.stringify(poi).replace(/'/g, "\\'")})'>🗑️</button>
        </div>
      `;
    }

    marker.popup = new OpenLayers.Popup.FramedCloud(
      "Popup",
      marker.lonlat,
      new OpenLayers.Size(150, 50),
      text,
      marker.icon,
      true
    );

    map.addPopup(marker.popup);
    OpenLayers.Event.stop(evt);
  }
}

