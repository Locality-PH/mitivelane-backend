module.exports = (app) => {
  const organizationSetting = require("../../../../controller/admin/app-view/organization/organization_setting.controller");
  const auth = require("../../../../auth");
  var router = require("express").Router();

  router.post(
    "/validate-email",
    auth.authenticationToken,
    organizationSetting.validateEmail
  );

  router.post(
    "/add-member",
    auth.authenticationToken,
    organizationSetting.addMember
  );

  router.post(
    "/verify-request",
    auth.authenticationToken,
    organizationSetting.verifyRequest
  );

  router.post(
    "/accept-request",
    auth.authenticationToken,
    organizationSetting.acceptRequest
  );

  router.post(
    "/accept-request2",
    auth.authenticationToken,
    organizationSetting.acceptRequest2
  );

  router.get(
    "/get-organization-members/:organization_id",
    auth.authenticationToken,
    organizationSetting.getOrganizationMembers
  );

  router.post(
    "/delete-organization-member",
    auth.authenticationToken,
    organizationSetting.deleteOrganizationMember
  );

  router.post(
    "/delete-organization",
    auth.authenticationToken,
    organizationSetting.deleteOrganization
  );

  router.get(
    "/get-organization-request/:organization_id",
    auth.authenticationToken,
    organizationSetting.getOrganizationRequest
  );

  // router.post(
  //   "/delete-organization-request",
  //   auth.authenticationToken,
  //   organizationSetting.deleteOrganizationRequest
  // );

  app.use("/api/organization_setting", router);
};
