const db = require("../../../../models");
var mongoose = require("mongoose");

const Resident = db.resident;

exports.getResidents = async (req, res) => {
    //console.log(req.body);

    try {
        const resident = await Resident.find({})
        res.json(resident)
    } catch (error) {
        console.log(error)
    }
};

exports.addResident = async (req, res) => {
    console.log(req.body);
    const newResidentData = req.body.values
    newResidentData._id = new mongoose.Types.ObjectId();
    newResidentData.barangay_id = 1004;

    try {
        const newResident = new Resident(newResidentData)
        console.log(newResident)
        await newResident.save()
        res.json("success")
    } catch (error) {
        console.log(error)
    }
};
