const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;

//Tokens
db.token = require("./auth/tokens.model.js")(mongoose);
//account
db.account = require("./auth/accounts.model.js")(mongoose);
//barangay
db.barangayMember = require("./barangays/barangay_members.model.js")(mongoose);
db.barangay = require("./barangays/barangay.model.js")(mongoose);
db.resident = require("./resident/residents.models")(mongoose);

module.exports = db;
