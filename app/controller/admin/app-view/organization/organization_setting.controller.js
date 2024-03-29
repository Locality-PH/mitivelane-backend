const db = require("../../../../models");
const Organization = db.organization;
const OrganizationRequest = db.organization_request;
const Account = db.account;
const OrganizationMember = db.organizationMember;
var mongoose = require("mongoose");
const Resident = db.resident;
const Blotter = db.blotter;

const NodeMailer = require("../../../../nodemailer/index.js");

// Methods for user invitation
exports.validateEmail = async (req, res) => {
  const values = req.body;
  const organizationId = values.organization_id;
  const email = values.email;
  const step2Data = values.step2Data;

  var step3Data = [];
  var newMember = [];

  try {
    const organizationMember = await OrganizationMember.find({
      organization_id: organizationId,
      email: { $in: email },
    });
    const organizationRequest = await OrganizationRequest.find({
      organization_id: organizationId,
      email: { $in: email },
    });
    const account = await Account.find({ email: { $in: email } });

    var isMember = false;
    var isInvited = false;
    var haveAccount = false;

    var next = false;

    email.map((emailValue, emailIndex) => {
      // Check if email is already member
      if (organizationMember.length == 0) next = true;

      for (var i = 0; i < organizationMember.length; i++) {
        if (organizationMember[i].email == emailValue) {
          step3Data.push(step2Data[emailIndex]);
          step3Data[emailIndex].role = "Already Member";
          isMember = true;
          break;
        }

        if (organizationMember.length == i + 1 && isMember == false) {
          next = true;
        }
      }

      // Check if email is already invited
      if (isMember == false && next == true) {
        next = false;

        if (organizationRequest.length == 0) next = true;

        for (var i = 0; i < organizationRequest.length; i++) {
          if (organizationRequest[i].email == emailValue) {
            step3Data.push(step2Data[emailIndex]);
            isInvited = true;
            step3Data[emailIndex].role = "Already Invited";
            break;
          }

          if (organizationRequest.length == i + 1 && isInvited == false) {
            next = true;
          }
        }
      }

      // Check if email is already have a account or not
      if (isInvited == false && next == true) {
        step3Data.push(step2Data[emailIndex]);
        newMember.push(step3Data[emailIndex]);

        // if(account.length == 0){
        // step3Data.push(step2Data[emailIndex])
        // step3Data[emailIndex].exist = false
        // newMember.push(step3Data[emailIndex])
        // }

        // for(var i = 0; i < account.length; i++){
        // if(account[i].email == emailValue){
        // step3Data.push(step2Data[emailIndex])
        // step3Data[emailIndex].exist = true
        // newMember.push(step3Data[emailIndex])
        // haveAccount = true
        // break
        // }

        // if(account.length == i + 1 && haveAccount == false){
        // step3Data.push(step2Data[emailIndex])
        // step3Data[emailIndex].exist = false
        // newMember.push(step3Data[emailIndex])
        // }
        // }
      }

      isMember = false;
      isInvited = false;
      haveAccount = false;

      next = false;
    });

    return res.json({
      step3Data,
      newMember,
    });
  } catch (error) {
    return res.json({
      step3Data,
      newMember,
    });
  }
};

const generateCode = (length) => {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1)))
}

exports.addMember = async (req, res) => {
  const values = req.body;
  const _id = new mongoose.Types.ObjectId();
  var newMember = [];

  try {
    values.new_member.map(async (value, i) => {
      newMember.push(value);

      var newMemberId = new mongoose.Types.ObjectId();
      newMember[i]._id = newMemberId;

      let inviteCode = generateCode(6)
      newMember[i].code = inviteCode;

      NodeMailer.sendMail({
        template: "templates/emails/email1/index.html",
        replacements: {
          code: inviteCode,
          current_user_name: values.current_user_name,
          to: value.email,
          action_url: `http://${process.env.URL}/auth/organization-invite/${newMemberId}`,
        },
        from: "Mitivelane Team<testmitivelane@gmail.com>",
        to: value.email,
        subject:
          value.role == "Administrator"
            ? "You've been invited to join the organization as Administrator"
            : "You've been invited to join the organization as Editor",
      });
    });

    await OrganizationRequest.insertMany(newMember);

    return res.json("Success");
  } catch (error) {
    console.log(error);
    return res.json("Error");
  }
};

exports.verifyRequest = async (req, res) => {
  const values = req.body;
  const _id = values._id;

  try {
    const organizationRequest = await OrganizationRequest.findOne({ _id: _id });
    const account = await Account.findOne({ email: organizationRequest.email });

    if (account == null) {
      // No account exists for invited member.
      return res.json("Condition1");
    } else if (values.uuid != account.uuid) {
      // Member who have been invited have an account but have not yet logged in.
      return res.json("Condition2");
    } else if (values.uuid == account.uuid && account.organizations.length != 0) {
      // Members who have been invited to join already have an account and have logged in and have organization.
      return res.json("Condition3");
    }
    else if (values.uuid == account.uuid && account.organizations.length == 0) {
      // Members who have been invited to join already have an account and have logged in but no organization.
      return res.json("Condition4");
    }
  } catch (error) {
    return res.json("Error");
  }
};

exports.acceptRequest = async (req, res) => {
  const values = req.body;
  const _id = values._id;
  const memberId = new mongoose.Types.ObjectId();

  try {
    const organizationRequest = await OrganizationRequest.findOne({ _id: _id });
    const account = await Account.findOne({ uuid: values.uuid });

    if (organizationRequest.email == account.email) {
      const organizationId = organizationRequest.organization_id;

      if (organizationRequest.status == "Pending") {

        if (organizationRequest.code == values.code) {
          const accountId = account._id;

          const organizationMember = new OrganizationMember({
            _id: memberId,
            email: organizationRequest.email,
            role: organizationRequest.role,
            organization_id: organizationId,
            account: accountId,
          });

          await organizationMember.save();

          await Account.updateOne(
            { _id: accountId },
            {
              $push: {
                organizations: [organizationId],
                members: [organizationMember],
              },
            }
          );
          await Organization.updateOne(
            { _id: organizationId },
            { $push: { organization_member: [organizationMember] } }
          );
          await OrganizationRequest.updateOne(
            { _id: _id },
            { status: "Accepted" }
          );

          return res.json({
            organization_member_id: memberId,
            organization_id: organizationId,
            message: "Success"
          });

        } else {
          return res.json("Invalid");
        }

      } else if (organizationRequest.status == "Accepted") {
        return res.json("Joined");
      }
    } else {
      console.log("not match email and org request id");
      return res.json("Error");
    }
  } catch (error) {
    return res.json("Error");
  }
};

exports.validateRequest = async (req, res) => {
  const values = req.body;
  const _id = values._id;

  try {
    const organizationRequest = await OrganizationRequest.findOne({ _id: _id });
    const account = await Account.findOne({ uuid: values.uuid });

    if (organizationRequest.email == account.email) {
      const organizationId = organizationRequest.organization_id;

      if (organizationRequest.status == "Pending") {
        return res.json("Pending");

      } else if (organizationRequest.status == "Accepted") {
        return res.json("Joined");
      }
    } else {
      console.log("not match email and org request id");
      return res.json("Error");
    }
  } catch (error) {
    return res.json("Error");
  }
};

// Methods for Organization Member
exports.getOrganizationMembers = async (req, res) => {
  const _id = req.body._id;

  // try {
  //   await OrganizationMember.deleteOne({ _id: _id });

  //   return res.json("Success");
  // } catch (error) {
  //   return res.json("Error");
  // }
};

exports.deleteOrganizationMember = (req, res) => {
  const _id = req.body._id;

  OrganizationRequest.findOne({ _id: _id })
    .then((organizationRequest) => {
      const organizationId = organizationRequest.organization_id;

      if (organizationRequest.status == "Pending") {
        return OrganizationRequest.deleteOne({ _id: _id });
      } else {
        return OrganizationMember.findOne({
          organization_id: organizationId,
          email: organizationRequest.email,
        }).then((organizationMember) => {
          const organizationMemberId = organizationMember._id;

          return Promise.all([
            Account.updateOne(
              { email: organizationRequest.email },
              {
                $pull: {
                  organizations: [organizationId],
                  members: [organizationMemberId],
                },
              }
            ),
            Organization.updateOne(
              { _id: organizationId },
              {
                $pull: { organization_member: organizationMemberId },
              }
            ),
            OrganizationMember.deleteOne({ _id: organizationMemberId }),
            OrganizationRequest.deleteOne({ _id: _id }),
          ]);
        });
      }
    })
    .then(() => res.json("Success"))
    .catch(() => res.json("Error"));
};

// Other Methods
exports.deleteOrganization = async (req, res) => {
  const organizationId = req.body.organization_id;

  try {
    await Resident.deleteMany({ organization_id: organizationId });

    return res.json("Success");
  } catch (error) {
    return res.json("Error");
  }
};

exports.leaveOrganization = async (req, res) => {
  const values = req.body;
  const organizationId = values.organization_id;

  try {
    const account = await Account.findOne({ uuid: values.uuid });
    const email = account.email;

    const organizationRequest = await OrganizationRequest.findOne({
      organization_id: organizationId,
      email: email,
    });
    const organizationRequestId = organizationRequest._id;

    return OrganizationMember.findOne({
      organization_id: organizationId,
      email: email,
    })
      .then((organizationMember) => {
        const organizationMemberId = organizationMember._id;

        return Promise.all([
          Account.updateOne(
            { email: email },
            {
              $pull: {
                organizations: [organizationId],
                members: [organizationMemberId],
              },
            }
          ),
          Organization.updateOne(
            { _id: organizationId },
            {
              $pull: { organization_member: organizationMemberId },
            }
          ),
          OrganizationMember.deleteOne({ _id: organizationMemberId }),
          OrganizationRequest.deleteOne({ _id: organizationRequestId }),
        ]);
      })
      .then(() => res.json("Success"));
  } catch (error) {
    return res.json("Error");
  }
};

exports.getOrganizationRequest = async (req, res) => {
  const organizationId = req.params.organization_id;

  try {
    const organizationRequest = await OrganizationRequest.find({
      organization_id: organizationId,
    });

    const organization = await Organization.findOne({ _id: organizationId });
    const organizationMemberId = organization.organization_member[0];
    const organizationMember = await OrganizationMember.findOne({
      _id: organizationMemberId,
    });
    const ownerEmail = organizationMember.email;

    organizationRequest.unshift({
      _id: "1",
      email: ownerEmail,
      role: "Administrator",
      status: "Owner",
    });

    return res.json(organizationRequest);
  } catch (error) {
    return res.json([]);
  }
};

exports.editOrganization = async (req, res) => {
  const values = req.body;

  try {
    await Organization.updateOne(
      { _id: values.organization_id },
      {
        organization_name: values.organization_name,
        profile: {
          fileUrl: values.profile_url,
          fileType: values.mime_type,
        },
        province: values.province,
        municipality: values.municipality,
        address: values.address,
        country: values.country,
        phone_number: values.phone_number,
        website: values.website,
        about: values.about,
        mission: values.mission,
        vision: values.vision,
      }
    );

    return res.json("Success");
  } catch (error) {
    return res.json("Error");
  }
};

exports.editMemberRole = async (req, res) => {
  const values = req.body;

  try {
    await OrganizationRequest.updateOne(
      { _id: values._id },
      {
        role: values.role,
      }
    );

    return res.json("Success");
  } catch (error) {
    return res.json("Error");
  }
};

// exports.deleteOrganizationRequest = async (req, res) => {
// 	const _id = req.body._id;

// 	try {
// 		await OrganizationRequest.deleteOne({ _id: _id })

// 		return res.json("Success");

// 	}
// 	catch (error) {
// 		return res.json("Error");
// 	}
// };

exports.getOrganizationEmails = async (req, res) => {
  const organizationId = req.params.organization_id;

  try {
    const organizationMember = await OrganizationMember.find({
      organization_id: organizationId,
    }).sort({ active_email: -1 });

    return res.json(organizationMember);
  } catch (error) {
    return res.json([]);
  }
};

exports.getActiveEmail = async (req, res) => {
  const organizationId = req.params.organization_id;

  try {
    const organizationMember = await OrganizationMember.findOne({
      organization_id: organizationId,
      active_email: true,
    });

    const account = await Account.findOne({
      email: organizationMember.email,
    }).select({
      customer_id: 1,
      _id: 1,
    });

    return res.json(account);
  } catch (error) {
    return res.json([]);
  }
};

exports.setActiveEmail = async (req, res) => {
  const values = req.body;
  const organizationId = values.organization_id;

  try {
    if (values.old_active_email != null) {
      await OrganizationMember.updateOne(
        { organization_id: organizationId, email: values.old_active_email },
        { active_email: false }
      );
    }

    await OrganizationMember.updateOne(
      { organization_id: organizationId, email: values.new_active_email },
      { active_email: true }
    );

    return res.json("Success");
  } catch (error) {
    return res.json("Error");
  }
};

// change current organization after leaving
exports.getFistOrg = async (req, res) => {
  const uuid = req.params.uuid;

  try {
    const account = await Account.findOne({
      uuid: uuid,
    })

    if (account.members.length != 0) {
      let organizationMemberId = account.members[0]

      const organizationMember = await OrganizationMember.findOne({ _id: organizationMemberId })

      return res.json({
        organization_member_id: organizationMember._id,
        organization_id: organizationMember.organization_id,
        message: "Success"
      });
    } else if (account.members.length == 0) {
      return res.json("NoOrg");
    } else {
      return res.json("error");
    }
  } catch (error) {
    return res.json("error");
  }
};
