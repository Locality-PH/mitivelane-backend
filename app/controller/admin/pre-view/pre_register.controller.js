const db = require("../../../models");
var mongoose = require("mongoose");

const Barangay = db.barangay;
const BarangayMember = db.barangayMember;
const Account = db.account;

exports.registerBarangay = (req, res) => {
  var barangayId = new mongoose.Types.ObjectId();
  if (!req.body.barangay_name) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  console.log(barangayId);
  const barangay = new Barangay({
    _id: barangayId,
    barangay_name: req.body.barangay_name,
  });
  barangay
    .save(barangay)
    .then((_) => {
      res.json("Barangay added!");
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Barangay.",
      });
    });
};
exports.registerBarangayMember = (req, res) => {
  var barangayMemberId = new mongoose.Types.ObjectId();

  const barangayMember = new BarangayMember({
    _id: barangayMemberId,
    barangay_name: req.body.barangay_name,
    barangay_id: req.body.barangay_id,
    name: req.body.name,
    email: req.body.email,
    role: "Administrator",
  });
  barangayMember
    .save(barangayMember)
    .then((_) => {
      Barangay.findByIdAndUpdate(req.body.barangay_id)
        .then((barangay) => {
          barangay.barangay_member.push(barangayMemberId),
            barangay
              .save()
              .then(() => res.json("Barangay updated!"))
              .catch((err) => res.status(400).json("Error: " + err));
        })
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Tutorial.",
      });
    });
};
exports.insertdata = (req, res) => {
  Barangay.findByIdAndUpdate(req.body.barangay_id)
    .then((barang) => {
      (barang.barangay_member = [req.body.member_id]),
        exercise
          .save()
          .then(() => res.json("Exercise updated!"))
          .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
};

exports.list = (req, res) => {
  console.log(req.params.barangay_id);
  Barangay.find({ _id: req.params.barangay_id })
    .populate({ path: "barangay_member", model: "barangay_members" })
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err));
};

exports.createBarangay = (req, res) => {
  var barangayId = new mongoose.Types.ObjectId();
  var barangayMemberId = new mongoose.Types.ObjectId();

  console.log(barangayId);
  const barangay = new Barangay({
    _id: barangayId,
    barangay_name: req.body.barangay_name,
  });
  barangay.save(barangay).then((_) => {
    const barangayMember = new BarangayMember({
      _id: barangayMemberId,
      barangay_id: barangayId,
      email: req.body.email,
      auth_id: req.body.auth_id,
      role: "Administrator",
    });

    barangayMember
      .save(barangayMember)
      .then((_) => {
        Barangay.findByIdAndUpdate(barangayId)
          .then((barangay) => {
            barangay.barangay_member.push(barangayMemberId),
              barangay
                .save()
                .then(() => {
                  Account.findOneAndUpdate(
                    { uuid: req.body.auth_id },
                    {
                      $push: {
                        members: [barangayMemberId],
                        barangays: [barangayId],
                      },
                    },
                    { new: true },
                    (err, doc) => {
                      if (err) {
                        res.status(400).json("Error: " + err);
                      }
                      const currentActive = [
                        {
                          barangay_id: barangayId,
                          barangay_member_id: barangayMemberId,
                          uuid: req.body.auth_id,
                        },
                      ];
                      console.log(doc);
                      res.json(currentActive);
                    }
                  );
                })
                .catch((err) => res.status(400).json("Error: " + err));
          })
          .catch((err) => res.status(400).json("Error: " + err));
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Barangay.",
        });
      });
  });
};

exports.getBarangayList = (req, res) => {
  console.log(req.params.barangay_id);
  Account.find({ uuid: req.params.auth_id })
    .populate({ path: "barangays", model: "barangays" })
    .then((barangay) => res.json(barangay))
    .catch((err) => res.status(400).json("Error: " + err));
};
