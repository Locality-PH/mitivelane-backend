const db = require("../../../../models");
const Notifications = db.notifications;
const Account = db.account;

var mongoose = require("mongoose");

exports.getNotificationPrivateData = async (req, res) => {
  try {
    console.log(req.user.auth_id);
    const result = new Number(req.query.result);
    const start = new Number(req.query.start);
    console.log(start, result);
    const getRequest = await Notifications.find({
      uuid: req.user.auth_id,
      $and: [{ is_read: false }],
    })
      .skip(start)
      .limit(result)
      .sort({ createdAt: -1 })
      .populate({
        path: "organization_id",
        model: "organizations",
        select: ["_id", "organization_name", "profile"],
      });
    const count = await Notifications.countDocuments({
      uuid: req.user.auth_id,
      $and: [{ is_read: false }],
    });

    Promise.all([getRequest, count]).then(() => {
      res.set("x-total-count", count);
      return res.json(getRequest);
    });
  } catch (err) {
    return res.json(err);
  }
};

exports.updateNotificationPrivateDataNotification = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).send({ Error: "something went wrong" });
    }
    const updateNotification = await Notifications.updateMany(
      {
        _id: { $in: req.body.notification_id },
        uuid: req.user.auth_id,
      },
      {
        $set: {
          is_read: true,
        },
      }
    );
    Promise.all([updateNotification]).then(() => {
      return res.json("success");
    });
  } catch (err) {
    return res.json(err);
  }
};
