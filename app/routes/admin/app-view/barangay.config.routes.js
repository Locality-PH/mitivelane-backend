module.exports = (app) => {
  const appConfig = require("../../../controller/admin/barangay.config.controller.js");
  const auth = require("../../../auth");
  var router = require("express").Router();
  
  // router.post("/add", accounts.add);
  router.get("/users/:auth_id", auth.authenticationToken, appConfig.getBarangayList);
  router.post("/test", auth.authenticationToken, appConfig.testToken);
  app.use("/api/app", router);
};
