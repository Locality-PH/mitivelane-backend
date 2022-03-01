const db = require("../../../../models");
var mongoose = require("mongoose");

const Account = db.account;

exports.updateAccount = (req, res) => {
  // Account.findOneAndUpdate(
  //   {
  //     uuid: req.body.auth_id,
  //   },
  //   {
  //     $push: {
  //       members: [barangayMemberId],
  //       barangays: [barangayId],
  //     },
  //     $set: {
  //       first_name: req.body.first_name,
  //       last_name: req.body.last_name,
  //       middle_name: req.body.middle_name,
  //       birthday: req.body.birthday,
  //       gender: req.body.gender,
  //       civil_status: req.body.civil_status,
  //       country: req.body.personal_country,
  //       province: req.body.personal_province,
  //       municipality: req.body.personal_municipality,
  //       mobile: req.body.mobile_number,
  //       telephone: req.body.telephone_number,
  //       address: req.body.personal_address,
  //       first_time: req.body.first_time,
  //     },
  //   },
  //   { new: true },
  //   (err, doc) => {
  //     if (err) {
  //       res.status(400).json("Error: " + err);
  //     }
  //     const currentActive = [
  //       {
  //         barangay_id: barangayId,
  //         barangay_member_id: barangayMemberId,
  //         uuid: req.body.auth_id,
  //       },
  //     ];
  //     console.log(doc);
  //     res.status(200).json(currentActive);
  //   }
  // );
  res.json(req.body);
};
exports.getSession = (req, res) => {
  let data = [];
  Account.find({ uuid: req.body.auth_id })
    .select({ sessions: 1, _id: 0 })
    .then((barangay) => {
      barangay[0].sessions.map((item) => {
        data.push({
          host: item.host,
          country: item.country,
          city: item.city,
          os: item.os,
          browser: item.browser,
          active: item.access_token,
          _id: item._id,
          date: item.date,
        });
      });
      data = [].concat.apply([], data);

      //console.log(data);
      res.json(data);
    })
    .catch((err) => res.status(400).json("Error: " + err));
};
