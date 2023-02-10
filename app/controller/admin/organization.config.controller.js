const db = require("../../models");
var mongoose = require("mongoose");

const Account = db.account;

exports.getOrganizationList = (req, res) => {
  //console.log(req.params.organization_id);
  Account.find({ uuid: req.params.auth_id })
    .select({ first_time: 2, organizations: 1, _id: 0 })
    .populate({
      path: "organizations",
      model: "organizations",
      select: ["_id", "organization_name"],
    })
    .populate({
      path: "members",
      model: "organization_members",
      select: ["_id", "organization_id"],
    })
    .then((organization) => {
      //console.log(organization);
      console.log(organization);
    });
};
exports.getPreOrganizationList = (req, res) => {
  Account.find({ uuid: req.params.auth_id })
    .select({
      first_name: 4,
      last_name: 3,
      first_time: 2,
      organizations: 1,
      _id: 0,
    })
    .populate({
      path: "organizations",
      model: "organizations",
      select: ["_id", "organization_name"],
    })
    .populate({
      path: "members",
      model: "organization_members",
      select: ["_id", "organization_id"],
    })
    .then((organization) => {
      res.json(organization);
    })
    .catch((err) => res.status(400).json("Error: " + err));
};

exports.testToken = (req, res) => {
  //console.log("body", req.body)
  //console.log("user", req.user)

  if (req.body.fname === req.user.auth_id) {
    res.json({ body: req.body, user: req.user });
  } else {
    res.sendStatus(401);
  }
};
