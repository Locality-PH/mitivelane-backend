const db = require("../../../../models");
var mongoose = require("mongoose");
var moment = require("moment");
const { query } = require("express");
const Session = db.session;
const Account = db.account;

exports.getAuditPage = async (req, res) => {
  try {
    var data = req.body
    var today = moment().endOf('day')
    var dateFilter = data.dateFilter != undefined ? moment(data.dateFilter).endOf('day') : today
    var sortFilter = data.sortFilter != undefined ? data.sortFilter.toLowerCase() : "desc"
    var fieldFilter = data.fieldFilter != undefined ? data.fieldFilter : ""
    var page = parseInt(data.currentPage) - 1;
    var pageSize = parseInt(data.pageSize);
    var organization_id = data.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);

    var filter = {
      organization_id,
      module:  { $regex: fieldFilter, $options: "i" },
      createdAt: {
        $lte: dateFilter
      }
    }

    var query1 = await Session
      .find(filter)
      .skip(page * pageSize)
      .limit(pageSize)
      .collation({ locale: "en" })
      .sort({ createdAt: sortFilter })
      .populate("account", ["first_name", "last_name", "profileLogo", "profileUrl"]);
    var query2 = Session.countDocuments(filter)

    Promise.all([query1, query2])
      .then(([list, total]) => {
        res.json({ list, total });
      })

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.addSession = async (req, res) => {
  try {
    const newSessionData = req.body.values
    newSessionData._id = new mongoose.Types.ObjectId();
    newSessionData.organization_id = mongoose.Types.ObjectId(
      req.body.organization_id
    );

    const userAuthId = req.user.auth_id

    await Account.findOne({ uuid: userAuthId }, "_id")
      .then(async (res) => {
        let userId = res._id
        newSessionData.account = userId

        const newSession = new Session(newSessionData);
        console.log(newSession);
        await newSession.save();
      })


  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

