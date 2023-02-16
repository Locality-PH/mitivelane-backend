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
    var page = parseInt(values.page) - 1;
    var pageSize = parseInt(values.pageSize);
    var organization_id = values.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);

    var tableScreen = values.tableScreen
    var tableScreenLength = Object.keys(tableScreen).length
    var sorter = null
    var filter = { organization_id: organization_id }
    var doesFilterExist = tableScreen.hasOwnProperty("filter")
    var doesSorterExist = tableScreen.hasOwnProperty("sorter")
    var numberKeys = [] // put here keys that are number fields
    var dateKeys = ["createdAt"] // put here keys that are date fields

    if (doesFilterExist != false) {
      var tempFilter = tableScreen.filter
      var isKeyNumber = false
      var isKeyDate = false

      for (const [key, value] of Object.entries(tempFilter)) {
        if (value != null) {
          isKeyNumber = numberKeys.includes(key)
          isKeyDate = dateKeys.includes(key)

          if (isKeyNumber == true) {
            filter = { ...filter, [key]: value }
          }

          if (isKeyDate == true) {
            var today = moment(value[0]).startOf('day')
            var endDate = moment(value[0]).endOf('day')

            var dateFilter = {
              [key]: {
                $gte: today,
                $lte: endDate
              }
            }

            filter = { ...filter, ...dateFilter }
          }

          if (isKeyDate == false && isKeyNumber == false) {
            filter = { ...filter, [key]: { $regex: value.join("|"), $options: "i" } }
          }
        }
      }
    }

    if (doesSorterExist != false) {
      var tempSorter = tableScreen.sorter
      var field = tempSorter.field
      var order = tempSorter.order + 'ing'
      sorter = { [field]: order }
    }

    if (doesSorterExist != true) {
      sorter = { ["createdAt"]: "descending" }
    }

    // console.log("filter", filter)
    // console.log("sorter", sorter)

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
            res.json({ list, total });
          });
      })

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};


exports.addCampaign = async (req, res) => {
  console.log("req.body", req.body)
  var newCampaignData = req.body.values
  newCampaignData._id = new mongoose.Types.ObjectId();

  console.log("newCampaignData", newCampaignData)

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
