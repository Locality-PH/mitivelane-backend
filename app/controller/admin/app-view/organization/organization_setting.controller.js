const db = require("../../../../models");
const Organization = db.organization;
const OrganizationRequest = db.organization_request;
const Account = db.account;
const OrganizationMember = db.organizationMember;
var mongoose = require("mongoose");
const Resident = db.resident;
const Blotter = db.blotter;

const Transporter = require("../../../../../nodemailerSetup");
console.log(process.env.URL);
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

exports.addMember = async (req, res) => {
  const values = req.body;
  const _id = new mongoose.Types.ObjectId();
  var newMember = [];

  try {
    values.new_member.map(async (value, i) => {
      newMember.push(value);

      var newMemberId = new mongoose.Types.ObjectId();
      newMember[i]._id = newMemberId;

      var mailOptions = {
        from: "testmitivelane@gmail.com",
        to: value.email,
        subject:
          value.role == "Administrator"
            ? "You've been invited to join the organization as Administrator"
            : "You've been invited to join the organization as Editor",
        html: `<p>${values.current_user_name} invited you to his Organization</p>
				<h1>Invitation Code: ${value.code}</h1>
				</br>
				<a href="http://localhost:3000/auth/organization-invite/${newMemberId}">Click here to Verify.<a>`,
      };

      await Transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    });

    await OrganizationRequest.insertMany(newMember);

    return res.json("Success");
  } catch (error) {
    return res.json("Error");
  }
};

exports.verifyRequest = async (req, res) => {
  const values = req.body;
  const _id = values._id;

  try {
    const organizationRequest = await OrganizationRequest.findOne({ _id: _id });
    const account = await Account.findOne({ email: organizationRequest.email });

    if (account.length == 0) {
      // No account exists for invited member.
      return res.json("Condition1");
    } else if (values.uuid != account.uuid) {
      // Member who have been invited have an account but have not yet logged in.
      return res.json("Condition2");
    } else if (values.uuid == account.uuid) {
      // Members who have been invited to join already have an account and have logged in.
      return res.json("Condition3");
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
    const organizationId = organizationRequest.organization_id;

    if (organizationRequest.status == "Pending") {
      const account = await Account.findOne({
        email: organizationRequest.email,
      });
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
      await OrganizationRequest.updateOne({ _id: _id }, { status: "Accepted" });

      return res.json("Success");
    } else if (organizationRequest.status == "Accepted") {
      return res.json("Joined");
    }
  } catch (error) {
    return res.json("Error");
  }
};

exports.acceptRequest2 = async (req, res) => {
  const values = req.body;
  const _id = values._id;
  const memberId = new mongoose.Types.ObjectId();

  try {
    const organizationRequest = await OrganizationRequest.findOne({ _id: _id });
    const account = await Account.findOne({ uuid: values.uuid });

    if (organizationRequest.email == account.email) {
      const organizationId = organizationRequest.organization_id;

      if (organizationRequest.status == "Pending") {
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
        await OrganizationRequest.updateOne({ _id: _id }, { status: "Accepted" });

        return res.json("Success");
      } else if (organizationRequest.status == "Accepted") {
        return res.json("Joined");
      }
    } else {
      console.log("not match at lajfaljfl")
    }

  } catch (error) {
    return res.json("Error");
  }
};

// Methods for Organization Member
exports.getOrganizationMembers = async (req, res) => {
  const _id = req.body._id;

  try {
    await OrganizationMember.deleteOne({ _id: _id });

    return res.json("Success");
  } catch (error) {
    return res.json("Error");
  }
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

exports.getOrganizationRequest = async (req, res) => {
  const organizationId = req.params.organization_id;

  try {
    const organizationRequest = await OrganizationRequest.find({
      organization_id: organizationId,
    });

    return res.json(organizationRequest);
  } catch (error) {
    return res.json([]);
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
