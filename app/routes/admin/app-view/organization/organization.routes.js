module.exports = (app) => {
  const organization = require("../../../../controller/admin/app-view/organization/organization.controller");
  const auth = require("../../../../auth");
  var router = require("express").Router();

  router.get(
    "/get-all-organizations",
    auth.authenticationToken,
    organization.getAllOrganizations
  );

  router.get(
    "/get-latest-organizations",
    auth.authenticationToken,
    organization.getLatestOrganizations
  );

  app.use("/api/organization", router);
};


