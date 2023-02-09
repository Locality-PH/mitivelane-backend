module.exports = (app) => {
  const supplyController = require("../../../../controller/admin/app-view/supply/supply.controller");
  const auth = require("../../../../auth");
  var router = require("express").Router();

  router.post(
    "/get/current",
    auth.authenticationToken,
    supplyController.getCurrentSupply
  );
  router.post(
    "/update/current",
    auth.authenticationToken,
    supplyController.updateCurrentSupply
  );
  router.post(
    "/given/add",
    auth.authenticationToken,
    supplyController.addSupplyGiven
  );
  router.post(
    "/given/delete",
    auth.authenticationToken,
    supplyController.deleteSupplyGiven
  );
  router.post(
    "/given/update",
    auth.authenticationToken,
    supplyController.updateSupplyGiven
  );
  router.post(
    "/given/page/:organization_id/:page/:pageSize",
    auth.authenticationToken,
    supplyController.getGivenSupplyPage
  );

  router.post(
    "/receive/page/:organization_id/:page/:pageSize",
    auth.authenticationToken,
    supplyController.getReceivedSupplyPage
  );

  router.post(
    "/receive/add",
    auth.authenticationToken,
    supplyController.addSupplyReceived
  );
  router.post(
    "/receive/delete",
    auth.authenticationToken,
    supplyController.deleteSupplyReceived
  );
  router.post(
    "/receive/update",
    auth.authenticationToken,
    supplyController.updateSupplyReceived
  );

  router.get(
    "/inventory/:organization_id/:year",
    auth.authenticationToken,
    supplyController.getSupplyInventory
  );

  app.use("/api/supply", router);
};
