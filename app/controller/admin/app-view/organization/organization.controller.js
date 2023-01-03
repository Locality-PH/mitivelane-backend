const db = require("../../../../models");
const Organization = db.organization;
const OrganizationRequest = db.organization_request;
const Account = db.account;
const OrganizationMember = db.organizationMember;
var mongoose = require("mongoose");

exports.getAllOrganizations = async (req, res) => {
  try {
    const organization = await Organization.find({});

    return res.json(organization);
  } catch (error) {
    return res.json([]);
  }
};

exports.getLatestOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find({})
      .sort({ createdAt: -1 })
      .limit(5);
    // .populate("reporters");

    return res.json(organizations);
  } catch (error) {
    return res.json([]);
  }
};
exports.getOrganization = async (req, res) => {
  try {
    const organizationId = req.params.organization_id;
    const organization = await Organization.findOne({
      _id: organizationId,
    }).populate("organization_member");

    return res.json(organization || []);
  } catch (error) {
    return res.json([]);
  }
};
