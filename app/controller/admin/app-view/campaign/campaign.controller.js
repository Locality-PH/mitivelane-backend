const db = require("../../../../models");
var mongoose = require("mongoose");
var moment = require("moment");
const NotificationMiddleware = require("../../../../helper/notification");
const NodeMailer = require("../../../../nodemailer/index");
const { RecordSession } = require("../../../../helper/session");

const Campaign = db.campaign;
const Organization = db.organization;
const Account = db.account;

const populatePeople = [
  "first_name",
  "last_name",
  "profileLogo",
  "profileUrl",
  "email",
  "auth_id"
]

const populateOrg = ["organization_name", "profile", "address"]

exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: "Approved" })
      .populate("publisher")
      .sort({ participantCounter: -1 })

    res.json(campaigns);
  } catch (error) {
    console.log(error);
    res.json([]);
  } populatePeople
};

exports.getSuggestedPage = async (req, res) => {
  try {
    var values = req.body.values;
    var page = parseInt(values.page) - 1;
    var pageSize = parseInt(values.pageSize);
    var organization_id = values.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);

    var tableScreen = values.tableScreen
    var tableScreenLength = Object.keys(tableScreen).length
    var sorter = {}
    var filter = { organization: organization_id };
    var doesFilterExist = tableScreen.hasOwnProperty("filter")
    var doesSorterExist = tableScreen.hasOwnProperty("sorter")
    var numberKeys = [] // put here keys that are number fields
    var dateKeys = ["starting_date"] // put here keys that are date fields

    var search = tableScreen.search || ""
    const searchRegex = new RegExp(search, "si");
    const searchRegexNoSpace = new RegExp(search.replace(/\s/g, ''), "si");

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
            var today = moment(value[0]).startOf('day').toDate()
            var endDate = moment(value[0]).endOf('day').toDate()

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

      if (order == 'ascending') {
        order = 1
      } else {
        order = -1
      }

      sorter = { [field]: order }
    }

    if (doesSorterExist != true) {
      sorter = { ["status"]: 1 }
    }

    // console.log("filter", filter)
    // console.log("sorter", sorter)

    await Campaign.aggregate([
      {
        $lookup: {
          from: "accounts_infos",
          localField: "suggestor",
          foreignField: "_id",
          as: "suggestor_docs"
        }
      },
      {
        $unwind: "$suggestor_docs"
      },
      {
        $project: {
          "suggestor_docs.first_name": 1,
          "suggestor_docs.last_name": 1,
          "suggestor_docs.full_name": { $concat: ["$suggestor_docs.first_name", " ", "$suggestor_docs.last_name"] },
          "suggestor_docs.full_name_no_space": {
            $replaceAll: {
              input: { $concat: ["$suggestor_docs.first_name", "$suggestor_docs.last_name"] },
              find: " ",
              replacement: ""
            }
          },
          "suggestor_docs.profileLogo": 1,
          "suggestor_docs.profileUrl": 1,
          "suggestor_docs.email": 1,
          title: 1,
          organization: 1,
          category: 1,
          description: 1,
          status: 1,
          starting_date: 1,
          participantCounter: 1,
          likeCounter: 1,
          images: 1
        },
      },
      {
        $match: {
          $and: [
            filter,
            {
              $or: [
                {
                  "suggestor_docs.first_name": {
                    $regex: searchRegex
                  }
                },
                {
                  "suggestor_docs.last_name": {
                    $regex: searchRegex
                  }
                },
                {
                  "suggestor_docs.full_name": {
                    $regex: searchRegex
                  }
                },
                {
                  "suggestor_docs.email": {
                    $regex: searchRegexNoSpace
                  }
                },
                {
                  "suggestor_docs.full_name_no_space": {
                    $regex: searchRegex
                  }
                },
                {
                  title: {
                    $regex: searchRegex
                  }
                }
              ],
            },
          ]
        }
      },
      {
        $sort: sorter
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 }
              }
            }
          ],
          groups: [
            { $skip: page * pageSize },
            { $limit: pageSize },
          ]
        }
      }
    ], { collation: { locale: "en_US", strength: 2 } })
      .then(async (result) => {
        var list = result[0]?.groups;
        var total = result[0]?.summary[0]?.total;

        res.json({ list, total });
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.getPublishedPage = async (req, res) => {
  try {
    var values = req.body.values;
    var page = parseInt(values.page) - 1;
    var pageSize = parseInt(values.pageSize);
    var organization_id = values.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);

    var tableScreen = values.tableScreen

    var tableScreenLength = Object.keys(tableScreen).length
    var sorter = {}
    var filter = { organization: organization_id };
    var doesFilterExist = tableScreen.hasOwnProperty("filter")
    var doesSorterExist = tableScreen.hasOwnProperty("sorter")
    var numberKeys = ["participantCounter", "likeCounter"] // put here keys that are number fields
    var dateKeys = ["starting_date"] // put here keys that are date fields

    var search = tableScreen.search || ""
    const searchRegex = new RegExp(search, "si");
    const searchRegexNoSpace = new RegExp(search.replace(/\s/g, ''), "si");

    if (doesFilterExist != false) {
      var tempFilter = tableScreen.filter
      var isKeyNumber = false
      var isKeyDate = false

      for (const [key, value] of Object.entries(tempFilter)) {
        if (value != null) {
          isKeyNumber = numberKeys.includes(key)
          isKeyDate = dateKeys.includes(key)

          if (isKeyNumber == true) {
            filter = { ...filter, [key]: value[0] }
          }

          if (isKeyDate == true) {
            var today = moment(value[0]).startOf('day').toDate()
            var endDate = moment(value[0]).endOf('day').toDate()

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

      if (order == 'ascending') {
        order = 1
      } else {
        order = -1
      }

      sorter = { [field]: order }
    }

    if (doesSorterExist != true) {
      sorter = { ["status"]: 1 }
    }

    // console.log("filter", filter)
    // console.log("sorter", sorter)

    await Campaign.aggregate([
      {
        $lookup: {
          from: "accounts_infos",
          localField: "publisher",
          foreignField: "_id",
          as: "publisher_docs"
        }
      },
      {
        $unwind: "$publisher_docs"
      },
      {
        $project: {
          "publisher_docs.first_name": 1,
          "publisher_docs.last_name": 1,
          "publisher_docs.full_name": { $concat: ["$publisher_docs.first_name", " ", "$publisher_docs.last_name"] },
          "publisher_docs.full_name_no_space": {
            $replaceAll: {
              input: { $concat: ["$publisher_docs.first_name", "$publisher_docs.last_name"] },
              find: " ",
              replacement: ""
            }
          },
          "publisher_docs.profileLogo": 1,
          "publisher_docs.profileUrl": 1,
          "publisher_docs.email": 1,
          title: 1,
          organization: 1,
          category: 1,
          description: 1,
          status: 1,
          starting_date: 1,
          participantCounter: 1,
          likeCounter: 1,
          images: 1
        },
      },
      {
        $match: {
          $and: [
            filter,
            {
              $or: [
                {
                  "publisher_docs.first_name": {
                    $regex: searchRegex
                  }
                },
                {
                  "publisher_docs.last_name": {
                    $regex: searchRegex
                  }
                },
                {
                  "publisher_docs.full_name": {
                    $regex: searchRegex
                  }
                },
                {
                  "publisher_docs.full_name_no_space": {
                    $regex: searchRegexNoSpace
                  }
                },
                {
                  "publisher_docs.email": {
                    $regex: searchRegex
                  }
                },
                {
                  title: {
                    $regex: searchRegex
                  }
                }
              ],
            },
          ]
        }
      },
      {
        $sort: sorter
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 }
              }
            }
          ],
          groups: [
            { $skip: page * pageSize },
            { $limit: pageSize },
          ]
        }
      }
    ], { collation: { locale: "en_US", strength: 2 } })
      .then(async (result) => {
        var list = result[0]?.groups;
        var total = result[0]?.summary[0]?.total;

        res.json({ list, total });
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

  const landingPage = req.query.landingPage;
  var filter = {};

  var userAuthId = req.user.auth_id
  var user = await Account.findOne({ uuid: userAuthId }, "_id")
  var userId = user._id

  switch (landingPage) {
    case "homepage":
      filter = { status: "Approved" };
      break;

    case "suggestion":
      filter = { suggestor: userId }
      break;

    case "barangay":
      var orgId = req.query.orgId
      filter = { organization: orgId, status: "Approved" }
      break;

    case "likes":
      filter = { likes: userId, status: "Approved" }
      break;

    default:
      break;
  }

  try {
    await Campaign
      .find(filter)
      .skip(page * pageSize)
      .limit(pageSize)
      .collation({ locale: "en" })
      .populate("suggestor",)
      .populate("publisher", populatePeople)
      .populate("organization", populateOrg)
      .sort(sorter)
      .then((result) => {
        var newResults = result.map((data) => {
          var temp = Object.assign({}, data);
          // temp._doc.starting_date = moment(new Date(data.starting_date))
          temp._doc.isLike = data.likes.includes(userId)
          temp._doc.isParticipant = data.participants.includes(userId)
          return temp._doc;
        });

        res.json(newResults)
      })
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.getTrendingCampaigns = async (req, res) => {
  var length = req.query.length

  try {
    const campaign = await Campaign.find({
      status: "Approved",
      starting_date: { $gte: moment().startOf("day").toDate() }
    })
      .populate("publisher")
      .sort({ participantCounter: -1 })
      .limit(length)

    return res.json(campaign);
  } catch (error) {
    return res.json([]);
  }
};

exports.getCampaignUserId = async (req, res) => {
  try {
    const userAuthId = req.user.auth_id
    const user = await Account.findOne({ uuid: userAuthId }, "_id")
    const userId = user._id
    res.json(userId)
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
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
    { title: { $regex: search, $options: "i" } },
  ];
  try {
    const Campaigns = await Campaign.find({
      status: "Approved",
      $or: filterSearch,
    })
      .skip(start)
      .select(
        "_id, organization , description , starting_date , status , category , images , title"
      )
      .limit(result)
      .sort({ createdAt: -1 })
      .populate({
        path: "organization",
        model: "organizations",
        select: ["_id", "organization_name", "profile", "address"],
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

    var userAuthId = req.user.auth_id
    var user = await Account.findOne({ uuid: userAuthId }, "_id")
    var userId = user._id

    await Campaign.findOne({
      organization_id: organization_id,
      _id: campaign_id,
    })
      .populate("suggestor", populatePeople)
      .populate("publisher", populatePeople)
      .populate("organization", populateOrg)
      .then((result) => {
        var temp = Object.assign({}, result);
        temp._doc.isLike = result.likes.includes(userId)
        temp._doc.isParticipant = result.participants.includes(userId)
        var newResult = temp._doc

        res.json(newResult)

      })
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

exports.addCampaign = async (req, res) => {
  var newCampaignData = req.body.values;
  newCampaignData._id = new mongoose.Types.ObjectId();

  var hasPublisher = newCampaignData.hasOwnProperty("publisher");
  var hasSuggestor = newCampaignData.hasOwnProperty("suggestor");

  if (!hasPublisher || !hasSuggestor) {
    const userAuthId = req.user.auth_id;
    const user = await Account.findOne({ uuid: userAuthId }, "_id");
    const id = user._id;

    if (!hasPublisher) newCampaignData.publisher = id;
    if (!hasSuggestor) newCampaignData.suggestor = id;
  }

  try {
    const newCampaign = new Campaign(newCampaignData);
    const query = await newCampaign.save();

    const session = await RecordSession({
      organization_id: newCampaignData.organization,
      userAuthId: req.user.auth_id,
      message: "Created a campaign.",
      action: "Create",
      module: "Campaign",
    })

    Promise.all([query, session])
    .then((values) => {
      res.json(values[0]);
    });


  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.addCampaignSuggestion = async (req, res) => {
  var newCampaignData = req.body.values;
  newCampaignData._id = new mongoose.Types.ObjectId();
  newCampaignData.organization = newCampaignData.organization_id;

  const userAuthId = req.user.auth_id;
  const user = await Account.findOne({ uuid: userAuthId }, "_id");
  const userId = user._id;
  newCampaignData.suggestor = userId;

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
  var oldStatus = req.body.oldStatus;
  var values = req.body.values;
  const _id = values.campaign_id;

  const publisherUuid = req.user.auth_id
  const user = await Account.findOne({ uuid: publisherUuid }, "_id");
  const id = user._id;

  values.publisher = id;

  try {
    await Campaign.updateOne({ _id }, values).then(async () => {
      if (oldStatus != values.status) {

        const suggestor = await Account.findOne({ _id: values.suggestor }, "uuid");
        var userAuthId = suggestor.uuid

        await sendNotif(values, userAuthId)

        if (values.suggestor != values.publisher) {
          sendEmail(values)
        }
      }

      await RecordSession({
        organization_id: values.organization,
        userAuthId: req.user.auth_id,
        message: "Edited a campaign.",
        action: "Edit",
        module: "Campaign",
      })
      res.json("updated");
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

const sendNotif = async (values, userAuthId) => {
  try {
    await NotificationMiddleware.notificationDocument({
      organization_id: values.organization,
      message: `Your suggested camapaign status has been change to "${values.status}"`,
      user_id: values.suggestor,
      uuid: userAuthId,
      is_read: false, // default
      type: "campaign",
      link: `/home/posts/${values.organization}/${values.campaign_id}/single/data`,
    });
  } catch (error) {
    throw error
  }
}

const sendEmail = async (values) => {
  try {
    const getSender = await Account.findOne({ _id: values.publisher }, "_id first_name last_name email");
    const getReceiver = await Account.findOne({ _id: values.suggestor }, "_id first_name last_name email");
    const getOrg = await Organization.findOne({ _id: values.organization }, "_id organization_name");

    Promise.all([getSender, getReceiver, getOrg])
      .then(async ([sender, receiver, org]) => {

        await NodeMailer.sendMail({
          template: "templates/status/campaign/index.html",
          replacements: {
            receiver: `${receiver.first_name} ${receiver.last_name}`,
            sender_email: sender.email,
            sender: `${sender.first_name} ${sender.last_name}`,
            status: values.status,
            orgName: org.organization_name,
            link: `https://mitivelane-test.online/home/posts/${values.organization}/${values.campaign_id}/single/data`
          },
          from: "Mitivelane Team<testmitivelane@gmail.com>",
          to: "gcmediavillo@gmail.com",
          subject: "Your Suggested Campaign status has been changed"
        })
      })
  } catch (error) {
    throw error
  }
}

exports.updateCampaignStatus = async (req, res) => {
  var values = req.body.values;
  var type = req.body.type
  var operation = req.body.operation
  var _id = req.body.campaignId
  // const _id = values.campaign_id;

  var userAuthId = req.user.auth_id
  var user = await Account.findOne({ uuid: userAuthId }, "_id")
  var userId = user._id

  try {
    if (type == "like") {
      if (operation == "increment") {
        var UpdateCampaignQuery = await Campaign.updateOne({ _id }, { $set: values, $addToSet: { likes: userId } })
      }

      if (operation == "decrement") {
        var UpdateCampaignQuery = await Campaign.updateOne({ _id }, { $set: values, $pullAll: { likes: [userId] } })
      }
    }

    if (type == "participant") {
      if (operation == "increment") {
        populateOrg
        var UpdateCampaignQuery = await Campaign.updateOne({ _id }, { $set: values, $addToSet: { participants: userId } })
      }

      if (operation == "decrement") {
        var UpdateCampaignQuery = await Campaign.updateOne({ _id }, { $set: values, $pullAll: { participants: [userId] } })
      }
    }

    Promise.all([UpdateCampaignQuery])
      .then((result) => {
        // console.log("result", result)
        res.json("updated");
      })

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.deleteCampaign = async (req, res) => {
  var values = req.body.values;
  const deleteList = values.deleteList;
  const total = deleteList.length

  try {
    await Campaign.deleteMany({ _id: deleteList })
      .then(async () => {
        await RecordSession({
          organization_id: values.organization_id,
          userAuthId: req.user.auth_id,
          message: `Deleted ${total} campaign/s.`,
          action: "Delete",
          module: "Campaign"
        })

        res.json("deleted");
      });

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};
