module.exports = (app) => {
  require("./auth/accounts.routes")(app);
  require("./admin/pre-view/barangay.routes")(app);
  require("./admin/app-view/barangay.config.routes")(app);
  require("./admin/app-view/account-setting/account-details.routes")(app);
  require("./admin/app-view/resident/residents.routes")(app);
  require("./admin/app-view/household/household.routes")(app);
  require("./admin/app-view/blotter/blotter.routes")(app);
  require("./admin/app-view/blotter/blotter_request.routes")(app);
  require("./admin/app-view/blotter/settlement.routes")(app);
  //   require("./app/routes/exercises.routes")(app);
};
