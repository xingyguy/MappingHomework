var quakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var faultUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(quakeUrl, function(quakeData) {
    d3.json(faultUrl, function(faultData){
        var faultLines = markFaults(faultData);
      markQuakes(quakeData.features, faultLines);
    });
});

function createCircleMarker(feature, latlng) {
     var color = d3.interpolateHsl("lime", "red")(feature.properties.mag/5); 
    let options = {
        radius: feature.properties.mag * 10,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 1,
        fillOpacity: .75
    }
  return L.circleMarker( latlng, options );
}

function onEachFeature(feature, layer) {
  layer.bindPopup(
      "<strong>Magnitude: " + feature.properties.mag + "</strong><hr>" +
      "<h3>" + feature.properties.place + "</h3><hr>" +
      "<p>" + new Date(feature.properties.time).toLocaleString('en-US',{timeZoneName: "short"}) + "</p>"
  );
}

function markQuakes(earthquakeData, faultLayer) {

  var earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: createCircleMarker,
      onEachFeature: onEachFeature
  });

    createMap(earthquakes, faultLayer);
}

function markFaults(faultData){
    var faults = L.geoJSON(faultData);
        
    return faults;
}

function createMap(quakes, faults) {

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var satmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var outmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });
    
  var baseMaps = {
    "Light Map": lightmap,
    "Satellite Map": satmap,
      "Outdoors Map": outmap
  };

  var overlayMaps = {
      "Earthquakes": quakes,
      "Fault Lines": faults
  };

  var myMap = L.map("map", {
    center: [0, 0],
    zoom: 2,
    layers: [lightmap, quakes]
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
    
    var legend = L.control({
        position: "bottomright"
    });
    legend.onAdd = function (myMap) {
        var div = L.DomUtil.create('div', 'info legend'),
        magnitude = [1, 2, 3, 4, 5, 6],
        color = [];
        div.innerHTML = "<h4>MAG</h4>";
        for (var i = 0; i < magnitude.length; i++) {
            div.innerHTML +=
                '<i style="background:' + d3.interpolateHsl("lime", "red")(magnitude[i]/5) + '"></i> ' +
                magnitude[i] + (magnitude[i + 1] ? ' ' + '<br>' : '+');
        }
        return div;
    };

    legend.addTo(myMap);
    
}