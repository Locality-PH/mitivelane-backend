module.exports = (app) => {
    const supplyController = require("../../../../controller/admin/app-view/supply/supply.controller");
    const auth = require("../../../../auth");
    var router = require("express").Router();

    router.post("/getAll", auth.authenticationToken, supplyController.getSupplies);
    router.post("/given/add", auth.authenticationToken, supplyController.addSupplyGiven);
    router.post("/given/delete", auth.authenticationToken, supplyController.deleteSupplyGiven);
    router.post("/given/update", auth.authenticationToken, supplyController.updateSupplyGiven);
    router.post("receive/add", auth.authenticationToken, supplyController.addSupplyReceived);
    router.post("receive/delete", auth.authenticationToken, supplyController.deleteSupplyReceived);
    router.post("receive/update", auth.authenticationToken, supplyController.updateSupplyReceived);
    app.use("/api/supply", router);
  };
  