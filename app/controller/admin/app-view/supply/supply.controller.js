const db = require("../../../../models");
var mongoose = require("mongoose");

const SupplyGiven = db.SupplyGiven;
const SupplyReceived = db.SupplyReceive;
const SupplyInventory = db.SupplyInventory;
const Barangay = db.barangay;

exports.getSupplies = async (req, res) => {
    try {
        var barangay_id = req.body.barangay_id
        var pageSize = req.body.pageSize
        barangay_id = mongoose.Types.ObjectId(barangay_id);
        const suppliesGiven = await SupplyGiven.find({ barangay_id }).limit(pageSize)
        const suppliesGivenCount = await SupplyGiven.countDocuments({ barangay_id })
        const suppliesReceived = await SupplyReceived.find({ barangay_id }).limit(pageSize)
        const suppliesReceivedCount = await SupplyReceived.countDocuments({ barangay_id })
        res.status(200).send({ SupplyGiven: suppliesGiven, SupplyReceived: suppliesReceived, suppliesGivenCount, suppliesReceivedCount})
        console.log("connected")
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
};

exports.getGivenSupplyPage = async (req, res) => {
    try {
        console.log(req.params)
        console.log(req.params.page * 3)
        var page = parseInt(req.params.page) - 1
        var pageSize = parseInt(req.params.pageSize)
        var barangay_id = req.params.barangay_id
        barangay_id = mongoose.Types.ObjectId(barangay_id);
        const query = await SupplyGiven.find({ barangay_id }).skip(page * pageSize).limit(pageSize)
        res.status(200).send(query)
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
};

exports.getReceivedSupplyPage = async (req, res) => {
    try {
        console.log(req.params)
        console.log(req.params.page * 3)
        var page = parseInt(req.params.page) - 1
        var pageSize = parseInt(req.params.pageSize)
        var barangay_id = req.params.barangay_id
        barangay_id = mongoose.Types.ObjectId(barangay_id);
        const query = await SupplyReceived.find({ barangay_id }).skip(page * pageSize).limit(pageSize)
        res.status(200).send(query)
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
};

exports.getCurrentSupply = async (req, res) => {
    try {
        var barangay_id = req.body.barangay_id
        barangay_id = mongoose.Types.ObjectId(barangay_id);
        const currentSupply = await Barangay.findOne({ _id: barangay_id })
        res.status(200).send(currentSupply)
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
};

exports.updateCurrentSupply = async (req, res) => {
    try {
        var barangay_id = req.body.barangay_id
        var new_supply_amount = req.body.new_supply_amount
        barangay_id = mongoose.Types.ObjectId(barangay_id);
        const query = await Barangay.updateOne({ _id: barangay_id }, { barangay_supply: new_supply_amount })
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
};

exports.addSupplyGiven = async (req, res) => {

    try {
        var barangay_id = req.body.barangay_id
        var new_supply_amount = req.body.new_supply_amount
        var newSupplyData = req.body.newSupplyGiven
        newSupplyData._id = new mongoose.Types.ObjectId();
        newSupplyData.barangay_id = mongoose.Types.ObjectId(barangay_id);
        newSupplyData.current_supply = new_supply_amount
        //Barangay
        const query = await Barangay.updateOne({ _id: barangay_id }, { barangay_supply: new_supply_amount })
        //Supply
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
        var barangay_id = req.body.barangay_id
        var new_supply_amount = req.body.new_supply_amount
        var newSupplyGiven = req.body.newSupplyGiven
        newSupplyGiven.current_supply = new_supply_amount
        //Barangay
        const query = await Barangay.updateOne({ _id: barangay_id }, { barangay_supply: new_supply_amount })
        //Supply
        await SupplyGiven.updateOne({ _id: newSupplyGiven.supply_given_id }, newSupplyGiven)
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
};

exports.deleteSupplyGiven = async (req, res) => {
    try {
        var barangay_id = req.body.barangay_id
        var new_supply_amount = req.body.new_supply_amount
        const supplyGivenIDs = req.body.supplyGivenIDs
        //Barangay
        const query = await Barangay.updateOne({ _id: barangay_id }, { barangay_supply: new_supply_amount })
        //Supply
        await SupplyGiven.deleteMany({ _id: supplyGivenIDs })
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
};

exports.addSupplyReceived = async (req, res) => {
    try {
        var barangay_id = req.body.barangay_id
        var new_supply_amount = req.body.new_supply_amount
        var newSupplyData = req.body.newSupplyReceived
        newSupplyData._id = new mongoose.Types.ObjectId();
        newSupplyData.barangay_id = mongoose.Types.ObjectId(barangay_id);
        newSupplyData.current_supply = new_supply_amount
        //Barangay
        const query = await Barangay.updateOne({ _id: barangay_id }, { barangay_supply: new_supply_amount })
        //Supply
        const newSupply = new SupplyReceived(newSupplyData)
        await newSupply.save()
        console.log("success");
        res.json(newSupply)
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
};

exports.updateSupplyReceived = async (req, res) => {
    try {
        var newSupplyReceived = req.body.newSupplyReceived
        var new_supply_amount = req.body.new_supply_amount
        var barangay_id = req.body.barangay_id
        newSupplyReceived.current_supply = new_supply_amount
        //Barangay
        const query = await Barangay.updateOne({ _id: barangay_id }, { barangay_supply: new_supply_amount })
        //Supply
        await SupplyReceived.updateOne({ _id: newSupplyReceived.supply_receive_id }, newSupplyReceived)
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
};

exports.deleteSupplyReceived = async (req, res) => {
    try {
        var barangay_id = req.body.barangay_id
        var new_supply_amount = req.body.new_supply_amount
        const supplyReceivedIDs = req.body.supplyReceivedIDs
        console.log("supplyReceivedIDs", supplyReceivedIDs)
        console.log("delete", supplyReceivedIDs)
        //Barangay
        const query = await Barangay.updateOne({ _id: barangay_id }, { barangay_supply: new_supply_amount })
        //Supply
        await SupplyReceived.deleteMany({ _id: supplyReceivedIDs })
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
};
