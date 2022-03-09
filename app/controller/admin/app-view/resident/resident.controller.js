const db = require("../../../../models");
var mongoose = require("mongoose");

const Resident = db.resident;

exports.getResidents = async (req, res) => {
    const barangay_id = req.body.barangay_id

    try {
        const resident = await Resident.find({ barangay_id })
        res.json(resident)
    } catch (error) {
        console.log(error)
    }
};

exports.addResident = async (req, res) => {
    const newResidentData = req.body.values
    newResidentData._id = new mongoose.Types.ObjectId();
    newResidentData.barangay_id = mongoose.Types.ObjectId(req.body.barangay_id);

    try {
        const newResident = new Resident(newResidentData)
        console.log(newResident)
        await newResident.save()
        res.json("success")
    } catch (error) {
        console.log(error)
    }
};

exports.deleteResident = async (req, res) => {
    const barangay_id = req.body.barangay_id
    const resident_id = mongoose.Types.ObjectId(req.body.resident_id);

    try {
        // await Resident.findOneAndDelete({_id: resident_id})
        const request = await Resident.findOneAndDelete({_id: resident_id})
        console.log("request", request)
        res.json("deleted")
    } catch (error) {
        console.log(error)
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