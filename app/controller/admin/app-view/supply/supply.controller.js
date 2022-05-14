const db = require("../../../../models");
var mongoose = require("mongoose");

const SupplyGiven = db.SupplyGiven;
const SupplyReceived = db.SupplyReceive;
const SupplyInventory = db.SupplyInventory;
const Organization = db.organization;

exports.getGivenSupplies = async (req, res) => {
  try {
    var organization_id = req.body.organization_id;
    var pageSize = req.body.pageSize;
    organization_id = mongoose.Types.ObjectId(organization_id);
    var suppliesGiven, suppliesGivenCount;

<<<<<<< HEAD
    await SupplyGiven.find({ organization_id })
      .limit(pageSize)
      .then(async (data) => {
        suppliesGiven = data;
        await SupplyGiven.countDocuments({ organization_id }).then((data) => {
          suppliesGivenCount = data;
          res
            .status(200)
            .send({ SupplyGiven: suppliesGiven, suppliesGivenCount });
          console.log("connected");
        });
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.getReceivedSupplies = async (req, res) => {
  try {
    var organization_id = req.body.organization_id;
    var pageSize = req.body.pageSize;
    organization_id = mongoose.Types.ObjectId(organization_id);
    var suppliesReceived, suppliesReceivedCount;
=======
        await SupplyGiven.find({ barangay_id }).limit(pageSize)
        .then(async (data) => {
            suppliesGiven = data
            await SupplyGiven.countDocuments({ barangay_id })
            .then((data) => {
                suppliesGivenCount = data
                res.status(200).send({ SupplyGiven: suppliesGiven, suppliesGivenCount})
                console.log("connected")
            })
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
};

exports.getReceivedSupplies = async (req, res) => {
    try {
        var barangay_id = req.body.barangay_id
        var pageSize = req.body.pageSize
        barangay_id = mongoose.Types.ObjectId(barangay_id);
        var suppliesReceived, suppliesReceivedCount

        await SupplyReceived.find({ barangay_id }).limit(pageSize)
        .then(async (data) => {
            suppliesReceived = data
            await SupplyReceived.countDocuments({ barangay_id })
            .then((data) => {
                suppliesReceivedCount = data
                res.status(200).send({ SupplyReceived: suppliesReceived, suppliesReceivedCount})
                console.log("connected")
            })
        })
>>>>>>> parent of a99e15e (For merge)

    await SupplyReceived.find({ organization_id })
      .limit(pageSize)
      .then(async (data) => {
        suppliesReceived = data;
        await SupplyReceived.countDocuments({ organization_id }).then(
          (data) => {
            suppliesReceivedCount = data;
            res.status(200).send({
              SupplyReceived: suppliesReceived,
              suppliesReceivedCount,
            });
            console.log("connected");
          }
        );
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.getGivenSupplyPage = async (req, res) => {
<<<<<<< HEAD
  try {
    var page = parseInt(req.params.page) - 1;
    var pageSize = parseInt(req.params.pageSize);
    var organization_id = req.params.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);
    const query = await SupplyGiven.find({ organization_id })
      .skip(page * pageSize)
      .limit(pageSize);
    res.status(200).send(query);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.getReceivedSupplyPage = async (req, res) => {
  try {
    console.log("receive supply page");
    console.log(res.body);
    var page = parseInt(req.params.page) - 1;
    var pageSize = parseInt(req.params.pageSize);
    var organization_id = req.params.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);
    const query = await SupplyReceived.find({ organization_id })
      .skip(page * pageSize)
      .limit(pageSize);
    console.log(query);
    res.status(200).send(query);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
=======
    try {
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
        console.log("receive supply page")
        console.log(res.body)
        var page = parseInt(req.params.page) - 1
        var pageSize = parseInt(req.params.pageSize)
        var barangay_id = req.params.barangay_id
        barangay_id = mongoose.Types.ObjectId(barangay_id);
        const query = await SupplyReceived.find({ barangay_id }).skip(page * pageSize).limit(pageSize)
        console.log(query)
        res.status(200).send(query)
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "error" });
    }
>>>>>>> parent of a99e15e (For merge)
};

exports.getCurrentSupply = async (req, res) => {
  try {
    var organization_id = req.body.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);
    const currentSupply = await Organization.findOne({ _id: organization_id });
    res.status(200).send(currentSupply);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.updateCurrentSupply = async (req, res) => {
  try {
    var organization_id = req.body.organization_id;
    var new_supply_amount = req.body.new_supply_amount;
    organization_id = mongoose.Types.ObjectId(organization_id);
    const query = await Organization.updateOne(
      { _id: organization_id },
      { organization_supply: new_supply_amount }
    );
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.addSupplyGiven = async (req, res) => {
  try {
    var organization_id = req.body.organization_id;
    var new_supply_amount = req.body.new_supply_amount;
    var newSupplyData = req.body.newSupplyGiven;
    newSupplyData._id = new mongoose.Types.ObjectId();
    newSupplyData.organization_id = mongoose.Types.ObjectId(organization_id);
    newSupplyData.current_supply = new_supply_amount;
    //Organization
    const query = await Organization.updateOne(
      { _id: organization_id },
      { organization_supply: new_supply_amount }
    );
    //Supply
    const newSupply = new SupplyGiven(newSupplyData);
    await newSupply.save();
    console.log("success");
    res.json(newSupply);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.updateSupplyGiven = async (req, res) => {
  try {
    var organization_id = req.body.organization_id;
    var new_supply_amount = req.body.new_supply_amount;
    var newSupplyGiven = req.body.newSupplyGiven;
    newSupplyGiven.current_supply = new_supply_amount;
    //Organization
    const query = await Organization.updateOne(
      { _id: organization_id },
      { organization_supply: new_supply_amount }
    );
    //Supply
    await SupplyGiven.updateOne(
      { _id: newSupplyGiven.supply_given_id },
      newSupplyGiven
    );
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.deleteSupplyGiven = async (req, res) => {
  try {
    var organization_id = req.body.organization_id;
    var new_supply_amount = req.body.new_supply_amount;
    const supplyGivenIDs = req.body.supplyGivenIDs;
    //Organization
    const query = await Organization.updateOne(
      { _id: organization_id },
      { organization_supply: new_supply_amount }
    );
    //Supply
    await SupplyGiven.deleteMany({ _id: supplyGivenIDs });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.addSupplyReceived = async (req, res) => {
  try {
    var organization_id = req.body.organization_id;
    var new_supply_amount = req.body.new_supply_amount;
    var newSupplyData = req.body.newSupplyReceived;
    newSupplyData._id = new mongoose.Types.ObjectId();
    newSupplyData.organization_id = mongoose.Types.ObjectId(organization_id);
    newSupplyData.current_supply = new_supply_amount;
    //Organization
    const query = await Organization.updateOne(
      { _id: organization_id },
      { organization_supply: new_supply_amount }
    );
    //Supply
    const newSupply = new SupplyReceived(newSupplyData);
    await newSupply.save();
    console.log("success");
    res.json(newSupply);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.updateSupplyReceived = async (req, res) => {
  try {
    var newSupplyReceived = req.body.newSupplyReceived;
    var new_supply_amount = req.body.new_supply_amount;
    var organization_id = req.body.organization_id;
    newSupplyReceived.current_supply = new_supply_amount;
    //Organization
    const query = await Organization.updateOne(
      { _id: organization_id },
      { organization_supply: new_supply_amount }
    );
    //Supply
    await SupplyReceived.updateOne(
      { _id: newSupplyReceived.supply_receive_id },
      newSupplyReceived
    );
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.deleteSupplyReceived = async (req, res) => {
  try {
    var organization_id = req.body.organization_id;
    var new_supply_amount = req.body.new_supply_amount;
    const supplyReceivedIDs = req.body.supplyReceivedIDs;
    console.log("supplyReceivedIDs", supplyReceivedIDs);
    console.log("delete", supplyReceivedIDs);
    //Organization
    const query = await Organization.updateOne(
      { _id: organization_id },
      { organization_supply: new_supply_amount }
    );
    //Supply
    await SupplyReceived.deleteMany({ _id: supplyReceivedIDs });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};
