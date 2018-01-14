const lib = require('lib')({token: 'aKaySToILc5co2mw61ZLXxWfAk_ydaxu15srcYt1RM6dXqN9NOkpDBkPRMmy0nB8'});

/**
 * Sets the dispatcher's status back to available
 *
 * @param {String} phoneNumber
 * @param {String} name
 * @param {String} emergency
 */
module.exports = (phoneNumber, name, emergency, context, callback) => {
	lib.messagebird.tel['@0.0.14'].sms({
	  originator: "13615022891", // (required)
	  recipient: phoneNumber, // (required)
	  body: name + " has been in a(n) " + emergency + " emergency." // (required)
	}, (err, result) => {
		if (err) {
			callback(err);
		} else {
			callback();
		}
	});
};