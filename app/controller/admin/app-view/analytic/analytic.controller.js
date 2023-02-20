const db = require("../../../../models");
const Analytic = db.analytics;
const SessionDuration = db.session_duration;
const Visitor = db.visitor;

var mongoose = require("mongoose");

const Account = db.account;

exports.createAnalytic = async (req, res) => {
  const session_duration_id = mongoose.Types.ObjectId();
  console.log(req.body);
  const sessionDuration = await SessionDuration({
    duration: req.body.duration,
    _id: session_duration_id,
    organization_id: req.body.organization_id,
    uuid: req.user.auth_id,
  });
  sessionDuration.save();

  Promise.all([sessionDuration]).then(() => {
    res.json("success");
  });
  //console.log(req.params.organization_id);
};
exports.getAnalytic = async (req, res) => {
  const now = new Date();
  const twelveDaysAgo = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000);

  const getData = await SessionDuration.find({
    organization_id: req.user.auth_organization,
    createdAt: { $gte: twelveDaysAgo },
  }).sort({ createdAt: -1 });
  Promise.all([getData]).then(() => {
    res.json(getData);
  });
  //console.log(req.params.organization_id);
};
