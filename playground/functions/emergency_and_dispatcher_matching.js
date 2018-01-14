/**
 * Sets the dispatcher's status back to available
 *
 * @param {String} emergencyID
 * @param {String} dispatchID
 */
module.exports = (emergencyID, dispatchID, context, callback) => {
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

	statusUpdater(ref, dispatchID)
	.then(function() {
		callback(null, null);
	})
};

function statusUpdater(ref, dispatchID) {
	return new Promise(function(resolve, reject) {
		ref.update({
			dispatcherID: dispatchID
		}).then(function() {
			resolve(true);
		});
	});
};