const db = require("../../models");
var mongoose = require("mongoose");
const BarangayMember = db.barangayMember;
const Account = db.account;

exports.registerUser = async (req, res) => {
  var id = new mongoose.Types.ObjectId();
  if (!req.body.email && req.body.uuid) {
    res.status(400).send({ message: "email or password can not be empty!" });
    return;
  }

  console.log(id);
  const users = new Account({
    _id: id,
    uuid: req.body.uuid,
    email: req.body.email,
  });

  await users
    .save(users)
    .then(async (_) => {
      if (req.body.invitation_link) {
        await BarangayMember.find({ _id: id })
          .then((user) => res.json("invite"))
          .catch((err) => res.status(400).json("Error: " + err));
      } else {
        res.json("account created");
        return;
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Tutorial.",
      });
    });
};
exports.loginUser = async (req, res) => {
  Account.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err));
};
