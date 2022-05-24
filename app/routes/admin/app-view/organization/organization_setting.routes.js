module.exports = (app) => {
  const organizationSetting = require("../../../../controller/admin/app-view/organization/organization_setting.controller");
  const auth = require("../../../../auth");
  var router = require("express").Router();

  router.post(
    "/add-member",
    auth.authenticationToken,
    organizationSetting.addMember
  );

  app.use("/api/organization_setting", router);
};

