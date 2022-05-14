const db = require("../../../../models");
const Blotter = db.blotter;
var mongoose = require("mongoose");

exports.createBlotter = async (req, res) => {
  const values = req.body;
  const _id = new mongoose.Types.ObjectId();

  try {
    const blotterCount = await Blotter.find({
      organization_id: values.organization_id,
    }).count();

    const blotterData = new Blotter({
      _id: _id,
      organization_id: values.organization_id,
      blotter_id: blotterCount + 1,
      uuid: values.uuid,
      settlement_status: values.settlement_status,

      reporters: values.reporters,
      victims: values.victims,
      suspects: values.suspects,
      respondents: values.respondents,

      subject: values.subject,
      narrative: values.narrative,
      incident_type: values.incident_type,
      place_incident: values.place_incident,
      time_of_incident: values.time_of_incident,
      date_of_incident: values.date_of_incident,
      time_schedule: values.time_schedule,
      date_schedule: values.date_schedule,
    });
    await blotterData.save();

    return res.json("Success");
  } catch (error) {
    return res.json("Error");
  }
};

// Need to Recode, Find Better solution for adding new key to all object in array...
exports.getBlotters = async (req, res) => {
  const organizationId = req.params.organization_id;
  var finalValue = [];

  try {
    const blotter = await Blotter.find({ organization_id: organizationId })
      .populate("reporters")
      .populate("victims")
      .populate("suspects")
      .populate("respondents");

    if (blotter.length == 0) return res.json(finalValue);

    blotter.map((value, i) => {
      finalValue.push({
        _id: value._id,
        organization_id: value.organization_id,
        blotter_id: value.blotter_id,
        createdAt: value.createdAt,

        reporter_name:
          value.reporters.length != 0
            ? `${value.reporters[0].firstname} ${value.reporters[0].lastname}`
            : "No Resident",
        avatarColor:
          value.reporters.length != 0
            ? value.reporters[0].avatarColor
            : "#04d182",

        reporters: value.reporters,
        victims: value.victims,
        suspects: value.suspects,
        respondents: value.respondents,

        reporters_id: value.reporters.map((value) => value._id),
        victims_id: value.victims.map((value) => value._id),
        suspects_id: value.suspects.map((value) => value._id),
        respondents_id: value.respondents.map((value) => value._id),

        settlement_status: value.settlement_status,
        subject: value.subject,
        narrative: value.narrative,
        incident_type: value.incident_type,
        place_incident: value.place_incident,
        time_of_incident: value.time_of_incident,
        date_of_incident: value.date_of_incident,
        time_schedule: value.time_schedule,
        date_schedule: value.date_schedule,
      });

      if (blotter.length == i + 1) {
        return res.json(finalValue);
      }
    });
  } catch (error) {
    return res.json([]);
  }
};

// exports.getBlotterInitialValue = async (req, res) => {
// const _id = req.params._id

// try {
// const blotter = await Blotter.findOne({ _id: _id })
// return res.json(blotter)

// } catch (error) {
// return res.json({})
// }

// }

exports.editBlotter = async (req, res) => {
  const values = req.body;
  const _id = req.params._id;

  try {
    await Blotter.updateOne(
      { _id: _id },
      {
        settlement_status: values.settlement_status,

        reporters: values.reporters,
        victims: values.victims,
        suspects: values.suspects,
        respondents: values.respondents,

        subject: values.subject,
        narrative: values.narrative,
        incident_type: values.incident_type,
        place_incident: values.place_incident,
        time_of_incident: values.time_of_incident,
        date_of_incident: values.date_of_incident,
        time_schedule: values.time_schedule,
        date_schedule: values.date_schedule,
      }
    );

    return res.json("Success");
  } catch (error) {
    return res.json("Error");
  }
};

exports.deleteBlotter = async (req, res) => {
  const _ids = req.body._ids;

  try {
    await Blotter.deleteMany({ _id: { $in: _ids } });
    return res.json("Success");
  } catch (error) {
    return res.json("Error");
  }
};

exports.recordCases = async (req, res) => {
  const organizationId = req.params.organization_id;

  try {
    const settledCount = await Blotter.find({
      organization_id: organizationId,
      settlement_status: "Settled",
    }).count();

    const unscheduledCount = await Blotter.find({
      organization_id: organizationId,
      settlement_status: "Unscheduled",
    }).count();

    const unSettledCount = await Blotter.find({
      organization_id: organizationId,
      settlement_status: "Unsettled",
    }).count();

    const scheduledCount = await Blotter.find({
      organization_id: organizationId,
      settlement_status: "Scheduled",
    }).count();

    return res.json([
      settledCount,
      scheduledCount,
      unscheduledCount,
      unSettledCount,
    ]);
  } catch (error) {
    return res.json([0, 0, 0, 0]);
  }
};

exports.getLatestBlotters = async (req, res) => {
  const organizationId = req.params.organization_id;
  const limit = 5;

  try {
    const blotter = await Blotter.find({ organization_id: organizationId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("reporters");

    return res.json(blotter);
  } catch (error) {
    return res.json([]);
  }
};
