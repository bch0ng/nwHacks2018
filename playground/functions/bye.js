/**
* A basic Bye World function
* @param {string} name Who you're saying hello to
* @returns {string}
*/
module.exports = (name = 'world', context, callback) => {

  callback(null, `bye ${name}`);

};