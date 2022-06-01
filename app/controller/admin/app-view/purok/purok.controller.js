const db = require("../../../../models");
var mongoose = require("mongoose");
var moment = require('moment');

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

exports.getPurokPage = async (req, res) => {
  try {
    console.log("req.body", req.body)
    var page = parseInt(req.body.page) - 1;
    var pageSize = parseInt(req.body.pageSize);
    var organization_id = req.body.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);

    var tableScreen = req.body.tableScreen
    var tableScreenLength = Object.keys(tableScreen).length
    var sorter = null
    var filter = { organization_id: organization_id }
    var doesFilterExist = tableScreen.hasOwnProperty("filter")
    var doesSorterExist = tableScreen.hasOwnProperty("sorter")
    var numberKeys = [] // put here keys that are number fields
    var dateKeys = ["createdAt"] // put here keys that are date fields

    if (doesFilterExist != false) {
      var tempFilter = tableScreen.filter
      var isKeyNumber = false
      var isKeyDate = false

      for (const [key, value] of Object.entries(tempFilter)) {
        if (value != null) {
          isKeyNumber = numberKeys.includes(key)
          isKeyDate = dateKeys.includes(key)

          if (isKeyNumber == true) {
            filter = { ...filter, [key]: value }
          }

          if (isKeyDate == true) {
            var today = moment(value[0]).startOf('day')
            var endDate = moment(value[0]).endOf('day')

            var dateFilter = {
              [key]: {
                $gte: today,
                $lte: endDate
              }
            }

            filter = { ...filter, ...dateFilter}
          }

          if (isKeyDate == false && isKeyNumber == false) {
            filter = { ...filter, [key]: { $regex: value.join("|"), $options: "i" } }
          }
        }
      }
    }

    if (doesSorterExist != false) {
      var tempSorter = tableScreen.sorter
      var field = tempSorter.field
      var order = tempSorter.order + 'ing'
      sorter = { [field]: order }
    }

    // console.log("filter", filter)
    // console.log("sorter", sorter)

    await Purok.find(filter)
      .skip(page * pageSize)
      .limit(pageSize)
      .sort(sorter)
      .then(async (result) => {
        var list = result
        await Purok.countDocuments(filter)
          .then((result) => {
            var total = result
            res.json({ list, total });
          });
      })

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
  const selectedArray = req.body.selectedArray;

  try {
    await Purok.deleteMany({ _id: selectedArray });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};
