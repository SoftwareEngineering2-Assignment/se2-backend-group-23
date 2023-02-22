//This file exports password and send scripts
const password = require('./password');
const send = require('./send');

module.exports = {
  mail: password,
  send
};
