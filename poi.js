var no  = " <span style='color:red;'>✖</span>";
var yes = " <span style='color:green;'>✔</span>";

var categories = ["AH", "AmbKH", "Arena", "Bahnlinie", "Bahnübergang", "Bank", "Bereitschaft", "BW", "Blut", "Brücke", "Dialyse", "Disko", "Druck", "Feuerwehr", "FKH", "Flughafen", "FlugKH", "Flugplatz", "Freibad", "Friedhof", "Fußball", "FZPark", "Gasthaus", "GKH", "Grundschule", "Hafen", "Hallenbad", "HBF", "Herz", "IKH", "Industrie", "Juhe", "JVA", "Kaufhaus", "KH", "KH1", "KH2", "KH3", "KiKa", "KiKli", "Kirche", "Kultur", "Küste", "Lst", "Lunge", "Notfallpraxis", "Ortho", "Park", "Polizei", "Psychiatrie", "Reha", "Reiterhof", "RW", "Schleuse", "Schloss", "Schule", "See", "Sporthalle", "Strahlen", "Tankstelle", "Tropen", "Tunnel", "UKH", "Wald", "Zelt", "Zoo", "ohne"];

var poiImporter      = null;
var poiInput         = null;
var poiList          = null;
var poiCounter       = null;
var pois	     = null;
var openPOIImporter  = null;
var closePOIImporter = null;
var drawPOIButton    = null;
var selector	     = null;
var addPOIButton     = null;
var newPOI	     = null;
var newPOICoords     = null;
var newPOICancel     = null;
var newPOIAccept     = null;

var minlat = null;
var minlon = null;
var maxlat = null;
var maxlon = null;

var poiLayers = [];
var markers = [];
var poisDrawn = 0;

var newPOIList = [];

function initPOI() {
  poiImporter      = document.getElementById("poiImporter");
  poiInput         = document.getElementById("poiInput");
  poiList          = document.getElementById("poiList");
  poiCounter       = document.getElementById("poiCounter");
  openPOIImporter  = document.getElementById("openPOIImporter");
  closePOIImporter = document.getElementById("closePOIImporter");
  drawPOIButton	   = document.getElementById("drawPOIButton");
  help		   = document.getElementById("help");
  closeHelp	   = document.getElementById("closeHelp");
  showAllPOIs	   = document.getElementById("showAllPOIs");
  hideAllPOIs	   = document.getElementById("hideAllPOIs");
  selector	   = document.getElementById("selector");
  addPOIButton	   = document.getElementById("addPOIButton");
  newPOI	   = document.getElementById("newPOI");
  newPOICoords     = document.getElementById("newPOICoords");
  newPOICancel     = document.getElementById("newPOICancel");
  newPOIAccept     = document.getElementById("newPOIAccept");
  showNewPOIs      = document.getElementById("showNewPOIs");
  newPOIListWindow = document.getElementById("newPOIListWindow");
  newPOIField      = document.getElementById("newPOIField");
  closeNewPOIListWindow = document.getElementById("closeNewPOIListWindow");

  if (location.search.match("nohelp")) help.style.visibility = "hidden";

  closeHelp.onclick =
    function() {
      help.style.visibility = "hidden";
    }

  openPOIImporter.onclick =
    function() {
      help.style.visibility = "hidden";
      newPOI.style.visibility = "hidden";
      poiImporter.style.visibility = "visible";
      openPOIImporter.innerHTML = "1. POIs importieren" + no;
      resetPOIs();
    }
  
  closePOIImporter.onclick =
    function() {
      poiImporter.style.visibility='hidden';
      if (pois && pois.length > 0)
        openPOIImporter.innerHTML = "1. POIs importieren" + yes;
      else
        openPOIImporter.innerHTML = "1. POIs importieren" + no;
    }

  showAllPOIs.onclick =
    function() {
      for (var cat in poiLayers) {
        poiLayers[cat].setVisibility(true);
	setSelector(cat,"visible");
      }
    }

  hideAllPOIs.onclick =
    function() {
      for (var cat in poiLayers) {
        poiLayers[cat].setVisibility(false);
	setSelector(cat,"hidden");
      }
    }

  addPOIButton.onclick = 
    function() {
      this.onclick = function() {};
      help.style.visibility = "hidden";
      poiImporter.style.visibility = "hidden";
      map.events.register("click", map, clickForNewPOI);
    }

  newPOICancel.onclick = 
    function() {
      newPOI.style.visibility = "hidden";
    }

  newPOIAccept.onclick = 
    function() {
      parseNewPOI();
      newPOI.style.visibility = "hidden";
    }

  showNewPOIs.onclick = 
    function() {
      newPOIListWindow.style.visibility = "visible";
    }

  closeNewPOIListWindow.onclick = 
    function() {
      newPOIListWindow.style.visibility = "hidden";
    }

  drawPOIButton.onclick  = drawPOIs;
  poiInput.onkeyup  = parsePOIs;
  poiInput.onchange = parsePOIs;
}

function clickForNewPOI(evt) {
  var coords   = map.getLonLatFromPixel(this.events.getMousePosition(evt)).transform(toProjection,fromProjection);
  var position = (Math.round(coords.lat*100000)/100000 + "," + Math.round(coords.lon*100000)/100000);
  newPOICoords.value = position;
  newPOI.style.visibility = "visible";
  //window.alert(position);
  map.events.unregister("click", map, clickForNewPOI);
  addPOIButton.onclick = 
    function() {
      this.onclick = function() {}; 
      help.style.visibility = "hidden";
      poiImporter.style.visibility = "hidden";
      map.events.register("click", map, clickForNewPOI);
    }   
  OpenLayers.Event.stop(evt);
}

function parseNewPOI() {
  var mytaglist = document.getElementsByName("tags");
  var mytags = "";
  for (i in mytaglist) {
    if (mytaglist[i].checked == true) {
      if (mytags)
        mytags = mytags + "," + mytaglist[i].value;
      else
        mytags = mytaglist[i].value;
    }
  }
  var mygenuslist = document.getElementsByName("genus");
  var mygenus = "";
  for (i in mygenuslist) {
    if (mygenuslist[i].checked == true)
      mygenus = mygenuslist[i].value;
  }
  var mylocation = document.getElementById("newPOICoords").value.split(",");
  var mynewpoi = { lat: mylocation[0], lon: mylocation[1], tags: mytags, genus: mygenus, name: document.getElementById("newPOIName").value,
                   comment: document.getElementById("newPOIComment").value };
  newPOIList.push(mynewpoi);

  var lonlat = new OpenLayers.LonLat(mylocation[1],mylocation[0]).transform(fromProjection,toProjection);
  if (!poiLayers["neu"]) {
    poiLayers["neu"] = new OpenLayers.Layer.Markers("neu");
    map.addLayer(poiLayers["neu"]);
  }   
  var myIcon = new OpenLayers.Icon("markers/neu.svg",iconSize,iconOffset);
  var myMarker = new OpenLayers.Marker(lonlat,myIcon);
  myMarker.poi = mynewpoi;
  poiLayers["neu"].addMarker(myMarker);
  myMarker.events.register("mousedown", myMarker, clickOnMarker);
  poisDrawn++;

  newPOIField.innerHTML += mynewpoi.lat + "," + mynewpoi.lon + ";" + mynewpoi.genus + ";" + mynewpoi.name + ";" + mynewpoi.tags.toString() + ";" + mynewpoi.comment + ";\n";

  resetNewPOIForm();
  showNewPOIs.innerHTML = "neue POIs anzeigen (" + newPOIList.length + ")";
  showNewPOIs.style.visibility = "visible";
}

function parsePOIs() {
  minlat = 0;
  maxlat = 0;
  minlon = 0;
  maxlon = 0;
  var text  = poiInput.value;
  var lines = text.split("\n");
  var table = "<table><tr><th>ID</th><th>Koordinaten</th><th>Bezeichnung</th><th>Tags</th></tr>";
  pois  = [];

for (var i = 0; i < lines.length; i++) {
    var line = lines[i].split(/[\t;]/);
    if (line.length < 5) continue;
    if (line[4].match(/^Tags.*/)) continue;
    if (line[4].length < 2) line[4] = "ohne";
    latlon = line[1].split(",");
    mypoi = { id: line[0], lat: Math.round(parseFloat(latlon[0])*100000)/100000, lon: Math.round(parseFloat(latlon[1])*100000)/100000, genus: line[2],
              name: line[3], tags: line[4].split(", "), comment: line[5] };
    table += "<tr><td>" + mypoi.id +
             "</td><td>" + mypoi.lat + "," + mypoi.lon +
	     "</td><td>" + mypoi.name +
	     "</td><td>" + mypoi.tags.toString() +
	     "</td></tr>";
    if (!minlat || mypoi.lat < minlat) minlat = mypoi.lat;
    if (!maxlat || mypoi.lat > maxlat) maxlat = mypoi.lat;
    if (!minlon || mypoi.lon < minlon) minlon = mypoi.lon;
    if (!maxlon || mypoi.lon > maxlon) maxlon = mypoi.lon;
    pois.push(mypoi);
  }

table += "</table>";
  if (text.length == 0)
    table = "";
  if (pois.length > 0) 
    poiCounter.innerHTML = pois.length + " POIs gefunden";
  else
    poiCounter.innerHTML = "";
  poiList.innerHTML = table;
}

function drawPOIs() {
  if (!pois || !pois.length > 0) {
    window.alert("Es wurden noch keine POIs geladen! Bitte zunächst POIs importieren und dann zeichnen!");
    return;
  }

  if (poisDrawn > 0) {
    window.alert("Der aktuelle Satz POIs wurde bereits gezeichnet! Bitte zunächst einen neuen POI-Satz importieren!");
    return;
  }

  for (i in pois) {
    var lonlat = new OpenLayers.LonLat(pois[i].lon,pois[i].lat).transform(fromProjection,toProjection);
    for (j in pois[i].tags) {
      var tag = pois[i].tags[j].replace(/\s+/g,'');
      if (!poiLayers[tag]) {
        poiLayers[tag] = new OpenLayers.Layer.Markers(tag);
      }
      var myIcon = new OpenLayers.Icon("markers/" + pois[i].tags[j].replace(/\s+/g,'') + ".svg",iconSize,iconOffset);
      var myMarker = new OpenLayers.Marker(lonlat,myIcon);
      myMarker.poi = pois[i];
      poiLayers[tag].addMarker(myMarker);
      myMarker.events.register("mousedown", myMarker, clickOnMarker);
      poisDrawn++;
    }
  }

  for (i in categories) {
    if (poiLayers[categories[i]]) {
      poiLayers[categories[i]].setName(categories[i] + " (" + poiLayers[categories[i]].markers.length + ")");
      map.addLayer(poiLayers[categories[i]]);
      addLink(categories[i]);
    }
  }

  map.zoomToExtent(new OpenLayers.Bounds(minlon,minlat,maxlon,maxlat).transform(fromProjection,toProjection));
  drawPOIButton.innerHTML = "2. POIs in die Karte zeichnen" + yes;
}

function resetPOIs() {
  if (poisDrawn > 0) {
    clearLinks();
    for (i in poiLayers) {
      poiLayers[i].clearMarkers();
      poiLayers[i].destroy();
    }
    poiLayers = []; 
    poisDrawn = 0;
    drawPOIButton.innerHTML = "2. POIs in die Karte zeichnen" + no;
  }  
}

function resetNewPOIForm() {
  document.getElementById("newPOICoords").value = "";
  document.getElementById("newPOIName").value = "";
  document.getElementById("newPOIComment").value = "";
  var tagboxes = document.getElementsByName("tags");
  for (i in tagboxes)
    tagboxes[i].checked = false;
  var genus = document.getElementsByName("genus");
  for (i in genus)
    genus[i].checked = false;
}

function addLink(cat) {
  if (poiLayers[cat]) {
    selector.innerHTML += "<span id='selector" + cat + "span' class='clickable' onclick='toggleVisibility(\"" + cat + "\");'><img id='selector" + cat + "img' src='markers/" + cat + ".svg' alt='' /> " + cat + " <small>(" + poiLayers[cat].markers.length + ")</small></span><br/>";
  }
}

function clearLinks() {
  selector.innerHTML = "";
}

function toggleVisibility(cat) {
  if (poiLayers[cat].getVisibility()) {
    setSelector(cat,"hidden");
  } else {
    setSelector(cat,"visible");
  }
  poiLayers[cat].setVisibility(!poiLayers[cat].getVisibility());
}

function setSelector(cat,state) {
  var myselector = document.getElementById("selector" + cat + "span");
  var myimage    = document.getElementById("selector" + cat + "img");
  if (myselector === null || myimage === null) {
    return;
  }
  myselector.setAttribute("class","clickable " + state);
  if (state == "hidden")
    myimage.setAttribute("src","markers/inaktiv.svg");
  else
    myimage.setAttribute("src","markers/" + cat + ".svg");
}
