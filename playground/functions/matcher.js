/**
 * Matches an emergency caller with an available dispatcher.
 *
 */
const https = require("https");

module.exports = (context, callback) => {

	const https = require("https");
	const url =
	  "https://nwhacks-7c19a.firebaseio.com/Dispatchers.json";
	https.get(url, res => {
	  res.setEncoding("utf8");
	  let body = "";
	  res.on("data", data => {
	    body += data;
	  });
	  res.on("end", () => {
	    body = JSON.parse(body);
	    console.log(body);
	  });
	});
};
