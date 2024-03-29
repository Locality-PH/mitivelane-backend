module.exports = (app) => {
  require("./auth/accounts.routes")(app);
  require("./admin/pre-view/organization.routes")(app);
  require("./admin/app-view/organization.config.routes")(app);
  require("./admin/app-view/account-setting/account-details.routes")(app);
  require("./admin/app-view/account-setting/billing.routes")(app);
  require("./admin/app-view/resident/residents.routes")(app);
  require("./admin/app-view/household/household.routes")(app);
  require("./admin/app-view/purok/purok.routes")(app);
  require("./admin/app-view/campaign/campaign.routes")(app);
  require("./admin/app-view/blotter/blotter.routes")(app);
  require("./admin/app-view/blotter/blotter_request.routes")(app);
  require("./admin/app-view/blotter/settlement.routes")(app);
  require("./admin/app-view/chat/chat.routes")(app);
  require("./admin/app-view/supply/supply.routes")(app);
  require("./admin/app-view/certificates/certificates.routes")(app);
  require("./admin/app-view/certificates/certificates_request.routes")(app);
  require("./admin/app-view/organization/organization.routes")(app);
  require("./admin/app-view/organization/organization_setting.routes")(app);
  require("./admin/app-view/session/session.routes")(app);
  require("./admin/app-view/notifications/notifications.routes")(app);
  require("./admin/app-view/analytic/analytic.routes")(app);
  require("./admin/app-view/comment/comment.routes")(app);

  //   require("./app/routes/exercises.routes")(app);
};
