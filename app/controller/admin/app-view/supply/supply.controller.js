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
  try {
    var tableScreen = req.body.tableScreen
    var tableScreenLength = Object.keys(tableScreen).length
    console.log("tableScreen", tableScreen)
    var page = parseInt(req.params.page) - 1;
    var pageSize = parseInt(req.params.pageSize);
    var organization_id = req.params.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);

    if (tableScreenLength > 0) {
      var sorter = tableScreen.sorter
      var order = sorter.order + "ing" // either ascend or descend ing is need for mongoose
      var field = sorter.field

      await SupplyGiven.find({ organization_id })
      .skip(page * pageSize)
      .limit(pageSize)
      .sort({[field]: order})
      .then((result) => {
        res.status(200).send(result);
      })
    }

    if (tableScreenLength <= 0) {
      await SupplyGiven.find({ organization_id })
      .skip(page * pageSize)
      .limit(pageSize)
      .then((result) => {
        res.status(200).send(result);
      })
    }

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.getReceivedSupplyPage = async (req, res) => {
  try {
    var tableScreen = req.body.tableScreen
    var tableScreenLength = Object.keys(tableScreen).length
    console.log("tableScreen", tableScreen)
    var page = parseInt(req.params.page) - 1;
    var pageSize = parseInt(req.params.pageSize);
    var organization_id = req.params.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);

    if (tableScreenLength > 0) {
      var sorter = tableScreen.sorter
      var order = sorter.order + "ing" // either ascend or descend ing is need for mongoose
      var field = sorter.field

      await SupplyReceived.find({ organization_id })
      .skip(page * pageSize)
      .limit(pageSize)
      .sort({[field]: order})
      .then((result) => {
        res.status(200).send(result);
      })
    }

    if (tableScreenLength <= 0) {
      await SupplyReceived.find({ organization_id })
      .skip(page * pageSize)
      .limit(pageSize)
      .then((result) => {
        res.status(200).send(result);
      })
    }

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
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