const db = require("../../../../models");
var mongoose = require("mongoose");
var moment = require('moment');
const { RecordSession } = require("../../../../helper/session");


const Purok = db.purok;

exports.getPuroks = async (req, res) => {
  var organization_id = req.body.organization_id;
  organization_id = mongoose.Types.ObjectId(organization_id);

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
    var values = req.body.values
    var page = parseInt(values.page) - 1;
    var pageSize = parseInt(values.pageSize);
    var organization_id = values.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);

    var tableScreen = values.tableScreen
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

            filter = { ...filter, ...dateFilter }
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

    if (doesSorterExist != true) {
      sorter = { ["createdAt"]: "descending" }
    }

    //console.log("filter", filter)
    // console.log("sorter", sorter)

    await Purok.find(filter)
      .skip(page * pageSize)
      .limit(pageSize)
      .collation({ locale: "en" })
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
  var values = req.body.values
  console.log("values", values)
  newPurokData = values.newArea;
  newPurokData._id = new mongoose.Types.ObjectId();

  newPurokData.organization_id = mongoose.Types.ObjectId(
    values.organization_id
  );

  try {
    const newPurok = new Purok(newPurokData);


    const session = await RecordSession({
      organization_id: values.organization_id,
      userAuthId: req.user.auth_id,
      message: "Added a purok.",
      action: "Create",
      module: "Purok",
    })

    const query = await newPurok.save();

    Promise.all([query, session])
    .then((values) => {
      res.json(values[0]);
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.updatePurok = async (req, res) => {
  var values = req.body.values
  const newAreaData = values.newAreaData;

  try {
    await Purok.updateOne({ _id: newAreaData.purok_id }, newAreaData)
      .then(async () => {
        await RecordSession({
          organization_id: values.organization_id,
          userAuthId: req.user.auth_id,
          message: "Updated a purok.",
          action: "Update",
          module: "Purok",
        })
        res.json("updated");
      })

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.deletePurok = async (req, res) => {
  var values = req.body.values
  const selectedArray = values.selectedArray;
  const total = selectedArray.length

  try {
    await Purok.deleteMany({ _id: selectedArray })
      .then(async () => {

        await RecordSession({
          organization_id: values.organization_id,
          userAuthId: req.user.auth_id,
          message: `Deleted ${total} number/s of purok.`,
          action: "Delete",
          module: "Purok",
        })

        res.json("deleted");
      })

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};