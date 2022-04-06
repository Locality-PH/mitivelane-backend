module.exports = (app) => {
    const householdController = require("../../../../controller/admin/app-view/household/household.controller");
    const auth = require("../../../../auth");
    var router = require("express").Router();

    router.post("/add", auth.authenticationToken, householdController.addHousehold);
    router.post("/getAll", auth.authenticationToken, householdController.getHouseholds);
    router.post("/delete", auth.authenticationToken, householdController.deleteHousehold);
    // router.post("/add", auth.authenticationToken, residentController.addResident);
    // router.post("/delete", auth.authenticationToken, residentController.deleteResident);
    // router.post("/update", auth.authenticationToken, residentController.updateResident);
    app.use("/api/household", router);
  };
  