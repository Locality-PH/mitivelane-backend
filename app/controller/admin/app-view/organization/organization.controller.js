const db = require("../../../../models");
const Organization = db.organization;
const OrganizationRequest = db.organization_request;
const Account = db.account;
const OrganizationMember = db.organizationMember;
var mongoose = require("mongoose");
const { organizationMember } = require("../../../../models");

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

exports.getOrganizationMembers = async (req, res) => {
  try {
    const organizationId = req.params.organization_id;
    const organization = await Organization.findOne({
      _id: organizationId,
    }).populate("organization_member");

    const organizationMembers = organization.organization_member

    return res.json(organizationMembers);
  } catch (error) {
    return res.json([]);
  }
};

exports.getOrganizationOwner = async (req, res) => {
  try {
    const organizationId = req.params.organization_id;
    const uuid = req.params.uuid

    const organization = await Organization.findOne({ _id: organizationId })
    const organizationMemberId = organization.organization_member[0]
    const organizationMember = await OrganizationMember.findOne({ _id: organizationMemberId })
    const ownerEmail = organizationMember.email

    const account = await Account.findOne({ email: ownerEmail });

    if (account.uuid == uuid) {
      return res.json(true)
    } else {
      return res.json(false)
    }

  } catch (error) {
    return res.json(false)
  }
};
