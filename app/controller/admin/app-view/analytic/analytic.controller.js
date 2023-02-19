const db = require("../../../../models");
const Analytic = db.analytics;
const SessionDuration = db.session_duration;
const Visitor = db.visitor;

var mongoose = require("mongoose");

const Account = db.account;

exports.createAnalytic = async (req, res) => {
  const analytic_id = mongoose.Types.ObjectId();
  const visitor_id = mongoose.Types.ObjectId();
  const session_duration_id = mongoose.Types.ObjectId();

  const sessionDuration = await SessionDuration({
    duration: req.body.session_duration,
    _id: session_duration_id,
    organization_id: req.body.organization_id,
  });
  sessionDuration.save();
  const visitor = await Visitor({
    view: req.body.view,
    _id: visitor_id,
    organization_id: req.body.organization_id,
  });
  visitor.save();
  const analytic = await Analytic({
    view: req.body.view,
    _id: visitor_id,
    organization_id: req.body.organization_id,
    session_duration_id: session_duration_id,
    visitor_id: visitor_id,
  });
  analytic.save();

  Promise.all([sessionDuration, visitor, analytic]).then(() => {
    res.json("success");
  });
  //console.log(req.params.organization_id);
};
