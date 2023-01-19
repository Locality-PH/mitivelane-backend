module.exports = (app) => {
  const certificate = require("../../../../controller/admin/app-view/certificates/certificate_request.controller");
  const auth = require("../../../../auth");
  var router = require("express").Router();

  router.get(
    "/data",
    auth.authenticationToken,
    certificate.getCertificateRequest
  );

  router.post(
    "/data",
    auth.authenticationToken,
    certificate.createCertificateRequest
  );
  app.use("/api/cert-display/request", router);
};
