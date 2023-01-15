module.exports = (app) => {
  const auth = require("../../../../auth");
  const accountDetails = require("../../../../controller/admin/app-view/account-setting/account.config.controller.js");

  var router = require("express").Router();
  // router.post("/add", accounts.add);
  router.post(
    "/user/update",
    auth.authenticationToken,
    accountDetails.updateAccount
  );
  router.post(
    "/user/update/all",
    auth.authenticationToken,
    accountDetails.updateAccountAll
  );
  router.post(
    "/user/sessions",
    auth.authenticationToken,
    accountDetails.getSession
  );
  router.post(
    "/user/details/all",
    auth.authenticationToken,
    accountDetails.getDetailsAll
  );
  router.post(
    "/user/details",
    auth.authenticationToken,
    accountDetails.getDetails
  );

  router.post(
    "/user/sessions/delete",
    auth.authenticationToken,
    accountDetails.removeSession
  );

  app.use("/api/app", router);
};
