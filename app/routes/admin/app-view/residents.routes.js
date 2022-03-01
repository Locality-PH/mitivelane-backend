module.exports = (app) => {
    const residentController = require("../../../controller/admin/app-view/resident/resident.controller");
    const auth = require("../../../auth");
    var router = require("express").Router();

    router.get("/getAll", auth.authenticationToken, residentController.getResidents);
    router.post("/add", auth.authenticationToken, residentController.addResident);
    app.use("/api/resident", router);
  };
  