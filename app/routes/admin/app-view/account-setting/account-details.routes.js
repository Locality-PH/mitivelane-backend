module.exports = (app) => {
  const auth = require("../../../../auth");
  const accountDetails = require("../../../../controller/admin/app-view/account-setting/account.config.controller.js");

  var router = require("express").Router();
  // router.post("/add", accounts.add);
  router.post("/user/update", accountDetails.updateAccount);
  router.post("/user/sessions", accountDetails.getSession);
  router.post("/user/details", accountDetails.getDetails);

  router.post(
    "/user/sessions/delete",
    auth.authenticationToken,
    accountDetails.removeSession
  );

  app.use("/api/app", router);
};
