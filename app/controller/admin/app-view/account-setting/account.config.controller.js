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
    return res.status(400).json("Error: " + error.message);
  }
};

exports.updateAccountAll = async (req, res) => {
  try {
    await Account.findOneAndUpdate(
      {
        uuid: req.user.auth_id,
      },
      {
        $set: {
          country: req.body.country,
          address: req.body.address,
          address2: req.body.address2,
          mobile: req.body.phone_number,
          city: req.body.city,
          postal: req.body.postal,
        },
      },
      { new: true }
    );

    return res.status(200).json("Billing updated successfully");
  } catch (error) {
    return res.status(400).json("Error: " + error.message);
  }
};
// To be Deleted
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
        address: 6,
        address2: 5,
        mobile: 4,
        city: 3,
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
    const organization = await Account.find({ uuid: req.user.auth_id })
      .select({ full_name: 2, profileUrl: 1, _id: 0 })
      .limit(1);
    return res.json({
      full_name: organization[0].full_name,
      profile_url: organization[0].profileUrl.data,
    });
  } catch (error) {
    return res.json("Error: " + error);
  }
};

exports.getDetailsUser = async (req, res) => {
  try {
    const organization = await Account.find({ uuid: req.params.id })
      .select({ profileLogo: 2, profileUrl: 1, _id: 0 })
      .limit(1);
    return res.json({
      profile_url: organization[0].profileUrl.data,
      profile_color: organization[0].profileLogo,
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
    if (req.body.session_token) {
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
