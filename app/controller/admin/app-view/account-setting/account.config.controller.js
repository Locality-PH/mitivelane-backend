const db = require("../../../../models");
var mongoose = require("mongoose");

const Account = db.account;

exports.updateAccount = async (req, res) => {
  try {
    let data = {};
    if (req.body.profile_url && req.body.profile_url !== "") {
      data = {
        full_name: req.body.full_name,
        profileUrl: {
          contentType: req.body.mime_type,
          data: req.body.profile_url,
        },
      };
    } else {
      data = {
        full_name: req.body.full_name,
      };
    }

    await Account.findOneAndUpdate(
      {
        uuid: req.user.auth_id,
      },
      {
        $set: data,
      },
      { new: true }
    );

    return res.status(200).json(req.body);
  } catch (error) {
    return res.status(400).json("Error: " + error);
  }
};

exports.updateAccountTest = async (req, res) => {
  try {
    let data = {};
    if (req.body.profile_url && req.body.profile_url !== "") {
      const mimeType = req.body.profile_url.match(
        /[^:]\w+\/[\w-+\d.]+(?=;|,)/
      )[0];
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

    await Account.findOneAndUpdate(
      {
        uuid: req.user.auth_id,
      },
      {
        $set: data,
      },
      { new: true }
    );

    return res.json(req.body);
  } catch (error) {
    return res.json("Error: " + error);
  }
};
exports.getDetailsAll = async (req, res) => {
  try {
    const organization = await Account.find({ uuid: req.body.auth_id })
      .select({
        address: 2,
        address2: 2,
        mobile: 2,
        city: 2,
        postal: 2,
        country: 1,
        _id: 0,
      })
      .limit(1);

    return res.json({
      country: organization[0].country,
      address: organization[0].address,
      address2: organization[0].address2,
      phone_number: organization[0].mobile,
      city: organization[0].city,
      postal: organization[0].postal,
    });
  } catch (error) {
    return res.json("Error: " + error);
  }
};
exports.getDetails = async (req, res) => {
  try {
    const organization = await Account.find({ uuid: req.body.auth_id })
      .select({ full_name: 1, _id: 0 })
      .limit(1);

    return res.json({
      full_name: organization[0].full_name,
    });
  } catch (error) {
    return res.json("Error: " + error);
  }
};

exports.getSession = async (req, res) => {
  try {
    const organization = await Account.find({ uuid: req.body.auth_id })
      .select({
        full_name: 2,
        //  sessions: { $slice: [0, req.body.limit] },
        sessions: 1,
        _id: 0,
      })
      .limit(1);

    const session = organization[0].sessions.map((item) => {
      return {
        host: item.host,
        country: item.country,
        city: item.city,
        os: item.os,
        browser: item.browser,
        active: item.access_token,
        _id: item._id,
        date: item.date,
      };
    });

    return res.json({
      full_name: organization[0].full_name,
      session: session.reverse(),
    });
  } catch (error) {
    return res.json("Error: " + error);
  }
};
exports.removeSession = async (req, res) => {
  try {
    if (!req.session_token) {
      return res.sendStatus(404);
    }

    const session_id = req.body.session_id;

    await Account.findOneAndUpdate(
      { uuid: req.user.auth_id },
      {
        $pull: {
          sessions: {
            _id: session_id,
          },
        },
      },
      { new: true, multi: true }
    );

    return res.json("Deleted successful");
  } catch (error) {
    return res.json("Error: " + error);
  }
};
