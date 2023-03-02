module.exports = (app) => {
  const certificateController = require("../../../../controller/admin/app-view/certificates/certificate_request.controller");
  const auth = require("../../../../auth");
  var router = require("express").Router();

  router.get(
    "/data",
    auth.authenticationToken,
    certificateController.getCertificateRequest
  );
  router.get(
    "/data/user",
    auth.authenticationToken,
    certificateController.getCertificateRequestPrivateData
  );
  router.get(
    "/data/latest",
    auth.authenticationToken,
    certificateController.getCertificateRequestLatest
  );
  router.post(
    "/data",
    auth.authenticationToken,
    certificateController.createCertificateRequest
  );

  router.get(
    "/data/type",
    auth.authenticationToken,
    certificateController.createCertificateActive
  );
  router.post(
    "/data/update",
    auth.authenticationToken,
    certificateController.updateCertificateRequest
  );
  router.post(
    "/data/delete",
    auth.authenticationToken,
    certificateController.deleteCertificateRequest
  );
  app.use("/api/cert-display/request", router);
};
