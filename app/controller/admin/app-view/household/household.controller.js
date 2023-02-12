const db = require("../../../../models");
var mongoose = require("mongoose");
var moment = require('moment');

const Resident = db.resident;
const Household = db.household;
// const HouseholdMember = db.householdMember;

const getSelectedHouseholdFields = (choosenFields, excludedFields, excludeAvatar) => {

  var selectedFields = '' //empty string means all field

  // console.log("choosenFields", choosenFields)
  // console.log("excludedFields", excludedFields)
  // console.log("excludeAvatar", excludeAvatar)

  if (choosenFields != undefined) {
    for (let i = 0; i < choosenFields.length; i++) {
      selectedFields += choosenFields[i]

      if (i != choosenFields.length - 1) {
        selectedFields += " "
      }
    }
  }

  else {
    if (excludedFields != undefined) {
      for (let i = 0; i < excludedFields.length; i++) {
        selectedFields += "-" + excludedFields[i]

        if (i != excludedFields.length - 1) {
          selectedFields += " "
        }
      }
    }

    if (excludeAvatar == true) {
      if (selectedFields != "") {
        selectedFields += " "
      }

      selectedFields += "-avatarColor -avatarImg -avatarImgType"
    }
  }

  return selectedFields
}


exports.getHouseholds = async (req, res) => {
  try {
    const organization_id = req.body.organization_id;
    const households = await Household.find({
      organization: organization_id,
    })
      .populate("household_members");
    res.json(households);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

exports.getHouseholdPage = async (req, res) => {
  try {
    //for selecting database fields
    var excludeAvatar = req.body.excludeAvatar
    var choosenFields = req.body.fields
    var excludedFields = req.body.excludedFields
    excludeAvatar != undefined ? excludeAvatar : false

    var selectedFields = getSelectedHouseholdFields(choosenFields, excludedFields, excludeAvatar)

    // console.log("req.body", req.body)
    const organization_id = req.body.organization_id;
    const page = req.body.page - 1
    const pageSize = req.body.pageSize
    var dataFilter = req.body.dataFilter
    var sortFilter = { [dataFilter.field]: dataFilter.sort }
    var searchFilter = { organization: organization_id, }

    if (dataFilter.value != '' && dataFilter.value != null) {
      if (dataFilter.type == "string") {
        searchFilter = { ...searchFilter, [dataFilter.field]: { $regex: dataFilter.value, $options: "i" } }
      }

      if (dataFilter.type == "date") {
        var today = moment(dataFilter.value).startOf('day')
        var endDate = moment(dataFilter.value).endOf('day')

        searchFilter = {
          ...searchFilter, [dataFilter.field]: { $gte: today, $lte: endDate }
        }
      }

    }

    //console.log("dataFilter", dataFilter)
    // console.log("searchFilter", searchFilter)
    // console.log("sortFilter", sortFilter)

    const query1 = Household.find(searchFilter)
      .skip(page * pageSize)
      .limit(pageSize)
      .collation({ locale: "en" })
      .sort(sortFilter)
      .populate("household_members", selectedFields)

    const query2 = Household.countDocuments(searchFilter)

    await Promise.all([query1, query2])
      .then(([household, total]) => {
        // console.log("household", household)
        // console.log("total", total)

        res.json({ household, total })
      })

    // res.json(households);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};


exports.getHousehold = async (req, res) => {
  try {
    const organization_id = req.body.organization_id;
    const household_id = req.body.household_id;
    const households = await Household.findOne({
      organization: organization_id,
      _id: household_id,
    })
      .populate("household_members");
    res.json(households);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

exports.addHousehold = async (req, res) => {
  try {
    var newHouseholdData = req.body.household;
    var newHouseholdMembersData = req.body.householdMembers;
    newHouseholdData.household_members = [];

    newHouseholdData._id = new mongoose.Types.ObjectId();
    newHouseholdData.organization = mongoose.Types.ObjectId(
      req.body.organization_id
    );

    newHouseholdMembersData.forEach((member) => {
      if (member.action == "added" || member.action == "edited") {
        member._id = new mongoose.Types.ObjectId();
      }

      newHouseholdData.household_members.push(member._id);
    });

    // console.log(newHouseholdData);
    // console.log("newHouseholdMembersData", newHouseholdMembersData);

    const newHousehold = new Household(newHouseholdData);
    await newHousehold.save();
    // const newHouseholdMembers = await HouseholdMember.insertMany(
    //   newHouseholdMembersData
    // );
    res.json("success");
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

exports.updateHousehold = async (req, res) => {
  try {
    const organization_id = req.body.organization_id;
    const household = req.body.household;
    const household_members = req.body.householdMembers;
    const household_id = req.body.household._id;

    household_members_ids = []

    household_members.map(
      (member) => {
        console.log("member._id", member._id)
        household_members_ids.push(member._id)
      });

    household.household_members = household_members_ids

    await Household.updateOne({ _id: household_id }, household);
    res.json("updated");
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

exports.deleteHousehold = async (req, res) => {
  try {
    const organization_id = req.body.organization_id;
    const household_id = req.body.household_id;

    const currentHousehold = await Household.findById(household_id);
    const currentHouseholdMembers = currentHousehold.household_members;

    await Household.findOneAndDelete({ _id: household_id });
    // await HouseholdMember.deleteMany({ _id: currentHouseholdMembers });
    res.json("Delete success");
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};
