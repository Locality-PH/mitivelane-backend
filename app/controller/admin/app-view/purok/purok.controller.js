const db = require("../../../../models");
var mongoose = require("mongoose");

const Purok = db.purok;

exports.getPuroks = async (req, res) => {
  var organization_id = req.body.organization_id;
  organization_id = mongoose.Types.ObjectId(organization_id);
  console.log(organization_id);

  try {
    const puroks = await Purok.find({ organization_id });
    res.json(puroks);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.getTotal = async (req, res) => {
  try {
    var organization_id = req.params.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);
    await Purok.countDocuments({ organization_id })
      .then((result) => {
        res.json(result)
      })
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
}

exports.getPurokPage = async (req, res) => {
  // Check initialize var for requirments
  console.log(req.body)
  try {
    var tableScreen = req.body.tableScreen
    var tableScreenLength = Object.keys(tableScreen).length
    var page = parseInt(req.body.page) - 1;
    var pageSize = parseInt(req.body.pageSize);
    var total = req.body.total
    var organization_id = req.body.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);

    if (tableScreenLength > 0) {
      var sorter = tableScreen.sorter
      var order = sorter.order + "ing" // either ascend or descend ing is need for mongoose
      var field = sorter.field

      await Purok.find({ organization_id })
      .skip(page * pageSize)
      .limit(pageSize)
      .sort({[field]: order})
      .then((result) => {
        res.status(200).send(result);
      })
    }

    if (tableScreenLength <= 0) {
      await Purok.find({ organization_id })
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


exports.addPurok = async (req, res) => {
  newPurokData = req.body.newArea;
  newPurokData._id = new mongoose.Types.ObjectId();
  newPurokData.organization_id = mongoose.Types.ObjectId(
    req.body.organization_id
  );

  try {
    const newPurok = new Purok(newPurokData);
    await newPurok.save();
    res.json(newPurok);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.updatePurok = async (req, res) => {
  const newAreaData = req.body.newAreaData;

  try {
    await Purok.updateOne({ _id: newAreaData.purok_id }, newAreaData);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.deletePurok = async (req, res) => {
  const area_id = req.body.area_id;

  try {
    await Purok.findOneAndDelete({ _id: area_id });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};
