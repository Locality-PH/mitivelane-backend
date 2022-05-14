module.exports = (app) => {
  const appConfig = require("../../../controller/admin/organization.config.controller.js");
  const auth = require("../../../auth");
  var router = require("express").Router();

  // router.post("/add", accounts.add);
  router.get(
    "/users/:auth_id",
    auth.authenticationToken,
    appConfig.getOrganizationList
  );
  app.use("/api/app", router);
};
