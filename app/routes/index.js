module.exports = (app) => {
  require("./auth/accounts.routes")(app);
  require("./admin/pre-view/barangay.routes")(app);
  require("./admin/app-view/barangay.config.routes")(app);
  require("./admin/app-view/account-setting/account-details.routes")(app);

  //   require("./app/routes/exercises.routes")(app);
};
