module.exports = (app) => {
  const certificate = require("../../../../controller/admin/app-view/certificates/certificates.controller");
  const auth = require("../../../../auth");
  var router = require("express").Router();

  router.get("/", auth.authenticationToken, certificate.getCertificateAll);
  router.get("/:id", auth.authenticationToken, certificate.getCertificate);
  router.get(
    "/name/data",
    auth.authenticationToken,
    certificate.getCertificateName
  );
  router.post("/:id", auth.authenticationToken, certificate.updateCertificate);
  router.post(
    "/create",
    auth.authenticationToken,
    certificate.createCertificate
  );
  router.delete(
    "/:id",
    auth.authenticationToken,
    certificate.deleteCertificate
  );

  app.use("/api/cert-display", router);
};
