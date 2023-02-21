const db = require("../../../../models");
var mongoose = require("mongoose");
var moment = require("moment");

const Campaign = db.campaign;
const Account = db.account;

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
    var values = req.body.values;
    console.log("values", values);
    var page = parseInt(values.page) - 1;
    var pageSize = parseInt(values.pageSize);
    var organization_id = values.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);

    var sorter = { status: "ascending" };
    var filter = { organization_id: organization_id };

    if (values.hasOwnProperty("status") != false) {
      filter.status = values.status;
    }

    await Campaign.find(filter)
      .skip(page * pageSize)
      .limit(pageSize)
      .collation({ locale: "en" })
      .populate("suggestor", ["first_name", "last_name", "profileLogo", "profileUrl"])
      .populate("publisher", ["first_name", "last_name", "profileLogo", "profileUrl"])
      .populate("organization", ["organization_name", "profile"])
      .sort(sorter)
      .then(async (result) => {
        var list = result;
        await Campaign.countDocuments(filter).then((result) => {
          var total = result;

          var newList = list.map((list) => {
            var temp = Object.assign({}, list);
            temp._doc.participants = list.participants.length;
            temp._doc.likes = list.likes.length;
            return temp._doc;
          });

          res.json({ list: newList, total });
        });
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.getLatestCampaigns = async (req, res) => {
  const page = req.query.page - 1;
  const pageSize = req.query.pageSize;
  const sorter = "-createdAt";

  const landingPage = req.query.landingPage
  var filter = {}

  console.log("req.query", req.query)

  switch (landingPage) {
    case "homepage":
      filter = { status: "Approved" }
      break;

    case "suggestion":
      const userAuthId = req.user.auth_id
      const user = await Account.findOne({ uuid: userAuthId }, "_id")
      const userId = user._id
      filter = { suggestor : userId }
      break;

    case "barangay":
      var orgId = req.query.orgId
      filter = { organization: orgId}
      break;
    default:
      break;
  }

  try {
    const Campaigns = await Campaign
      .find(filter)
      .skip(page * pageSize)
      .limit(pageSize)
      .collation({ locale: "en" })
      .populate("suggestor", ["first_name", "last_name", "profileLogo", "profileUrl"])
      .populate("publisher", ["first_name", "last_name", "profileLogo", "profileUrl"])
      .populate("organization", ["organization_name", "profile"])
      .sort(sorter)
    res.json(Campaigns);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.getTrendingCampaigns = async (req, res) => {
  console.log("connected to trending api");
  res.json("test");
};

exports.getSearchCampaigns = async (req, res) => {
  const result = new Number(req.query.result);
  const start = new Number(req.query.start);
  const search = new String(req.query.q);
  console.log(result, start, search);
  const filterSearch = [
    { category: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
    { status: { $regex: search, $options: "i" } },
  ];
  try {
    const Campaigns = await Campaign.find({ $or: filterSearch })
      .skip(start)
      .select(
        "_id, organization , description , starting_date , status , category , images , title"
      )
      .limit(result)
      .sort({ createdAt: -1 })
      .populate({
        path: "organization",
        model: "organizations",
        select: ["_id", "organization_name", "profile"],
      });
    // .then((res) => {
    //   console.log(res);
    // });

    return res.json(Campaigns);
  } catch (error) {
    return res.json(error);
  }
};

exports.getCampaign = async (req, res) => {
  try {
    const organization_id = req.body.organization_id;
    const campaign_id = req.body.campaign_id;
    const campaign = await Campaign
      .findOne({
        organization_id: organization_id,
        _id: campaign_id,
      })
      .populate("suggestor", ["first_name", "last_name", "profileLogo", "profileUrl"])
      .populate("publisher", ["first_name", "last_name", "profileLogo", "profileUrl"])
      .populate("organization", ["organization_name", "profile"])
    res.json(campaign);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

exports.addCampaign = async (req, res) => {
  console.log("req.body", req.body);
  var newCampaignData = req.body.values;
  newCampaignData._id = new mongoose.Types.ObjectId();

  var hasPublisher = newCampaignData.hasOwnProperty('publisher')
  var hasSuggestor = newCampaignData.hasOwnProperty('suggestor')

  if (!hasPublisher || !hasSuggestor) {
    const userAuthId = req.user.auth_id;
    const user = await Account.findOne({ uuid: userAuthId }, "_id");
    const id = user._id;

    if (!hasPublisher) newCampaignData.publisher = id;
    if (!hasSuggestor) newCampaignData.suggestor = id;
  }

  try {
    const newCampaign = new Campaign(newCampaignData);
    await newCampaign.save();
    console.log("newCampaign", newCampaign);
    res.json(newCampaign);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.addCampaignSuggestion = async (req, res) => {
  console.log("req.body", req.body)
  var newCampaignData = req.body.values
  newCampaignData._id = new mongoose.Types.ObjectId();
  newCampaignData.organization = newCampaignData.organization_id

  const userAuthId = req.user.auth_id
  const user = await Account.findOne({ uuid: userAuthId }, "_id")
  const userId = user._id
  newCampaignData.suggestor = userId

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
  var values = req.body.values;
  const _id = values.campaign_id;

  var hasPublisher = values.hasOwnProperty('publisher')
  var hasSuggestor = values.hasOwnProperty('suggestor')

  console.log("hasPublisher", hasPublisher)
  console.log("hasSuggestor", hasSuggestor)

  if (!hasPublisher || !hasSuggestor) {

    const userAuthId = req.user.auth_id
    const user = await Account.findOne({ uuid: userAuthId }, "_id")
    const id = user._id

    if (!hasPublisher) values.publisher = id
    if (!hasSuggestor) values.suggestor = id

  }

  try {
    await Campaign.updateOne({ _id }, values).then(() => {
      res.json("updated");
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.deleteCampaign = async (req, res) => {
  var values = req.body.values;
  const deleteList = values.deleteList;

  console.log("delete values", values);

  try {
    await Campaign.deleteMany({ _id: deleteList }).then(() => {
      res.json("deleted");
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};
