const db = require("../../models");
var mongoose = require("mongoose");

const Account = db.account;

exports.getBarangayList = (req, res) => {
  console.log(req.params.barangay_id);
  Account.find({ uuid: req.params.auth_id })
    .populate({ path: "barangays", model: "barangays" })
    .then((barangay) => res.json(barangay))
    .catch((err) => res.status(400).json("Error: " + err));
};
