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
    "/get-all-organizations-client",
    auth.authenticationToken,
    organization.getAllOrganizationsClient
  );

  router.get(
    "/get-organization/:organization_id",
    auth.authenticationToken,
    organization.getOrganization
  );

  router.get(
    "/get-organization-client/:organization_id/:uuid",
    auth.authenticationToken,
    organization.getOrganizationClient
  );

  router.get(
    "/get-user-following/:uuid",
    auth.authenticationToken,
    organization.getUserFollowing
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

  router.post(
    "/follow",
    auth.authenticationToken,
    organization.follow
  );

  router.post(
    "/unfollow",
    auth.authenticationToken,
    organization.unfollow
  );

  router.get(
    "/get-followers/:organization_id",
    auth.authenticationToken,
    organization.getFollowers
  );


  app.use("/api/organization", router);
};


