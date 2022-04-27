const db = require("../../../../models");
var mongoose = require("mongoose");

const SupplyGiven = db.SupplyGiven;
const SupplyReceive = db.SupplyReceive;
const SupplyInventory = db.SupplyInventory;

exports.getSupplies = async (req, res) => {
    try {
        var barangay_id = req.body.barangay_id
        barangay_id = mongoose.Types.ObjectId(barangay_id);
        const supplies = await SupplyGiven.find({ barangay_id })
        console.log(supplies)
        res.status(200).send({ SupplyGiven: supplies })
        console.log("connected")
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
};

exports.addSupplyGiven = async (req, res) => {

    try {
        console.log(req.body);
        newSupplyData = req.body.newSupplyGiven
        newSupplyData._id = new mongoose.Types.ObjectId();
        newSupplyData.barangay_id = mongoose.Types.ObjectId(req.body.barangay_id);
        const newSupply = new SupplyGiven(newSupplyData)
        await newSupply.save()
        console.log("success");
        res.json(newSupply)
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
};

exports.updateSupplyGiven = async (req, res) => {
    try {
        const newSupplyGiven = req.body.newSupplyGiven
        console.log("update", newSupplyGiven);
        await SupplyGiven.updateOne({ _id: newSupplyGiven.supply_given_id }, newSupplyGiven)
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
};

exports.deleteSupplyGiven = async (req, res) => {
    try {
        const supplyGivenIDs = req.body.supplyGivenIDs
        console.log("delete", supplyGivenIDs)
        await SupplyGiven.deleteMany({ _id: supplyGivenIDs })
        res.sendStatus(200)
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
