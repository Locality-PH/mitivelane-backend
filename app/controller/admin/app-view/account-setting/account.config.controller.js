const db = require("../../../../models");
var mongoose = require("mongoose");

const Account = db.account;

exports.updateAccount = (req, res) => {
  let mimeType;
  let data = {};
  if (!(req.body.profile_url == "")) {
    console.log("true");
    mimeType = req.body.profile_url.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
    data = {
      full_name: req.body.full_name,
      profileUrl: {
        contentType: mimeType,
        data: req.body.profile_url,
      },
    };
  } else {
    data = {
      full_name: req.body.full_name,
    };
  }
  Account.findOneAndUpdate(
    {
      uuid: req.user.auth_id,
    },
    {
      $set: data,
    },
    { new: true },
    (err, _) => {
      if (err) {
        return res.status(400).json("Error: " + err);
      }
      return res.json(req.body);
    }
  );
};

exports.getDetails = (req, res) => {
  Account.find({ uuid: req.body.auth_id })
    .select({ full_name: 1, _id: 0 })
    .then((barangay) => {
      return res.json({
        full_name: barangay[0].full_name,
      });
    })
    .catch((err) => {
      return res.status(400).json("Error: " + err);
    });
};
exports.getSession = (req, res) => {
  let session = [];
  Account.find({ uuid: req.body.auth_id })
    .select({ full_name: 2, sessions: 1, _id: 0 })
    .then((barangay) => {
      barangay[0].sessions.map((item) => {
        session.push({
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
      session = [].concat.apply([], session);

      //console.log(data);
      res.json({
        full_name: barangay[0].full_name,
        session: session.reverse(),
      });
    })
    .catch((err) => res.status(400).json("Error: " + err));
};
exports.removeSession = async (req, res) => {
  if (req.session_token) return res.sendStatus(404);
  const session_id = req.body.session_id;

  return await Account.findOneAndUpdate(
    { uuid: req.user.auth_id },
    {
      $pull: {
        sessions: {
          _id: session_id,
        },
      },
    },
    { new: true, multi: true }
  )
    .then((account) => res.json("Deleted successful"))
    .catch((err) => res.status(400).json("Error: " + err));
};
