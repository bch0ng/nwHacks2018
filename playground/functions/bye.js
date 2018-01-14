/**
* Geoca
* @param {float} lat
* @param {float} long
* @returns {any}
*/
module.exports = (lat, long, context, callback) => {
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
	  closestDispatcher(lat, long, ref, data, db, availableDispatcher)
	  .then(function(result) {
	  	var data = result;
	  }).then(function() {
	  	process.exit();
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

function closestDispatcher(lat, long, ref, data, db, availableDispatcher) {
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