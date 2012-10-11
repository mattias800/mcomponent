var __extends = this.__extends || function (d, b) {
  function __() { this.constructor = d; }
  __.prototype = b.prototype;
  d.prototype = new __();
}
var Animal = (function () {
  function Animal(name) {
    this.name = name;
    this.x = 5;
  }
  Animal.prototype.move = function (meters) {
    alert(this.name + " moved " + meters + "m.");
  };
  return Animal;
})();
var Snake = (function (_super) {
  __extends(Snake, _super);
  function Snake(name) {
    _super.call(this, name);
  }
  Snake.prototype.move = function () {
    alert("Slithering...");
    _super.prototype.move.call(this, 5);
  };
  return Snake;
})(Animal);
var Horse = (function (_super) {
  __extends(Horse, _super);
  function Horse(name) {
    _super.call(this, name);
  }
  Horse.prototype.move = function () {
    alert("Galloping...");
    _super.prototype.move.call(this, 45);
  };
  return Horse;
})(Animal);
var sam = new Snake("Sammy the Python");
var tom = new Horse("Tommy the Palomino");
sam.move();
tom.move(34);


var mlib = mlib || {};

/********************************************
 * Util functions
 ********************************************/

mlib.calculateDistance = function(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = (lat2 - lat1).toRad();
  var dLon = (lon2 - lon1).toRad();
  var lat1 = lat1.toRad();
  var lat2 = lat2.toRad();

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};


/******************************************************************************
 * Controller
 ******************************************************************************/

var MapController = (function() {

  var layerManager = new MapLayerManager();
  var mapObject;
  var mapOptions;
  var mapCanvas;

  function MapController(args) {
    args = $.extend({
                      mapCanvas : undefined, // The canvas for the map. A DOM object.
                      enableMouseWheelZoom : true,
                      enableDefaultNavigationControl : true, // Default navigation control is the one google provides, when false a custom one can be used.
                      enableStreetViewControl : true, // Default contains a Pegman icon which can be dragged onto the map to enable Street View, when false it will not be displayed.
                      startLocation : {
                        latitude : 34.135060,
                        longitude : -29.793750
                      },
                      startZoom : 2,
                      mapType : "roadmap", // roadmap, satellite, hybrid, terrain are valid types.

                      // Callbacks
                      zoomChangedCallback : undefined,
                      moveStartedCallback : undefined,
                      moveEndedCallback : undefined,
                      doubleClickCallback : undefined,
                      idleCallback : undefined,

                    });

    if (args.mapCanvas == undefined) throw "MapController requires mapCanvas in args.";
    mapCanvas = args.mapCanvas;

    initMap(args);
  }

  function initMap(args) {
    var mapTypeId;
    switch (args.mapType.toLowerCase().trim()) {
      case "roadmap":
        mapTypeId = google.maps.MapTypeId.ROADMAP;
        break;
      case "satellite":
        mapTypeId = google.maps.MapTypeId.SATELLITE;
        break;
      case "hybrid":
        mapTypeId = google.maps.MapTypeId.HYBRID;
        break;
      case "terrain":
        mapTypeId = google.maps.MapTypeId.TERRAIN;
        break;
      default:
        // No valid map type specified, defaulting to roadmap. Valid map types are roadmap, satellite, hybrid and terrain.
        mapTypeId = google.maps.MapTypeId.ROADMAP;
    }
    if (mapCanvas) {
      if (!mapObject) {
        var latlng = new google.maps.LatLng(args.startLocation.latitude, args.startLocation.longitude);
        var mapOptions = {
          zoom : args.startZoom,
          center : latlng,
          navigationControl : args.enableDefaultNavigationControl,
          streetViewControl : args.enableStreetViewControl,
          mapTypeId : google.maps.MapTypeId.ROADMAP,
          scrollwheel : args.enableMouseWheelZoom ? true : false
        };
        mapObject = new google.maps.Map(mapCanvas, mapOptions);
        this.attachMapCallbacks();

      }
    } else {
      ibeerror("Trying to load map to canvas, but no canvas has been set.");
    }
  };

  MapController.prototype.createLayerWithId = function(id) {
    layerManager.createLayerWithId(id);
  };

  MapController.prototype.addLabelToLayer = function() {

  };

  return MapController;
})();

/******************************************************************************
 * Map layers
 ******************************************************************************/

var MapLayerManager = (function() {

  var layers = {};

  function MapLayerManager(args) {
  }

  MapLayerManager.prototype.createLayerWithId = function(id) {
    layers[id] = new MapLayer({id : id});
  };

  return MapLayerManager;
})();


var MapLayer = (function() {

  var id;
  var labels = [];

  var clusterManager;
  var config = {};

  function MapLayer(args) {
    if (args.config == undefined) args.config = {};
    config.useClusters = args.config.useClusters ? true : false;
    id = args.id;

    clusterManager = new MapClusterManager({config : config});
  }

  return MapLayer;
})();

/******************************************************************************
 * Cluster
 ******************************************************************************/

var MapClusterManager = (function() {

  var clusters = [];

  // Config
  var clickOnClusterToOpen;
  var clusterRadius;


  function MapClusterManager(args) {
    if (args.config == undefined) args.config = {};

    clickOnClusterToOpen = args.config.clickOnClusterToOpen ? true : false;
    clusterRadius = args.config.clusterRadius || 500;
  }


  MapClusterManager.prototype.createCluster = function(label) {

  };

  MapClusterManager.prototype.getOrCreateClusterForLabel = function(label) {
    var clusterAndDistance = this.getClosestClusterCenterForLabel(label);
    if (clusterAndDistance.cluster === undefined || clusterAndDistance.distance > clusterRadius) {

    }
  };

  /**
   * Given a label, returns the cluster which center is closest to the labels coordinates, and the distance between them. If there are no cluster, returns undefined.
   * @param label
   */
  MapClusterManager.prototype.getClosestClusterCenterForLabel = function(label) {
    var closestCluster = undefined;
    var closestDistance = undefined;
    if (clusters && clusters.length) {
      for (var i = 0; i < clusters.length; i++) {
        var cluster = clusters[i];
        var d;

        if (closestCluster == undefined || (d = label.distanceTo(cluster)) < closestDistance) {
          closestCluster = cluster;
          closestDistance = d;
        }
      }
      return {
        cluster : closestCluster,
        distance : closestDistance
      };
    } else {
      return undefined;
    }
  };

  /**
   * Checks if a label is within the boundaries of specified cluster.
   * @param label
   * @param cluster
   */
  MapClusterManager.prototype.isLabelInCluster = function(label, cluster) {
    return cluster.isLabelInside(label);
  };

  return MapClusterManager;
}
  )
  ();

var MapCluster = (function() {

  var latitude;
  var longitude;
  var clusterRadius;

  function MapCluster(args) {
    clusterRadius = args.clusterRadius;
  }

  MapCluster.prototype.getLatitude = function() {
    return latitude;
  };

  MapCluster.prototype.getLongitude = function() {
    return longitude;
  };

  /**
   * Checks if label is within the boundaries of this cluster.
   * @param label
   */
  MapCluster.prototype.isLabelInside = function(label) {
    return this.distanceTo(label) <= clusterRadius;
  };

  /**
   * Calculates the distance to label or cluster (or any other object that has getLatitude() and getLongitude().
   * @param other
   */
  MapLabel.prototype.distanceTo = function(other) {
    return mlib.calcuateDistance(latitude, longitude, other.getLatitude(), other.getLongitude());
  };

  return MapCluster;
})();

/******************************************************************************
 * Label
 ******************************************************************************/

var MapLabel = (function() {

  var mcomponent;
  var model;

  var container;

  var latitude;
  var longitude;

  function MapLabel(args) {
    if (args === undefined) args = {};

    mcomponent = args.mcomponent;
    latitude = args.latitude;
    longitude = args.longitude;

    this.setModel(args.model);
    container = document.createElement("div");
  }

  MapLabel.prototype.setModel = function(m) {
    model = m;
    mcomponent.setModel(m);
  };

  MapLabel.prototype.render = function() {
    mcomponent.render();
    container.innerHTML = mcomponent.getResult().html;
  };

  MapLabel.prototype.getLatitude = function() {
    return latitude;
  };

  MapLabel.prototype.getLongitude = function() {
    return longitude;
  };

  MapLabel.prototype.distanceTo = function(other) {
    return mlib.calcuateDistance(latitude, longitude, other.getLatitude(), other.getLongitude());
  };

  return MapLabel;
})();

