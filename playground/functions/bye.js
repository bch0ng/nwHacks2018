/**
* Geoca
* @param {String} emergencyID
* @returns {any}
*/
module.exports = (emergencyID, context, callback) => {
	var admin = require("firebase-admin");

	// Initialize the app with a service account, granting admin privileges
	admin.initializeApp({
	  credential: admin.credential.cert(require('../serviceAccountKey.json')),
	  databaseURL: "https://nwhacks-7c19a.firebaseio.com/"
	});
	var db = admin.database();
	//admin.database.enableLogging(true);
	var ref = db.ref('Dispatchers');
	var data;
  allDispatchers(ref)
	.then(function(result) {
   	data = result;

   	var availableDispatcher = [];
	  for (var x in data) {
	  	availableDispatcher.push(x);
	  }
	  var emerLat;
	  var emerLong;
	  var closestID;
	  emergencyLocation(emergencyID, ref, db)
	  .then(function(result) {
			emerLat = result['latitude'];
			emerLong = result['longitude'];
	  }).then(function() {
	  	closestID = closestDispatcher(emerLat, emerLong, ref, data, db, availableDispatcher);
		}).then(function() {
			statusUpdater(closestID, ref, db)
	  .then(function(result) {
	  	callback(closestID);
	  	process.exit();
	  });
		})
	  /*
	  .then(function(result) {
	  	var data = result;
	  }).then(function() {
	  	process.exit();
	  });

	  statusUpdater(closestID, ref, db)
	  .then(function(result) {
	  	callback(closestID);
	  	process.exit();
	  });
	  */
	});
};

function allDispatchers(ref) {
	return new Promise(function(resolve, reject) { 
	  ref.once('value', function(snapshot) {
	      var result = snapshot.toJSON();
	      resolve(result);
	  });
  });
};

function emergencyLocation(emergencyID, ref, db) {
	return new Promise(function(resolve, reject) {
		// Requires the - before id because it cant be inputted into terminal :(
		ref = db.ref('Emergency/-' + emergencyID + '/location');
		allDispatchers(ref).then(function(result) {
			resolve(result);
		});
	});
}

function closestDispatcher(emerLat, emerLong, ref, data, db, availableDispatcher) {
  	// JS Max Int
  	var closestDistance = 4294967295;
  	var closestDispatcherInArea = '';
  	for (var x in data) {
  		if (data[x]['Status'] == 'a') {
	  		var dispatchLat = data[x]['Location'].Latitude;
	  		var dispatchLong = data[x]['Location'].Longitude;
	  		var distanceBetween = distance(emerLat, emerLong, dispatchLat, dispatchLong);
	  		if (distanceBetween < closestDistance) {
	  			closestDispatcherInArea = x;
	  			closestDistance = distanceBetween;
	  		}
	  	}
  	}
  	return closestDispatcherInArea;
};

function statusUpdater(dispatchID, ref, db) {
	return new Promise(function(resolve, reject) {
		ref = db.ref('Dispatchers').child(dispatchID);
		ref.update({
			Status: 'b'
		}).then(function() {
			resolve(true);
		});
	});
}

/*
function closestDispatcher(emergencyID, ref, data, db, availableDispatcher) {
	return new Promise(function(resolve, reject) {
		var size = availableDispatcher.length;
  	var index = 0;
  	var found = false;
  	while(index < size) {
		  if (data[availableDispatcher[index]].Status.toLowerCase() == 'a') {
		  	ref = db.ref('Dispatchers').child(availableDispatcher[index]);
		  	result = availableDispatcher[index];
		  	ref.update({
					Status: 'b'
				}).then(function() {
					resolve(result);
				})
				break;
			}
			index++;
	  };
	  //result = null;
		//resolve(result);
	});
};
*/

/*
function closestDispatcherFinder(lat, long) {
var location = db.ref('Emergency/location');
var emerLat = 
var emerLong = 
var closestDispatcherDistance;

var dispatcher = availableDispatcher[0];
closestDispatcher = dispatcher; 
distance = distance(lat, lon, dispatcher[latitude], dispatcher[longitude])

for (var i = 1; i < size; i++) {
  var dispatcher2 = availableDispatcher[i];
var acc = distance(emerLat, emerLong, lat, long)
 if ( acc < distance) {
   distance = acc;
   closestDispatcher = dispatcher;
 }
}
*/

function distance(lat1, lon1, lat2, lon2) {
	var p = 0.017453292519943295;    // Math.PI / 180
	var c = Math.cos;
	var a = 0.5 - c((lat2 - lat1) * p)/2 +
	       c(lat1 * p) * c(lat2 * p) *
	       (1 - c((lon2 - lon1) * p))/2;

	return 12742 * Math.asin(Math.sqrt(a));
}