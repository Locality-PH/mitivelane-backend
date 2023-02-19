const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;

//Tokens
db.token = require("./auth/tokens.model.js")(mongoose);

//Account
db.account = require("./auth/accounts.model.js")(mongoose);

//Billing
db.billing = require("./auth/billing.model.js")(mongoose);

//Chat
db.message = require("./chat/message.model")(mongoose);
db.conversation = require("./chat/conversation.model")(mongoose);

//Organization
db.organizationMember = require("./organizations/organization_members.model.js")(
  mongoose
);
db.organization = require("./organizations/organization.model.js")(mongoose);
db.organization_request = require("./organizations/organization_request.model.js")(
  mongoose
);

//Resident
db.resident = require("./resident/residents.models")(mongoose);

//Campaign
db.campaign = require("./campaign/campaign.model")(mongoose);

//Blotter
db.blotter = require("./blotter/blotter.model")(mongoose);
db.blotter_request = require("./blotter/blotter_request.model")(mongoose);

//Household
db.household = require("./household/household.model")(mongoose);
// db.householdMember = require("./household/household_member.model")(
//   mongoose
// );

//Purok
db.purok = require("./purok/purok.model")(mongoose);

//Supply
db.supplyGiven = require("./supply/supply_given.model")(mongoose);
db.supplyReceive = require("./supply/supply_receive.model")(mongoose);
db.supplyInventory = require("./supply/supply_inventory.model")(mongoose);

//Session
db.session = require("./session/session.model")(mongoose);

//Certificates
db.certificates = require("./certificates/cert.model.js")(mongoose);
db.certificates_request = require("./certificates/cert_request.model.js")(
  mongoose
);

//notifications
db.notifications = require("./notification/organization_notification.model.js")(
  mongoose
);
//Analytic
db.session_duration = require("./analytic/session_duration.model.js")(mongoose);
db.visitor = require("./analytic/visitor.model.js")(mongoose);
db.analytics = require("./analytic/analytic.model.js")(mongoose);

module.exports = db;
