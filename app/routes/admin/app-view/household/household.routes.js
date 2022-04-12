module.exports = (app) => {
    const householdController = require("../../../../controller/admin/app-view/household/household.controller");
    const auth = require("../../../../auth");
    var router = require("express").Router();

    router.post("/add", auth.authenticationToken, householdController.addHousehold);
    router.post("/getAll", auth.authenticationToken, householdController.getHouseholds);
    router.post("/get", auth.authenticationToken, householdController.getHousehold);
    router.post("/delete", auth.authenticationToken, householdController.deleteHousehold);
    router.post("/update", auth.authenticationToken, householdController.updateHousehold);
    app.use("/api/household", router);
  };
  