const db = require("../../../../models");
var mongoose = require("mongoose");

const Account = db.account;

exports.updateAccount = async (req, res) => {
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
        return res.json("Error: " + err);
      }
      return res.json(req.body);
    }
  );
};

exports.getDetails = async (req, res) => {
  await Account.find({ uuid: req.body.auth_id })
    .select({ full_name: 1, _id: 0 })
    .then((organization) => {
      return res.json({
        full_name: organization[0].full_name,
      });
    })
    .catch((err) => {
      return res.json("Error: " + err);
    });
};
exports.getSession = async (req, res) => {
  let session = [];
  Account.find({ uuid: req.body.auth_id })
    .select({
      full_name: 2,
      //  sessions: { $slice: [0, req.body.limit] },
      sessions: 1,
      _id: 0,
    })
    .limit(1)
    .then((organization) => {
      console.log(organization);
      organization[0].sessions.map((item) => {
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

      return res.json({
        full_name: organization[0].full_name,
        session: session.reverse(),
      });
    })
    .catch((err) => {
      return res.json("Error: " + err);
    });
};
exports.removeSession = async (req, res) => {
  if (req.session_token) return res.sendStatus(404);
  const session_id = req.body.session_id;

  Account.findOneAndUpdate(
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
    .then((_) => {
      return res.json("Deleted successful");
    })
    .catch((err) => {
      return res.json("Error: " + err);
    });
};
