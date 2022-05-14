module.exports = (app) => {
  const blotter = require("../../../../controller/admin/app-view/blotter/blotter.controller");
  const auth = require("../../../../auth");
  var router = require("express").Router();

  router.post(
    "/create-blotter",
    auth.authenticationToken,
    blotter.createBlotter
  );
  router.get(
    "/get-blotters/:organization_id",
    auth.authenticationToken,
    blotter.getBlotters
  );

  // router.get("/get-blotter-initial-value/:_id", auth.authenticationToken,
  // blotter.getBlotterInitialValue);
  router.post(
    "/edit-blotter/:_id",
    auth.authenticationToken,
    blotter.editBlotter
  );

  router.post(
    "/delete-blotter",
    auth.authenticationToken,
    blotter.deleteBlotter
  );

  router.get(
    "/record-cases/:organization_id",
    auth.authenticationToken,
    blotter.recordCases
  );

  router.get(
    "/get-latest-blotters/:organization_id",
    auth.authenticationToken,
    blotter.getLatestBlotters
  );

  app.use("/api/blotter", router);
};
