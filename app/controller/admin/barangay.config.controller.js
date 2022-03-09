const db = require("../../models");
var mongoose = require("mongoose");

const Account = db.account;

exports.getBarangayList = (req, res) => {
  //console.log(req.params.barangay_id);
  Account.find({ uuid: req.params.auth_id })
    .select({ first_time: 2, barangays: 1, _id: 0 })
    .populate({
      path: "barangays",
      model: "barangays",
      select: ["_id", "barangay_name"],
    })
    .populate({
      path: "members",
      model: "barangay_members",
      select: ["_id", "barangay_id"],
    })
    .then((barangay) => {
      //console.log(barangay);
      return res.json(barangay);
    })
    .catch((err) => {
      return res.status(400).json("Error: " + err);
    });
};
exports.getPreBarangayList = (req, res) => {
  Account.find({ uuid: req.params.auth_id })
    .select({
      first_name: 4,
      last_name: 3,
      first_time: 2,
      barangays: 1,
      _id: 0,
    })
    .populate({
      path: "barangays",
      model: "barangays",
      select: ["_id", "barangay_name"],
    })
    .populate({
      path: "members",
      model: "barangay_members",
      select: ["_id", "barangay_id"],
    })
    .then((barangay) => {
      res.json(barangay);
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
