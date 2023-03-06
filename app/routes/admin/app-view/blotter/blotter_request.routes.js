module.exports = (app) => {
  const blotterRequest = require("../../../../controller/admin/app-view/blotter/blotter_request.controller");
  const auth = require("../../../../auth");
  var router = require("express").Router();

  router.post(
    "/request-blotter",
    auth.authenticationToken,
    blotterRequest.requestBlotter
  );
  router.get(
    "/get-blotter-request/:organization_id",
    auth.authenticationToken,
    blotterRequest.getBlotterRequest
  );

  router.post(
    "/approve-blotter-request",
    auth.authenticationToken,
    blotterRequest.approveBlotterRequest
  );
  router.post(
    "/reject-blotter-request",
    auth.authenticationToken,
    blotterRequest.rejectBlotterRequest
  );

  router.get(
    "/get-pending-blotter-request/:organization_id",
    auth.authenticationToken,
    blotterRequest.getPendingBlotterRequest
  );
  router.post(
    "/delete-blotter-request",
    auth.authenticationToken,
    blotterRequest.deleteBlotterRequest
  );

  router.get(
    "/record-status/:organization_id",
    auth.authenticationToken,
    blotterRequest.recordStatus
  );

  router.get(
    "/get-latest-blotter-requests/:organization_id",
    auth.authenticationToken,
    blotterRequest.getLatestBlotterRequests
  );

  router.get(
    "/get-blotter-request-client/:uuid",
    auth.authenticationToken,
    blotterRequest.getBlotterRequestsClient
  );

  app.use("/api/blotter_request", router);
};
