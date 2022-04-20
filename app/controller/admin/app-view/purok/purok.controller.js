const db = require("../../../../models");
var mongoose = require("mongoose");

const Purok = db.purok

exports.getPuroks = async (req, res) => {
    var barangay_id = req.body.barangay_id
    barangay_id = mongoose.Types.ObjectId(barangay_id);
    console.log(barangay_id)

    try {
        const puroks = await Purok.find({ barangay_id })
        console.log(puroks)
        res.json(puroks)
    } catch (error) {
        console.log(error)
    }
};

exports.addPurok= async (req, res) => {

    newPurokData =  req.body.newArea
    newPurokData._id = new mongoose.Types.ObjectId();
    newPurokData.barangay_id = mongoose.Types.ObjectId(req.body.barangay_id);

    try {
        const newPurok = new Purok(newPurokData)
        await newPurok.save()
        res.json(newPurok)
    } catch (error) {
        console.log(error)
        res.json("error occured!!!")
    }
};

exports.updatePurok= async (req, res) => {
    const newAreaData = req.body.newAreaData

    try {
        await Purok.updateOne({_id: newAreaData.purok_id}, newAreaData)
    } catch (error) {
        console.log(error)
        res.json("error occured!!!")
    }
};

exports.deletePurok= async (req, res) => {
    const area_id = req.body.area_id

    try {
        await Purok.findOneAndDelete({_id: area_id})
    } catch (error) {
        console.log(error)
        res.json("error occured!!!")
    }
};

