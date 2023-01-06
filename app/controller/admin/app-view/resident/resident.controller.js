const db = require("../../../../models");
var mongoose = require("mongoose");

const Resident = db.resident;

const getSelectedResidentFields = (choosenFields, excludeAvatar) => {
  var selectedFields = '' //empty string means all field

  if (choosenFields != undefined) {
    for (let i = 0; i < choosenFields.length; i++) {
      selectedFields += choosenFields[i]

      if (i != choosenFields.length - 1) {
        selectedFields += " "
      }
    }
  }

  else if (excludeAvatar == true) {
    selectedFields = "-avatarColor -avatarImg -avatarImgType"
  }

  return selectedFields
}

exports.getResident = async (req, res) => {
  const organization_id = req.body.organization_id;
  const resident_id = req.body.resident_id;

  //for selecting field
  var excludeAvatar = req.body.excludeAvatar
  var choosenFields = req.body.fields
  excludeAvatar != undefined ? excludeAvatar : false

  var selectedFields = getSelectedResidentFields(choosenFields, excludeAvatar)

  try {
    const resident = await Resident
      .findOne({ organization_id, resident_id})
      .select(selectedFields)
    res.json(resident);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

exports.getResidents = async (req, res) => {
  var excludeAvatar = req.body.excludeAvatar
  var choosenFields = req.body.fields
  excludeAvatar != undefined ? excludeAvatar : false

  var selectedFields = getSelectedResidentFields(choosenFields, excludeAvatar)

  const organization_id = req.body.organization_id;

  try {
    const resident = await Resident
      .find({ organization_id })
      .select(selectedFields)
    res.json(resident);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

exports.getResidentTotal = async (req, res) => {
  try {
    var organization_id = req.params.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);

    await Resident.countDocuments({ organization_id }).then((result) => {
      res.json(result);
    }
    );

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.getResidentPage = async (req, res) => {
  try {
    var excludeAvatar = req.body.excludeAvatar
    var choosenFields = req.body.fields

    excludeAvatar != undefined ? excludeAvatar : false

    var selectedFields = getSelectedResidentFields(choosenFields, excludeAvatar)

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
    var numberKeys = ["age"] // put here keys that are number fields

    if (doesFilterExist != false) {
      var tempFilter = tableScreen.filter
      var isKeyNumber = false

      for (const [key, value] of Object.entries(tempFilter)) {
        if (value != null) {
          isKeyNumber = numberKeys.includes(key)

          if (isKeyNumber == true) {
            filter = { ...filter, [key]: value }
          }

          if (isKeyNumber == false) {
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

    //console.log("filter", filter)
    // console.log("sorter", sorter)

    await Resident.find(filter)
      .skip(page * pageSize)
      .limit(pageSize)
      .collation({ locale: "en" })
      .sort(sorter)
      .select(selectedFields)
      .then(async (result) => {
        var residentList = result
        await Resident.countDocuments(filter)
          .then((result) => {
            var total = result

            res.json({ residentList, total });
          });
      })

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};

exports.getPopulationStatus = async (req, res) => {
  let residentMale
  let residentFemale
  let residentRegisteredVoters
  let residentPopulation

  try {
    var organization_id = req.params.organization_id;
    organization_id = mongoose.Types.ObjectId(organization_id);

    residentMale = await Resident.countDocuments({ gender: 'Male', organization_id }).exec()
    residentFemale = await Resident.countDocuments({ gender: 'Female', organization_id }).exec()
    residentRegisteredVoters = await Resident.countDocuments({ voter_status: 'Registered', organization_id }).exec()
    residentPopulation = await Resident.countDocuments({ organization_id }).exec()

    // console.log("residentMale", residentMale)
    // console.log("residentFemale", residentFemale)
    // console.log("residentRegisteredVoters", residentRegisteredVoters)
    // console.log("residentPopulation", residentPopulation)

    res.json(
      {
        residentMale,
        residentFemale,
        residentRegisteredVoters,
        residentPopulation
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
}

exports.addResident = async (req, res) => {
  let colortag = [
    "#0085c3",
    "#7ab800",
    "#f2af00",
    "#dc5034",
    "#ce1126",
    "#0085c3",
    "#FF1493",
    "#AA47BC",
  ];

  const randomNum = Math.floor(Math.random() * colortag.length);
  const avatarColor = colortag[randomNum];

  const newResidentData = req.body.values;
  newResidentData.fullname = `${newResidentData.firstname} ${newResidentData.middlename} ${newResidentData.lastname}`;
  newResidentData._id = new mongoose.Types.ObjectId();
  newResidentData.organization_id = mongoose.Types.ObjectId(
    req.body.organization_id
  );
  newResidentData.avatarColor = avatarColor;

  // console.log(newResidentData);

  try {
    const newResident = new Resident(newResidentData);
    console.log(newResident);
    await newResident.save();
    res.json("success");
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

exports.deleteResident = async (req, res) => {
  const organization_id = req.body.organization_id;
  const resident_id = req.body.resident_id;

  try {
    // await Resident.findOneAndDelete({_id: resident_id})
    const request = await Resident.deleteMany({ _id: resident_id });
    // console.log("request", request);
    res.json("deleted");
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

exports.updateResident = async (req, res) => {
  const newResidentData = req.body.values;
  newResidentData.fullname = `${newResidentData.firstname} ${newResidentData.middlename} ${newResidentData.lastname}`;
  // console.log("new val", newResidentData);
  const resident_id = req.body.resident_id;

  try {
    const query = await Resident.findByIdAndUpdate(
      resident_id,
      newResidentData
    );
    res.json("updated");
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};
