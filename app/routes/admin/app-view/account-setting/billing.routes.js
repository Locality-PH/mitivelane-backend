module.exports = (app) => {
  const auth = require("../../../../auth");
  const billingDetails = require("../../../../controller/admin/app-view/account-setting/billing.controller.js");

  var router = require("express").Router();
  // router.post("/add", accounts.add);
  router.post(
    "/user/billing/create",
    auth.authenticationToken,
    billingDetails.createBilling
  );
  router.get(
    "/user/billing/data",
    auth.authenticationToken,
    billingDetails.getBilling
  );

  router.post(
    "/user/billing/delete",
    auth.authenticationToken,
    billingDetails.deleteBilling
  );
  app.use("/api/app", router);
};
