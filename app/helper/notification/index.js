const db = require("../../models");
const CertificateRequest = db.certificates_request;

const Organization = db.organization;
const OrganizationNotifications = db.notifications;
const OrganizationMember = db.organizationMember;
var mongoose = require("mongoose");
const NodeMailer = require("../../nodemailer/index.js");

exports.notificationDocument = async (props) => {
  const { organization_id, user_id, message, uuid, type, link } = props;
  try {
    const noti_id = new mongoose.Types.ObjectId();

    const data = {
      _id: noti_id,
      type: type,
      organization_id: organization_id,
      message: message,
      user_id: user_id,
      uuid: uuid,
      is_read: false,
      link: link,
    };
    console.log("saving notification")
    console.log("props", props)
    const notificationData = await new OrganizationNotifications(data);
    notificationData.save();
  } catch (error) {
    console.log(error);
  }
};
