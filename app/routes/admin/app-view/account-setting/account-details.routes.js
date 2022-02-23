module.exports = (app) => {
  const auth = require("../../../../auth");
  const accountDetails = require("../../../../controller/admin/app-view/account-setting/account.config.controller.js");

  var router = require("express").Router();
  // router.post("/add", accounts.add);
  router.post("/user/update", accountDetails.updateAccount);
  app.use("/api/app", router);
};
