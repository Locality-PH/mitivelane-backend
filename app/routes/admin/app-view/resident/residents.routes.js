module.exports = (app) => {
    const residentController = require("../../../../controller/admin/app-view/resident/resident.controller");
    const auth = require("../../../../auth");
    var router = require("express").Router();

    router.post("/getAll", auth.authenticationToken, residentController.getResidents);
    router.post("/add", auth.authenticationToken, residentController.addResident);
    router.post("/delete", auth.authenticationToken, residentController.deleteResident);
    router.post("/update", auth.authenticationToken, residentController.updateResident);
    app.use("/api/resident", router);
  };
  