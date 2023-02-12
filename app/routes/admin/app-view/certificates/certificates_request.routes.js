module.exports = (app) => {
  const certificate = require("../../../../controller/admin/app-view/certificates/certificate_request.controller");
  const auth = require("../../../../auth");
  var router = require("express").Router();

  router.get(
    "/data",
    auth.authenticationToken,
    certificate.getCertificateRequest
  );
  router.get(
    "/data/user",
    auth.authenticationToken,
    certificate.getCertificateRequestPrivateData
  );
  router.get(
    "/data/latest",
    auth.authenticationToken,
    certificate.getCertificateRequestLatest
  );
  router.post(
    "/data",
    auth.authenticationToken,
    certificate.createCertificateRequest
  );

  router.get(
    "/data/type",
    auth.authenticationToken,
    certificate.createCertificateActive
  );
  router.post(
    "/data/update",
    auth.authenticationToken,
    certificate.updateCertificateRequest
  );
  router.post(
    "/data/delete",
    auth.authenticationToken,
    certificate.deleteCertificateRequest
  );
  app.use("/api/cert-display/request", router);
};
