module.exports = (app) => {
  const preRegister = require("../../../controller/admin/pre-view/pre_register.controller.js");
  const auth = require("../../../auth");

  var router = require("express").Router();
  // router.post("/add", accounts.add);
  //Test Create Barangay
  router.post("/barangay/", preRegister.registerBarangay);
  router.post("/", preRegister.registerBarangayMember);
  router.get("/barangay/:barangay_id", preRegister.list);

  //Create Finalized Barangay
  router.post(
    "/create-barangay",
    auth.authenticationToken,
    preRegister.createBarangay
  );

  app.use("/api/pre", router);
};
