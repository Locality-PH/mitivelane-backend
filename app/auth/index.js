const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const jwt = require("jsonwebtoken");
jwt.Promise = global.Promise;

const token = {};
token.jwt = jwt;
token.authenticationToken = require("./jwt.auth.js")(jwt);

module.exports = token;
