const db = require("../../../../models");
const Organization = db.organization
const OrganizationRequest = db.organization_request
const Account = db.account
const OrganizationMember = db.organizationMember
var mongoose = require("mongoose");

const Transporter = require("../../../../../nodemailerSetup")

exports.getAllOrganizations = async (req, res) => {
	console.log("Requested in Get All organizations")
	try {
		const Organization = await Organization.find({})

		return res.json(Organization)

	}
	catch (error) {
		return res.json([]);
	}
};
