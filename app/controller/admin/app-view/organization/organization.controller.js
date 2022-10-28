const db = require("../../../../models");
const Organization = db.organization
const OrganizationRequest = db.organization_request
const Account = db.account
const OrganizationMember = db.organizationMember
var mongoose = require("mongoose");

exports.getAllOrganizations = async (req, res) => {
  console.log("Requested in Get All organizations")
  try {
    const organization = await Organization.find({})

    return res.json(organization)

  }
  catch (error) {
    return res.json([]);
  }
};

exports.getLatestOrganizations = async (req, res) => {
  const limit = 5;

  try {
    const organization = await Organization.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
    // .populate("reporters");

    return res.json(organization);
  } catch (error) {
    return res.json([]);
  }
};
