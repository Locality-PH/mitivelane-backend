module.exports = (app) => {
    const blotter = require("../../../../controller/admin/app-view/blotter/blotter.controller");
    const auth = require("../../../../auth");
    var router = require("express").Router();

    router.post("/create-blotter", auth.authenticationToken, blotter.createBlotter);
    router.get("/get-blotters/:barangay_id", auth.authenticationToken, blotter.getBlotters);
    
    app.use("/api/blotter", router);
};
