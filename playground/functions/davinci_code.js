const https = require('https');
/**
 * Sets the dispatcher's status back to available
 *
 * @param {String} dispatchID
 */
module.exports = (dispatchID, context, callback) => {
	var admin = require("firebase-admin");

	// Initialize the app with a service account, granting admin privileges
	admin.initializeApp({
	  credential: admin.credential.cert(require('../serviceAccountKey.json')),
	  databaseURL: "https://nwhacks-7c19a.firebaseio.com/"
	});
	var db = admin.database();
	//admin.database.enableLogging(true);
	// Adds "-" because terminal don't likey
	var ref = db.ref('Dispatchers').child(dispatchID);

	allDispatchers(ref)
	.then(function(result) {
		var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
				result['Location'].Latitude + ',' + result['Location'].Longitude + 
				//'&result_type=political' +
				'&key=AIzaSyC5ZLReN35KxOht53W6Gh8BpeGip2gomuM';
		streetAddress(url).then(function(result) {
			var name = result['results'][5]['formatted_address'];
			callback(name);
		}).then(function() {
			process.exit();
		})
	});
};

function streetAddress(url) {
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
    		resolve(body);
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