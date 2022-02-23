const db = require("../../../../models");
var mongoose = require("mongoose");

const Account = db.account;

exports.updateAccount = (req, res) => {
  res.json(req.body);
};
