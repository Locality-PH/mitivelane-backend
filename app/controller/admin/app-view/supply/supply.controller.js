const db = require("../../../../models");
var mongoose = require("mongoose");

const SupplyGiven = db.SupplyGiven
const SupplyReceive = db.SupplyReceive
const SupplyInventory = db.SupplyInventory

exports.getSupplies = async (req, res) => {
    var barangay_id = req.body.barangay_id
    barangay_id = mongoose.Types.ObjectId(barangay_id);

    try {
        const supplies = await SupplyGiven.find({ barangay_id })
        console.log(supplies)
        res.json({SupplyGiven: supplies})
        res.send(200) 
        console.log("connected")
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
};

exports.addSupplyGiven  = async (req, res) => {

    console.log(req.body);

    newSupplyData =  req.body.newSupplyGiven
    newSupplyData._id = new mongoose.Types.ObjectId();
    newSupplyData.barangay_id = mongoose.Types.ObjectId(req.body.barangay_id);

    try {
        const newSupply = new SupplyGiven(newSupplyData)
        await newSupply.save()
        res.send(200) 
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
};

exports.updateSupplyGiven  = async (req, res) => {
    const newSupplyGiven = req.body.newSupplyGiven
    console.log("update", newSupplyGiven);

    try {
        await SupplyGiven.updateOne({_id: newSupplyGiven.supply_given_id}, newSupplyGiven)
        res.send(200)  
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
};

exports.deleteSupplyGiven = async (req, res) => {
    const supplyGivenIDs = req.body.supplyGivenIDs
    console.log("delete",supplyGivenIDs)

    try {
        await SupplyGiven.deleteMany({_id: supplyGivenIDs})
        res.send(200)  
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
};

exports.addSupplyReceived = async (req, res) => {

    // newPurokData =  req.body.newArea
    // newPurokData._id = new mongoose.Types.ObjectId();
    // newPurokData.barangay_id = mongoose.Types.ObjectId(req.body.barangay_id);

    // try {
    //     const newPurok = new Purok(newPurokData)
    //     await newPurok.save()
    //     res.json(newPurok)
    // } catch (error) {
    //     console.log(error)
    // //     res.status(500).send({ error: "error" });
    // }
};

exports.updateSupplyReceived = async (req, res) => {
    // const newAreaData = req.body.newAreaData

    // try {
    //     await Purok.updateOne({_id: newAreaData.purok_id}, newAreaData)
    // } catch (error) {
    //     console.log(error)
    // //     res.status(500).send({ error: "error" });
    // }
};

exports.deleteSupplyReceived = async (req, res) => {
    // const area_id = req.body.area_id

    // try {
    //     await Purok.findOneAndDelete({_id: area_id})
    // } catch (error) {
    //     console.log(error)
    // //     res.status(500).send({ error: "error" });
    // }
};

