module.exports = (app) => {
  const appConfig = require("../../../controller/admin/barangay.config.controller.js");

  var router = require("express").Router();
  // router.post("/add", accounts.add);
  router.get("/users/:auth_id", appConfig.getBarangayList);

  app.use("/app", router);
};
