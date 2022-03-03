module.exports = (app) => {
    const blotter = require("../../../../controller/admin/app-view/blotter/blotter.controller");
    const auth = require("../../../../auth");
    var router = require("express").Router();

    router.post("/create-blotter", auth.authenticationToken, blotter.createBlotter);
    router.get("/get-blotters/:barangay_id", auth.authenticationToken, blotter.getBlotters);

    router.get("/get-blotter-initial-value/:_id", auth.authenticationToken,
        blotter.getBlotterInitialValue);
    router.post("/edit-blotter/:_id", auth.authenticationToken, blotter.editBlotter);

    router.post("/delete-blotter", auth.authenticationToken, blotter.deleteBlotter);

    router.get("/record-cases/:barangay_id", auth.authenticationToken, blotter.recordCases);

    app.use("/api/blotter", router);
};
