module.exports = (app) => {
  const preRegister = require("../../../controller/admin/pre-view/pre_register.controller.js");

  var router = require("express").Router();
  // router.post("/add", accounts.add);
  router.post("/barangay/", preRegister.registerBarangay);
  router.post("/", preRegister.registerBarangayMember);
  router.get("/barangay/:barangay_id", preRegister.list);
  router.post("/create-barangay", preRegister.createBarangay);

  app.use("/pre", router);
};
