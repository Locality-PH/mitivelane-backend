const db = require("../../../../models");
var mongoose = require("mongoose");
var moment = require("moment");
const Session = db.session;

exports.getAuditPage = async (req, res) => {
  try {
    console.log("req.body", req.body)
    var dateFilter = moment(req.body.dateFilter).startOf('day')
    var page = parseInt(req.body.currentPage) - 1;
    var pageSize = parseInt(req.body.pageSize);
    var organization_id = req.body.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);

    var filter = {
      organization_id,
      createdAt: {
        $lte: dateFilter
      }
    }

    console.log("dateFilter", dateFilter)
    console.log("filter", filter)

    await Session
      .find(filter)
      // .skip(page * pageSize)
      // .limit(pageSize)
      .then(async (result) => {
        var list = result
        await Session.countDocuments(filter)
          .then((result) => {
            var total = result
            res.json({ list, total });
            console.log("list", list)
            console.log("total", total)
          });
      })

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.addSession = async (req, res) => {
  const newSessionData = req.body.values;
  newSessionData._id = new mongoose.Types.ObjectId();
  newSessionData.organization_id = mongoose.Types.ObjectId(
    req.body.organization_id
  );

  try {
    const newSession = new Session(newSessionData);
    console.log(newSession);
    await newSession.save();
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

exports.test = async (req, res) => {
  console.log("test")
  res.json("test")
};

