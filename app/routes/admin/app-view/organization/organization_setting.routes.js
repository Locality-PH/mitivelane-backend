module.exports = (app) => {
  const organizationSetting = require("../../../../controller/admin/app-view/organization/organization_setting.controller");
  const auth = require("../../../../auth");
  var router = require("express").Router();

  router.post(
    "/add-member",
    auth.authenticationToken,
    organizationSetting.addMember
  );

  router.get(
    "/get-organization-request/:organization_id",
    auth.authenticationToken,
    organizationSetting.getOrganizationRequest
  );

  router.post(
    "/delete-organization-request",
    auth.authenticationToken,
    organizationSetting.deleteOrganizationRequest
  );

  router.post(
    "/validate-email",
    auth.authenticationToken,
    organizationSetting.validateEmail
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

  app.use("/api/organization_setting", router);
};

