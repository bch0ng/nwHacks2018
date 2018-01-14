const https = require('https');
/**
 * Sets the dispatcher's status back to available
 *
 * @param {String} emergencyID
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
	// Adds "-" because terminal don't likey
	var ref = db.ref('Emergency').child(emergencyID);

	var googleMapsClient = require('@google/maps').createClient({
	  key: 'AIzaSyCgk4Bn5s8zEIpK6VTewRYENbqTzG4vCgU'
	});

	// Altitudes in meters in order of caller's altitude and ground-level altitude.
	var alts = [];
	emergencyLocation(emergencyID, ref, db)
	.then(function(result) {
		if (!result){
	  		throw new Error('No results');
	  	}
		alts.push(result['altitude']);
		var url = 'https://maps.googleapis.com/maps/api/elevation/json?locations=' +
				result['latitude'] + ',' + result['longitude'] + 
				'&key=AIzaSyCgk4Bn5s8zEIpK6VTewRYENbqTzG4vCgU';
		groundLevelElevation(url).then(function(result) {
			var groundLevel = result;
			alts.push(groundLevel);
			callback(null, alts);
		}).catch (function(e) {
			return callback(e);
	  	});
	});
};

function groundLevelElevation(url) {
	return new Promise(function(resolve, reject) {
		https.get(url, res => {
			res.setEncoding("utf8");
		  let body = "";
		  res.on("data", data => {
		    body += data;
		  });
		  res.on("end", () => {
    		body = JSON.parse(body);
    		// Nested results requires the 0 to access the JSON data
    		// we want.
    		resolve(body['results'][0]['elevation']);
    	});
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