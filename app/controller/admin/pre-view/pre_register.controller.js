const db = require("../../../models");
var mongoose = require("mongoose");

const Organization = db.organization;
const OrganizationMember = db.organizationMember;
const Account = db.account;

//Test Create Organization
exports.registerOrganization = (req, res) => {
  var organizationId = new mongoose.Types.ObjectId();
  if (!req.body.organization_name) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  console.log(organizationId);
  const organization = new Organization({
    _id: organizationId,
    organization_name: req.body.organization_name,
  });
  organization
    .save(organization)
    .then((_) => {
      res.json("Organization added!");
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Organization.",
      });
    });
};
exports.registerOrganizationMember = async (req, res) => {
  try {
    const organizationMemberId = new mongoose.Types.ObjectId();
    const organizationMember = new OrganizationMember({
      _id: organizationMemberId,
      organization_name: req.body.organization_name,
      organization_id: req.body.organization_id,
      name: req.body.name,
      email: req.body.email,
      role: "Administrator",
    });
    await organizationMember.save();

    const updatedOrganization = await Organization.findByIdAndUpdate(
      req.body.organization_id,
      { $push: { organization_member: organizationMemberId } },
      { new: true }
    );
    await updatedOrganization.save();

    return res.json("Organization updated!");
  } catch (error) {
    return res.status(500).send({
      message: error.message || "Some error occurred while creating the data.",
    });
  }
};
exports.insertdata = (req, res) => {
  Organization.findByIdAndUpdate(req.body.organization_id)
    .then((barang) => {
      (barang.organization_member = [req.body.member_id]),
        exercise
          .save()
          .then(() => res.json("Exercise updated!"))
          .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
};

exports.list = (req, res) => {
  console.log(req.params.organization_id);
  Organization.find({ _id: req.params.organization_id })
    .populate({ path: "organization_member", model: "organization_members" })
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err));
};

//Create Finalized Organization
exports.createOrganization = async (req, res) => {
  const organizationId = new mongoose.Types.ObjectId();
  const organizationMemberId = new mongoose.Types.ObjectId();
  try {
    // Create organization
    const organization = new Organization({
      _id: organizationId,
      organization_name: req.body.organization_name,
      country: req.body.country,
      province: req.body.province,
      municipality: req.body.municipality,
      address: req.body.address,
    });
    await organization.save();

    // Create organization member
    const organizationMember = new OrganizationMember({
      _id: organizationMemberId,
      organization_id: organizationId,
      email: req.body.email,
      auth_id: req.body.auth_id,
      role: "Administrator",
    });
    await organizationMember.save();

    // Update organization with organization member
    const updatedOrganization = await Organization.findByIdAndUpdate(
      organizationId,
      { $push: { organization_member: organizationMemberId } },
      { new: true }
    );
    await updatedOrganization.save();

    // Update account with organization and organization member
    await Account.findOneAndUpdate(
      { uuid: req.body.auth_id },
      {
        $push: {
          members: [organizationMemberId],
          organizations: [organizationId],
        },
        $set: {
          first_name: req.body.first_name,
          full_name: req.body.first_name + " " + req.body.last_name,
          last_name: req.body.last_name,
          middle_name: req.body.middle_name,
          birthday: req.body.birthday,
          gender: req.body.gender,
          civil_status: req.body.civil_status,
          country: req.body.personal_country,
          province: req.body.personal_province,
          municipality: req.body.personal_municipality,
          mobile: req.body.mobile_number,
          telephone: req.body.telephone_number,
          address: req.body.personal_address,
          first_time: req.body.first_time,
        },
      },
      { new: true }
    );

    const currentActive = [
      {
        organization_id: organizationId,
        organization_member_id: organizationMemberId,
        uuid: req.body.auth_id,
      },
    ];

    return res.status(200).json(currentActive);
  } catch (error) {
    // Delete created organization and organization member
    const orgData = Organization.findByIdAndDelete(organizationId);
    const orgMember = OrganizationMember.findByIdAndDelete(
      organizationMemberId
    );
    const accountData = Account.findOneAndUpdate(
      { uuid: req.user.auth_id },
      {
        $pull: {
          organizations: [organizationId],
          members: [organizationMemberId],
        },
      },
      { new: true, multi: true }
    );
    await Promise.all([orgData, orgMember, accountData]);

    return res.status(500).send({
      message:
        error.message || "Some error occurred while creating the Organization.",
    });
  }
};
exports.getOrganizationList = (req, res) => {
  console.log(req.params.organization_id);
  Account.find({ uuid: req.params.auth_id })
    .populate({ path: "organizations", model: "organizations" })
    .then((organization) => res.status(200).json(organization))
    .catch((err) => res.status(400).json("Error: " + err));
};
