module.exports = (app) => {
    const settlement = require("../../../../controller/admin/app-view/blotter/settlement.controller");
    const auth = require("../../../../auth");
    var router = require("express").Router();

    router.get("/get-blotters/:barangay_id", auth.authenticationToken, settlement.getBlotters);

    app.use("/api/settlement", router);
};
