/**
 * Matches an emergency caller with an available dispatcher.
 *
 * @param {string}		userID of emergency caller
 * @param {string}		disID of dispatcher 
 * @returns {string}
 */''
const lib = require('lib');

module.exports = (userID = null, disID = null, context, callback) => {

	// Read the Database
	var admin = require('firebase-admin');
	var serviceAccount = require('path/to/<serviceAccountKey>.json');
	admin.initializeApp({
	  credential: admin.credential.cert(serviceAccount),
	  databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
	});
	var db = admin.database();
	// https://docs-examples.firebaseio.com/server/saving-data/fireblog/posts. 
	var ref = db.ref("server/saving-data/fireblog/posts");
	var data;
	ref.on("value", function(snapshot) {
	  data = snapshot.val();
	}, function (errorObject) {
	  console.log("The read failed: " + errorObject.code);
	});

	return callback(null, data);
	/*
	if (userID == null) {	// Check if userID is present in database
			throw new Error('Missing userID');
	}
	if (disID == null) { // Check if disID is present in database
		throw new Error('Missing disID');
	}
  return callback(null, `bye ${userID} and ${disID}`);
  */

};