module.exports = (app) => {
  const certificateController = require("../../../../controller/admin/app-view/certificates/certificates.controller");
  const auth = require("../../../../auth");
  var router = require("express").Router();

  router.get(
    "/",
    auth.authenticationToken,
    certificateController.getCertificateAll
  );
  router.get(
    "/:id",
    auth.authenticationToken,
    certificateController.getCertificate
  );
  router.get(
    "/name/data",
    auth.authenticationToken,
    certificateController.getCertificateName
  );
  router.post(
    "/create/data",
    auth.authenticationToken,
    certificateController.createCertificate
  );
  router.post(
    "/:id",
    auth.authenticationToken,
    certificateController.updateCertificate
  );
  router.delete(
    "/:id",
    auth.authenticationToken,
    certificateController.deleteCertificate
  );

  app.use("/api/cert-display", router);
};
