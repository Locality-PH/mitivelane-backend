module.exports = (app) => {
    const campaignController = require("../../../../controller/admin/app-view/campaign/campaign.controller");
    const auth = require("../../../../auth");
    var router = require("express").Router();

    router.post("/getAll", auth.authenticationToken, campaignController.getCampaigns);
    router.post("/get", auth.authenticationToken, campaignController.getCampaign);
    router.post("/page", auth.authenticationToken, campaignController.getCampaignPage);
    router.get("/latest", auth.authenticationToken, campaignController.getLatestCampaigns);
    router.get("/trending", auth.authenticationToken, campaignController.getTrendingCampaigns);
    router.post("/add", auth.authenticationToken, campaignController.addCampaign);
    router.post("/add-suggestion", auth.authenticationToken, campaignController.addCampaignSuggestion);
    router.post("/delete", auth.authenticationToken, campaignController.deleteCampaign);
    router.post("/update", auth.authenticationToken, campaignController.updateCampaign);

    //eto ang search
    router.get("/search", auth.authenticationToken, campaignController.getSearchCampaigns);

    app.use("/api/campaign", router);
  };
  