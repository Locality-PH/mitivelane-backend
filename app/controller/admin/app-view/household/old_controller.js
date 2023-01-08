// const db = require("../../../../models");
// var mongoose = require("mongoose");

// const Resident = db.resident;
// const Household = db.household;
// const HouseholdMember = db.householdMember;

// exports.getHouseholds = async (req, res) => {
//   try {
//     const organization_id = req.body.organization_id;
//     const households = await Household.find({
//       organization: organization_id,
//     }).populate("residents");
//     res.json(households);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ error: error });
//   }
// };

// exports.getHouseholdPage = async (req, res) => {
//   try {

//     // console.log("req.body", req.body)
//     const organization_id = req.body.organization_id;
//     const page = req.body.page - 1
//     const pageSize = req.body.pageSize
//     var dataFilter = req.body.dataFilter
//     var sortFilter = { [dataFilter.field]: dataFilter.sort }
//     var searchFilter = { organization_id }

//     if (dataFilter.value != '') {
//       searchFilter = { ...searchFilter, [dataFilter.field]: { $regex: dataFilter.value, $options: "i" } }
//     }

//     // console.log("dataFilter", dataFilter)
//     // console.log("searchFilter", searchFilter)
//     // console.log("sortFilter", sortFilter)

//     const query1 = Household.find(searchFilter)
//       .skip(page * pageSize)
//       .limit(pageSize)
//       .collation({locale: "en" })
//       .sort(sortFilter)
//       .populate("household_members")

//     const query2 = Household.countDocuments(searchFilter)

//     await Promise.all([query1, query2])
//       .then(([household, total]) => {
//         // console.log("household", household)
//         // console.log("total", total)

//         res.json({ household, total })
//       })

//     // res.json(households);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ error: error });
//   }
// };


// exports.getHousehold = async (req, res) => {
//   try {
//     const organization_id = req.body.organization_id;
//     const household_id = req.body.household_id;
//     const households = await Household.findOne({
//       organization: organization_id,
//       _id: household_id,
//     }).populate("residents");
//     res.json(households);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ error: error });
//   }
// };

// exports.addHousehold = async (req, res) => {
//   try {
//     var newHouseholdData = req.body.household;
//     var newHouseholdMembersData = req.body.householdMembers;
//     newHouseholdData.household_members = [];

//     newHouseholdData._id = new mongoose.Types.ObjectId();
//     newHouseholdData.organization = mongoose.Types.ObjectId(
//       req.body.organization_id
//     );

//     newHouseholdMembersData.forEach((member) => {
//       if (member.action == "added" || member.action == "edited") {
//         member._id = new mongoose.Types.ObjectId();
//       }

//       newHouseholdData.household_members.push(member._id);
//     });

//     // console.log(newHouseholdData);
//     // console.log("newHouseholdMembersData", newHouseholdMembersData);

//     const newHousehold = new Household(newHouseholdData);
//     await newHousehold.save();
//     const newHouseholdMembers = await HouseholdMember.insertMany(
//       newHouseholdMembersData
//     );
//     res.json("success");
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ error: error });
//   }
// };

// exports.updateHousehold = async (req, res) => {
//   try {
//     const organization_id = req.body.organization_id;
//     const household = req.body.household;
//     const household_members = req.body.householdMembers;
//     const deletedMembers = req.body.deletedMembers;
//     const household_id = req.body.household._id;

//     const household_newMembers = household_members.filter(
//       (member) => !member.isOld
//     );
//     const household_updatedMembers = household_members.filter(
//       (member) => member.isOld && member.action === "edited"
//     );

//     console.log("household_newMembers", household_newMembers);
//     console.log("household_updatedMembers", household_updatedMembers);

//     console.log(household);

//     household.household_members = household_members.map((member) => member._id);

//     const query1 = HouseholdMember.deleteMany({ _id: deletedMembers });
//     const query2 = Household.updateOne({ _id: household_id }, household);
//     const query3 = HouseholdMember.insertMany(household_newMembers);

//     // console.log(household);
//     await Promise.all([query1, query2, query3]);

//     for (const member of household_updatedMembers) {
//       await HouseholdMember.updateOne({ _id: member._id }, member);
//     }

//     res.json("updated");
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ error: error });
//   }
// };

// exports.deleteHousehold = async (req, res) => {
//   try {
//     const organization_id = req.body.organization_id;
//     const household_id = req.body.household_id;

//     const currentHousehold = await Household.findById(household_id);
//     const currentHouseholdMembers = currentHousehold.household_members;

//     await Household.findOneAndDelete({ _id: household_id });
//     await HouseholdMember.deleteMany({ _id: currentHouseholdMembers });
//     res.json("Delete success");
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ error: error });
//   }
// };
