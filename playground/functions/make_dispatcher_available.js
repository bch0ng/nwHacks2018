/**
 * Sets the dispatcher's status back to available
 *
 * @param {String} dispatchID
 */
module.exports = (dispatchID, context, callback) => {
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
	var ref = db.ref('Dispatchers').child(dispatchID);

	statusUpdater(ref)
	.then(function() {
		callback(null, null)
	})
};

function statusUpdater(ref) {
	return new Promise(function(resolve, reject) {
		ref.update({
			Status: 'a'
		}).then(function() {
			resolve(true);
		});
	});
};