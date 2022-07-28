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
//organization
db.organizationMember = require("./organizations/organization_members.model.js")(
  mongoose
);
db.organization = require("./organizations/organization.model.js")(mongoose);
db.organization_request = require("./organizations/organization_request.model.js")(mongoose);
db.resident = require("./resident/residents.models")(mongoose);

//blotter
db.blotter = require("./blotter/blotter.model")(mongoose);
db.blotter_request = require("./blotter/blotter_request.model")(mongoose);

//household
db.household = require("./household/household.model")(mongoose);
db.householdMember = require("./household/household_member.model")(
  mongoose
);

//purok
db.purok = require("./purok/purok.model")(mongoose);

//Supply
db.supplyGiven = require("./supply/supply_given.model")(mongoose);
db.supplyReceive = require("./supply/supply_receive.model")(mongoose);
db.supplyInventory = require("./supply/supply_inventory.model")(
  mongoose
);

//Session
db.session = require("./session/session.model")(mongoose);

//certificates
db.certificates = require("./certificates/cert.model.js")(mongoose);

module.exports = db;
