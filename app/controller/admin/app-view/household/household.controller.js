const db = require("../../../../models");
var mongoose = require("mongoose");

const Resident = db.resident;
const Household = db.household
const HouseholdMember = db.householdMember

exports.getHouseholds = async (req, res) => {
    const barangay_id = req.body.barangay_id

    try {
        const households = await Household.find({ barangay: barangay_id }).populate("household_members")
        res.json(households)
    } catch (error) {
        console.log(error)
    }
};

exports.getHousehold = async (req, res) => {
    const barangay_id = req.body.barangay_id
    const household_id = req.body.household_id

    try {
        const households = await Household.findOne({ barangay: barangay_id, _id: household_id}).populate("household_members")
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
    newHouseholdData.barangay = mongoose.Types.ObjectId(req.body.barangay_id);

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
        const newHouseholdMembers = await HouseholdMember.insertMany(newHouseholdMembersData)
        res.json("success")
    } catch (error) {
        console.log(error)
        res.json("error occured!!!")
    }
};

exports.updateHousehold = async (req, res) => {

    const barangay_id = req.body.barangay_id
    var household = req.body.household
    household.household_members = []
    var household_members = req.body.householdMembers
    var deletedMembers = req.body.deletedMembers
    var household_id = req.body.household._id

    var household_newMembers = []
    var household_updatedMembers = []


    household_members.forEach((member) => {
        if (member.isOld == false) {
            member._id = new mongoose.Types.ObjectId();
            household_newMembers.push(member)
        }

        if (member.isOld == true) {
            if (member.action == "added") {
                member._id = new mongoose.Types.ObjectId();
                household_newMembers.push(member)
            }

            if (member.action == "edited") {
                household_updatedMembers.push(member)
            }
        }

        household.household_members.push(member._id)
    })

    // console.log("household_newMembers", household_newMembers)
    // console.log("household_updatedMembers", household_updatedMembers)

    console.log(household)

    try {
        const query1 = await HouseholdMember.deleteMany({_id: deletedMembers})
        const query2 = await Household.updateOne({_id: household_id}, household)
        const query3 = await HouseholdMember.insertMany(household_newMembers)

        household_updatedMembers.map(async (member) => {
            await HouseholdMember.updateOne({_id: member._id}, member)
        })

        res.json("updated")
    } catch (error) {
        console.log(error)
    }
};

exports.deleteHousehold = async (req, res) => {
    const barangay_id = req.body.barangay_id
    const household_id = req.body.household_id

    try {
        const currentHousehold = await Household.findById(household_id)
        const currentHouseholdMembers = currentHousehold.household_members

        await Household.findOneAndDelete({_id: household_id})
        await HouseholdMember.deleteMany({_id: currentHouseholdMembers})
        res.json("Delete success")

    } catch (error) {
        console.log(error)
        res.json("error occured!!!")
    }
};


