module.exports = (app) => {
  const analyticController = require("../../../../controller/admin/app-view/analytic/analytic.controller");
  const auth = require("../../../../auth");
  var router = require("express").Router();

  router.post(
    "/create",
    auth.authenticationToken,
    analyticController.createAnalytic
  );
  router.get("/data", auth.authenticationToken, analyticController.getAnalytic);
  app.use("/api/analytic", router);
};
