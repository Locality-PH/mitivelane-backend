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
//chat
db.message = require("./chat/message.model")(mongoose);
db.conversation = require("./chat/conversation.model")(mongoose);
//barangay
db.barangayMember = require("./barangays/barangay_members.model.js")(mongoose);
db.barangay = require("./barangays/barangay.model.js")(mongoose);
db.resident = require("./resident/residents.models")(mongoose);

//blotter
db.blotter = require("./blotter/blotter.model")(mongoose);
db.blotter_request = require("./blotter/blotter_request.model")(mongoose);

//household
db.household = require("./barangays/household/household.model")(mongoose);
db.householdMember = require("./barangays/household/household_member.model")(
  mongoose
);

//purok
db.purok = require("./barangays/purok/purok.model")(mongoose);

//purok
db.SupplyGiven = require("./barangays/supply/supply_given.model")(mongoose);
db.SupplyReceive = require("./barangays/supply/supply_receive.model")(mongoose);
db.SupplyInventory = require("./barangays/supply/supply_inventory.model")(
  mongoose
);

//certificates
db.certificates = require("./certificates/cert.model.js")(mongoose);

module.exports = db;
