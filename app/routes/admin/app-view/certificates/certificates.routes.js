module.exports = (app) => {
  const certificate = require("../../../../controller/admin/app-view/certificates/certificates.controller");
  const auth = require("../../../../auth");
  var router = require("express").Router();

  router.post(
    "/create",
    auth.authenticationToken,
    certificate.createCertificate
  );

  router.get("/:id/", certificate.getCertificate);
  router.get("/", auth.authenticationToken, certificate.getCertificateAll);

  app.use("/api/cert-display", router);
};
