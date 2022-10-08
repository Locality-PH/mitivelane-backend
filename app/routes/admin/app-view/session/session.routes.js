module.exports = (app) => {
    const sessionController = require("../../../../controller/admin/app-view/session/session.controller");
    const auth = require("../../../../auth");
    var router = require("express").Router();

    router.post("/add", auth.authenticationToken, sessionController.addSession);
    router.post("/getPage", auth.authenticationToken, sessionController.getAuditPage);
    // router.post("/get", auth.authenticationToken, sessionController.getSession);
    // router.post("/delete", auth.authenticationToken, sessionController.deleteSession);
    // router.post("/update", auth.authenticationToken, sessionController.updateSession);
    app.use("/api/session", router);
  };
  