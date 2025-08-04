const getSendMessage = require('./getSendMessage');
const postCodeVerify = require('./postCodeVerify');
const postPasswordLogin = require('./postPasswordLogin');

module.exports = [getSendMessage, postCodeVerify, postPasswordLogin];
