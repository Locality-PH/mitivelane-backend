module.exports = (app) => {
  const supplyController = require("../../../../controller/admin/app-view/supply/supply.controller");
  const auth = require("../../../../auth");
  var router = require("express").Router();

  router.post(
    "/given/getAll",
    auth.authenticationToken,
    supplyController.getGivenSupplies
  );

  router.post(
    "/receive/getAll",
    auth.authenticationToken,
    supplyController.getReceivedSupplies
  );

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
  router.get(
    "/given/getPage/:barangay_id/:page/:pageSize",
    auth.authenticationToken,
    supplyController.getGivenSupplyPage
  );

  router.get(
    "/receive/getPage/:barangay_id/:page/:pageSize",
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
    "/receive/getPage/:organization_id/:page/:pageSize",
    auth.authenticationToken,
    supplyController.getReceivedSupplyPage
  );
  app.use("/api/supply", router);
};
