const db = require("../../../../models");
var mongoose = require("mongoose");

const Resident = db.resident;
const Household = db.household
const householdMember = db.householdMember

exports.getHouseholds = async (req, res) => {
    const barangay_id = req.body.barangay_id

    try {
        const households = await Household.find({ barangay_id }).populate("household_members")
        res.json(households)
    } catch (error) {
        console.log(error)
    }
};

exports.addHousehold = async (req, res) => {

    var newHouseholdData = req.body.household
    var newHouseholdMembersData = req.body.householdMembers
    newHouseholdData.household_members = []

    newHouseholdData._id = new mongoose.Types.ObjectId();
    newHouseholdData.barangay_id = mongoose.Types.ObjectId(req.body.barangay_id);

    newHouseholdMembersData.forEach(member => {
        if (member.action == "added" || member.action == "edited") {
            member._id = new mongoose.Types.ObjectId();
        }

        newHouseholdData.household_members.push(member._id)
    });

    console.log(newHouseholdData)
    console.log("newHouseholdMembersData", newHouseholdMembersData)

    try {
        const newHousehold = new Household(newHouseholdData)
        await newHousehold.save()
        const newHouseholdMembers = await householdMember.insertMany(newHouseholdMembersData)
        res.json("success")
    } catch (error) {
        console.log(error)
        res.json("error occured!!!")
    }
};

exports.addHouseholdMember = async (req, res) => {

}

exports.deleteHousehold = async (req, res) => {
    const barangay_id = req.body.barangay_id
    const household_id = req.body.household_id

    try {
        const currentHousehold = await Household.findById(household_id)
        const currentHouseholdMembers = currentHousehold.household_members

        await Household.findOneAndDelete({_id: household_id})
        await householdMember.deleteMany({_id: currentHouseholdMembers})
        res.json("Delete success")

    } catch (error) {
        console.log(error)
        res.json("error occured!!!")
    }
};

exports.updateResident = async (req, res) => {
    const newResidentData = req.body.values
    console.log("new val", newResidentData)
    const resident_id = req.body.resident_id

    try {
        const query = await Resident.findByIdAndUpdate(resident_id, newResidentData)
        res.json("updated")
    } catch (error) {
        console.log(error)
    }
};