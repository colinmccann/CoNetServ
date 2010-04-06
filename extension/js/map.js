/* Google Maps handler */

var Map = {
   locations: [],
   firstRun: false,
   elementId: false, /* Must be set to valid DOM element */
   map: false,
   zoom: 0,

   setElementId: function(elementId) {
      this.elementId = elementId;
   },

   addLocation: function(service, result) {
      /* Set locations */
      this.locations.push({
         name: service.name,
         latitude: result.latitude,
         longitude: result.longitude,
         zoom: result.zoom
      });

      /* Show map */
      this.show();
   },

   loadJsapi: function() {
      if (this.firstRun)
         return;
      this.firstRun = true;

      /* Load latest Google JSAPI loader JavaScript */
      var script = document.createElement("script");
      script.src = "http://www.google.com/jsapi?callback=Map.loadMaps";
      script.type = "text/javascript";
      document.getElementsByTagName("head")[0].appendChild(script);
   },

   loadMaps: function() {
      /* Load latest Google Map JavaScript */
      google.load("maps", "2.x", {"callback" : "Map.createMap(Map)"});
   },

   createMap: function(This) {
      /* Load map into element */
      This.map = new google.maps.Map2(document.getElementById(This.elementId));
      This.map.setUIToDefault();
      This.map.addControl(new GSmallMapControl());
      This.map.addControl(new GMapTypeControl());
      This.map.addControl(new GOverviewMapControl());

      This.baseIcon = new GIcon(G_DEFAULT_ICON);
      This.baseIcon.shadow = "http://www.google.com/mapfiles/shadow50.png";
      This.baseIcon.iconSize = new GSize(20, 34);
      This.baseIcon.shadowSize = new GSize(37, 34);
      This.baseIcon.iconAnchor = new GPoint(9, 34);
      This.baseIcon.infoWindowAnchor = new GPoint(9, 2);

      This.loaded = true;
      This.show();
   },

   createMarker: function(point, name, latitude, longitude) {
      // Create a lettered icon for this point using our icon class
      var letteredIcon = new GIcon(this.baseIcon);
      letteredIcon.image = "http://www.google.com/mapfiles/marker" + name.substring(0, 1) + ".png";

      // Set up our GMarkerOptions object
      markerOptions = { icon: letteredIcon };
      var marker = new GMarker(point, markerOptions);

      GEvent.addListener(marker, "click", function() {
         marker.openInfoWindowHtml("Location by<br /><b>" + name + "</b><br />" + 
                                   "(Latitude: " + latitude + ", Longitude: " + longitude + ")");
      });

      return marker;
   },

   show: function() {
      /* Set new location(s) from buffer */
      if (this.loaded != true) {
         this.loadJsapi();
         return;
      }
      var location;
      while (location = this.locations.shift()) {
         var latlng = new google.maps.LatLng(location.latitude, location.longitude);
         if (location.zoom > this.zoom) {
            this.zoom = location.zoom;
            this.map.setCenter(latlng, location.zoom);
         }
         this.map.addOverlay(this.createMarker(latlng, location.name, location.latitude, location.longitude));
      }
   }

};