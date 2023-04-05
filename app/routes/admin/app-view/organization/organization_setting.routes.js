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
    "/validate-request",
    auth.authenticationToken,
    organizationSetting.validateRequest
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

  router.post(
    "/leave-organization",
    auth.authenticationToken,
    organizationSetting.leaveOrganization
  );

  router.get(
    "/get-organization-request/:organization_id",
    auth.authenticationToken,
    organizationSetting.getOrganizationRequest
  );

  router.post(
    "/edit-organization",
    auth.authenticationToken,
    organizationSetting.editOrganization
  );

  router.post(
    "/edit-member-role",
    auth.authenticationToken,
    organizationSetting.editMemberRole
  );

  router.get(
    "/get-organization-emails/:organization_id",
    auth.authenticationToken,
    organizationSetting.getOrganizationEmails
  );

  router.get(
    "/get-active-email/:organization_id",
    auth.authenticationToken,
    organizationSetting.getActiveEmail
  );

  router.post(
    "/set-active-email",
    auth.authenticationToken,
    organizationSetting.setActiveEmail
  );

  // router.post(
  //   "/delete-organization-request",
  //   auth.authenticationToken,
  //   organizationSetting.deleteOrganizationRequest
  // );

  router.get(
    "/get-first-org/:uuid",
    auth.authenticationToken,
    organizationSetting.getFistOrg
  );

  app.use("/api/organization_setting", router);
};
