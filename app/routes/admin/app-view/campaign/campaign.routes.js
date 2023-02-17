module.exports = (app) => {
    const campaignController = require("../../../../controller/admin/app-view/campaign/campaign.controller");
    const auth = require("../../../../auth");
    var router = require("express").Router();

    router.post("/getAll", auth.authenticationToken, campaignController.getCampaigns);
    router.post("/get", auth.authenticationToken, campaignController.getCampaign);
    router.post("/page", auth.authenticationToken, campaignController.getCampaignPage);
    router.post("/add", auth.authenticationToken, campaignController.addCampaign);
    router.post("/delete", auth.authenticationToken, campaignController.deleteCampaign);
    router.post("/update", auth.authenticationToken, campaignController.updateCampaign);
    app.use("/api/campaign", router);
  };
  