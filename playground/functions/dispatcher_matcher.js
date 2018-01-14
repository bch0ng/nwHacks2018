/**
	* Takes in an emergencyID and finds the nearest
	* available dispatcher.
	*
	* @param {String} emergencyID		a unique ID tied to an emergency
	* @returns {any}
	*/
module.exports = (emergencyID, context, callback) => {
	var admin = require("firebase-admin");

	// Initialize the app with a service account, granting admin privileges
	if (!admin.apps.length) {
    	admin.initializeApp({
	  		credential: admin.credential.cert(require('../serviceAccountKey.json')),
	  		databaseURL: "https://nwhacks-7c19a.firebaseio.com/"
		});
	}
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
		  	if (!result){
		  		throw new Error('No results');
		  	}
				emerLat = result['latitude'];
				emerLong = result['longitude'];
		  }).then(function() {
		  	closestID = closestDispatcher(emerLat, emerLong, ref, data, db, availableDispatcher);
			}).then(function() {
				statusUpdater(closestID, ref, db)
					.then(function(result) {
			  		callback(null, closestID);
			  	}).catch (function(e) {
						return callback(e);
			  	});
			}).catch(function(e) {
				return callback(e);
			});
	});
};

/**
	* Takes in a reference and returns either an
	* error if unreachable or a list of the dispatchers 
	* if reachable.
	*
	*/
function allDispatchers(ref) {
	return new Promise(function(resolve, reject) { 
	  ref.once('value', function(snapshot) {
	      var result = snapshot.toJSON();
	      resolve(result);
	  });
  });
};

/**
	* Takes in information regarding an emergency
	* and returns either an error if unsuccessful
	* or the location if successful.
	*
	* @param {String} emergencyID		a unique ID tied to an emergency
	* @param {String} ref						a reference to the database (after the base URL)
	* @param {any} 		db 						a dataframe	
	*/
function emergencyLocation(emergencyID, ref, db) {
	return new Promise(function(resolve, reject) {
		// Requires the - before id because it cant be inputted into terminal :(
		ref = db.ref('Emergency/' + emergencyID + '/location');
		allDispatchers(ref).then(function(result) {
			resolve(result);
		});
	});
};

/**
	* Takes in information regarding an emergency's location
	* and returns the ID of the closest available dispatcher in
	* the area.
	*
	* @param {float} emerLat								latitude of emergency location
	* @param {float} emerLong								latitude of emergency location
	* @param {String} ref										a reference to the database 
	*																				(after the base URL)
	* @param {any} 		db 										a dataframe	
	* @param {any}		availableDispatcher		array of all dispatchers
	* @returns {any}
	*/
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
	  		};
	  	};
  	};
  	return closestDispatcherInArea;
};

/**
 * Takes in the closest available dispatcher's ID
 * and changes their status from available to busy.
 *
 * @param {String} dispatchID		ID of dispatcher
 * @param {String} ref 					a reference to the database 
 */
function statusUpdater(dispatchID, ref, db) {
	return new Promise(function(resolve, reject) {
		ref = db.ref('Dispatchers').child(dispatchID);
		ref.update({
			Status: 'b'
		}).then(function() {
			resolve(true);
		});
	});
};

/**
 * Takes in two x-y points and returns the
 * distance between them.
 * @param {float} lat1 		point 1 latitude
 * @param {float} lon1 		point 1 longitude
 * @param {float} lat1 		point 2 latitude
 * @param {float} lon2 		point 2 longitude
 * @returns {float}				distance
 */	
function distance(lat1, lon1, lat2, lon2) {
	var p = 0.017453292519943295;    // Math.PI / 180
	var c = Math.cos;
	var a = 0.5 - c((lat2 - lat1) * p)/2 +
	       c(lat1 * p) * c(lat2 * p) *
	       (1 - c((lon2 - lon1) * p))/2;
	return 12742 * Math.asin(Math.sqrt(a));
};