/**
* Geoca
* @param {String} emergencyID
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
		  	console.log('hfeiowhfaoiewhio');
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
		ref = db.ref('Emergency/' + emergencyID + '/location');
		allDispatchers(ref).then(function(result) {
			resolve(result);
		});
	});
};

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

function distance(lat1, lon1, lat2, lon2) {
	var p = 0.017453292519943295;    // Math.PI / 180
	var c = Math.cos;
	var a = 0.5 - c((lat2 - lat1) * p)/2 +
	       c(lat1 * p) * c(lat2 * p) *
	       (1 - c((lon2 - lon1) * p))/2;

	return 12742 * Math.asin(Math.sqrt(a));
};