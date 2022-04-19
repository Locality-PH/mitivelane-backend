module.exports = (app) => {
    const purokController = require("../../../../controller/admin/app-view/purok/purok.controller");
    const auth = require("../../../../auth");
    var router = require("express").Router();

    router.post("/getAll", auth.authenticationToken, purokController.getPuroks);
    router.post("/add", auth.authenticationToken, purokController.addPurok);
    router.post("/delete", auth.authenticationToken, purokController.deletePurok);
    router.post("/update", auth.authenticationToken, purokController.updatePurok);
    app.use("/api/purok", router);
  };
  