module.exports = (app) => {
    const blotterRequest = require("../../../../controller/admin/app-view/blotter/blotter_request.controller");
    const auth = require("../../../../auth");
    var router = require("express").Router();

    router.post("/request-blotter", auth.authenticationToken, blotterRequest.requestBlotter);
    router.get("/get-blotter-request/:barangay_id", auth.authenticationToken, blotterRequest.getBlotterRequest);
	
	router.post("/approve-blotter-request", auth.authenticationToken, blotterRequest.approveBlotterRequest);
	router.post("/reject-blotter-request", auth.authenticationToken, blotterRequest.rejectBlotterRequest);
	
	router.get("/get-pending-blotter-request/:barangay_id", auth.authenticationToken, blotterRequest.getPendingBlotterRequest);
	router.post("/delete-blotter-request", auth.authenticationToken, blotterRequest.deleteBlotterRequest);
	
	router.get("/record-status/:barangay_id", auth.authenticationToken, blotterRequest.recordStatus);
	
	router.get("/get-latest-blotter-requests/:barangay_id", auth.authenticationToken, blotterRequest.getLatestBlotterRequests);

    app.use("/api/blotter_request", router);
};

