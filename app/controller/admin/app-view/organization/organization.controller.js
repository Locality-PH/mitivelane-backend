const db = require("../../../../models");
const Organization = db.organization;
const OrganizationRequest = db.organization_request;
const Account = db.account;
const OrganizationMember = db.organizationMember;
var mongoose = require("mongoose");
const { organizationMember } = require("../../../../models");

exports.getAllOrganizations = async (req, res) => {
  const result = new Number(req.query.result);
  const start = new Number(req.query.start);
  const search = new String(req.query.q);
  console.log(search);
  const filterSearch = [
    { organization_name: { $regex: search, $options: "i" } },
    { province: { $regex: search, $options: "i" } },
    { country: { $regex: search, $options: "i" } },
    { phone_number: { $regex: search, $options: "i" } },
    { website: { $regex: search, $options: "i" } },
    { about: { $regex: search, $options: "i" } },
    { mission: { $regex: search, $options: "i" } },
    { vision: { $regex: search, $options: "i" } },
    { address: { $regex: search, $options: "i" } },
  ];
  try {
    const organization = await Organization.find({ $or: filterSearch })
      .skip(start)
      .limit(result)
      .sort({ createdAt: -1 });

    return res.json(organization);
  } catch (error) {
    return res.json([]);
  }
};

exports.getAllOrganizationsClient = async (req, res) => {
  try {
    const organization = await Organization.find({});

    return res.json(organization);
  } catch (error) {
    return res.json([]);
  }
};

exports.getLatestOrganizations = async (req, res) => {
  var length = req.query.length
  try {
    const organizations = await Organization.find({})
      .sort({ createdAt: -1 })
      .limit(length);
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

exports.getOrganizationClient = async (req, res) => {
  try {
    const organizationId = req.params.organization_id;
    const uuid = req.params.uuid;

    const organization = await Organization.findOne({
      _id: organizationId,
    }).populate("organization_member")

    const account = await Account.findOne({ uuid: uuid });

    organization.followers.map((value, i) => {
      if (value.toString() == account._id.toString()) {
        return res.json(true);
      }
    })


    return res.json(false);

  } catch (error) {
    console.log(error)
    return res.json(false);
  }
};

exports.getUserFollowing = async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const account = await Account.findOne({
      uuid: uuid,
    }).populate("follows");

    return res.json(account);
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

    const organizationMembers = organization.organization_member;

    return res.json(organizationMembers);
  } catch (error) {
    return res.json([]);
  }
};

exports.getOrganizationOwner = async (req, res) => {
  try {
    const organizationId = req.params.organization_id;
    const uuid = req.params.uuid;

    const organization = await Organization.findOne({ _id: organizationId });
    const organizationMemberId = organization.organization_member[0];
    const organizationMember = await OrganizationMember.findOne({
      _id: organizationMemberId,
    });
    const ownerEmail = organizationMember.email;

    const account = await Account.findOne({ email: ownerEmail });

    if (account.uuid == uuid) {
      return res.json(true);
    } else {
      return res.json(false);
    }
  } catch (error) {
    return res.json(false);
  }
};

exports.follow = async (req, res) => {
  const values = req.body;

  try {

    const account = await Account.findOne({ uuid: values.uuid });

    await Account.updateOne({ _id: account._id }, { $push: { follows: values.organization_id } })
    await Organization.updateOne({ _id: values.organization_id }, { $push: { followers: account._id } })

    return res.json("Success");
  } catch (error) {
    return res.json("Error");
  }
};

exports.unfollow = async (req, res) => {
  const values = req.body;

  try {
    const account = await Account.findOne({ uuid: values.uuid });

    await Account.updateOne({ _id: account._id }, { $pull: { follows: values.organization_id } })
    await Organization.updateOne({ _id: values.organization_id }, { $pull: { followers: account._id } })

    return res.json("Success");
  } catch (error) {
    return res.json("Error");
  }
};
