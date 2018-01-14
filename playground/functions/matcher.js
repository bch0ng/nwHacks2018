/**
 * Matches an emergency caller with an available dispatcher.
 *
 * @returns {any}
 */

module.exports = (context, callback) => {

	// Read the Database

	var admin = require("firebase-admin");
	admin.database.enableLogging(true);
	var serviceAccount = require("../serviceAccountKey.json");
	admin.initializeApp({
	  credential: admin.credential.cert(serviceAccount),
	  databaseURL: "https://nwhacks-7c19a.firebaseio.com"
	});
	var db = admin.database();
	var ref = db.ref("/Dispatchers/Kanye-West");
	console.log('lol');
	var data;
	ref.on("value", function(snapshot) {
		data = snapshot.val();
	  console.log(data);
	});

	return callback(data);

	/*
	if (userID == null) {	// Check if userID is present in database
			throw new Error('Missing userID');
	}
	if (disID == null) { // Check if disID is present in database
		throw new Error('Missing disID');
	}
  return callback(null, `bye`);
  */

  //callback(curl.getJSON('https://nwhacks-7c19a.firebaseio.com/Dispatchers.json');


};