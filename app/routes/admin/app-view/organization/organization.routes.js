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

  router.get(
    "/get-organization/:organization_id",
    auth.authenticationToken,
    organization.getOrganization
  );

  router.get(
    "/get-organization-members/:organization_id",
    auth.authenticationToken,
    organization.getOrganizationMembers
  );

  router.get(
    "/get-organization-owner/:organization_id/:uuid",
    auth.authenticationToken,
    organization.getOrganizationOwner
  );

  app.use("/api/organization", router);
};


