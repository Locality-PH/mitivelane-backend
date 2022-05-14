module.exports = (app) => {
  const preRegister = require("../../../controller/admin/pre-view/pre_register.controller.js");
  const auth = require("../../../auth");
  const appConfig = require("../../../controller/admin/organization.config.controller.js");

  var router = require("express").Router();
  // router.post("/add", accounts.add);
  //Test Create Organization
  router.post("/organization/", preRegister.registerOrganization);
  router.post("/", preRegister.registerOrganizationMember);
  router.get("/organization/:organization_id", preRegister.list);
  router.get(
    "/users/:auth_id",
    auth.authenticationToken,
    appConfig.getPreOrganizationList
  );

  //Create Finalized Organization
  router.post(
    "/create-organization",
    auth.authenticationToken,
    preRegister.createOrganization
  );

  app.use("/api/pre", router);
};
