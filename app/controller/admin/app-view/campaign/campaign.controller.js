const db = require("../../../../models");
var mongoose = require("mongoose");
var moment = require('moment');

const Campaign = db.campaign;

exports.getCampaigns = async (req, res) => {
  var organization_id = req.body.organization_id;
  organization_id = mongoose.Types.ObjectId(organization_id);

  try {
    const Campaigns = await Campaign.find({ organization_id });
    res.json(Campaigns);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.getCampaignPage = async (req, res) => {
  try {
    var values = req.body.values
    console.log("values", values)
    var page = parseInt(values.page) - 1;
    var pageSize = parseInt(values.pageSize);
    var organization_id = values.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);

    var sorter = null
    var filter = { organization_id: organization_id }

    await Campaign.find(filter)
      .skip(page * pageSize)
      .limit(pageSize)
      .collation({ locale: "en" })
      .sort(sorter)
      .then(async (result) => {
        var list = result
        await Campaign.countDocuments(filter)
          .then((result) => {
            var total = result

            var newList = list.map((list) => {
              var temp = Object.assign({}, list);
              temp._doc.participants = list.participants.length
              temp._doc.likes = list.likes.length
              return temp._doc
            })

            console.log("newList", newList)
            res.json({ list: newList, total });
          });
      })

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.getCampaign = async (req, res) => {
  try {
    const organization_id = req.body.organization_id;
    const campaign_id = req.body.campaign_id;
    const campaign = await Campaign.findOne({
      organization_id: organization_id,
      _id: campaign_id,
    })
    res.json(campaign);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

exports.addCampaign = async (req, res) => {
  console.log("req.body", req.body)
  var newCampaignData = req.body.values
  newCampaignData._id = new mongoose.Types.ObjectId();

  try {
    const newCampaign = new Campaign(newCampaignData);
    await newCampaign.save();
    res.json(newCampaign);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.updateCampaign = async (req, res) => {
  var values = req.body.values
  const newAreaData = values.newAreaData;

  try {
    await Campaign.updateOne({ _id: newAreaData.Campaign_id }, newAreaData)
      .then(() => {
        res.json("updated");
      })

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.deleteCampaign = async (req, res) => {
  var values = req.body.values
  const selectedArray = values.selectedArray;

  try {
    await Campaign.deleteMany({ _id: selectedArray })
      .then(() => {
        res.json("deleted");
      })

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};
