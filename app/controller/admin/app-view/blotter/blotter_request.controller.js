const db = require("../../../../models");
const Blotter = db.blotter;
const BlotterRequest = db.blotter_request;
var mongoose = require("mongoose");

exports.requestBlotter = async (req, res) => {
  const values = req.body;
  const _id = new mongoose.Types.ObjectId();

  try {
    values._id = _id;
    const blotterRequestData = new BlotterRequest(values);

    await blotterRequestData.save();

    return res.json("Success");
  } catch (error) {
    return res.json("Error");
  }
};

exports.approveBlotterRequest = async (req, res) => {
  const _ids = req.body._ids;
  const data = req.body.data;

  try {
    await BlotterRequest.updateMany(
      { _id: { $in: _ids } },
      { status: "Approved" }
    );
    await Blotter.insertMany(data);
    return res.json("Success");
  } catch (error) {
    return res.json("Error");
  }
};

exports.rejectBlotterRequest = async (req, res) => {
  const _ids = req.body._ids;

  try {
    await BlotterRequest.updateMany(
      { _id: { $in: _ids } },
      { status: "Rejected" }
    );
    return res.json("Success");
  } catch (error) {
    return res.json("Error");
  }
};

exports.getPendingBlotterRequest = async (req, res) => {
  const organizationId = req.params.organization_id;
  var finalValue = [];

  try {
    const blotterRequest = await BlotterRequest.find({
      organization_id: organizationId,
      status: "Pending",
    })
      .populate("reporters")
      .populate("victims")
      .populate("suspects")
      .populate("respondents");

    if (blotterRequest.length == 0) return res.json(finalValue);

    blotterRequest.map((value, i) => {
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
        status: value.status,
        subject: value.subject,
        narrative: value.narrative,
        incident_type: value.incident_type,
        place_incident: value.place_incident,
        time_of_incident: value.time_of_incident,
        date_of_incident: value.date_of_incident,
        time_schedule: value.time_schedule,
        date_schedule: value.date_schedule,
      });

      if (blotterRequest.length == i + 1) {
        return res.json(finalValue);
      }
    });
  } catch (error) {
    return res.json([]);
  }
};

exports.getBlotterRequest = async (req, res) => {
  const organizationId = req.params.organization_id;
  var finalValue = [];

  try {
    const blotterRequest = await BlotterRequest.find({
      organization_id: organizationId,
      status: ["Approved", "Rejected"],
    })
      .populate("reporters")
      .populate("victims")
      .populate("suspects")
      .populate("respondents");

    if (blotterRequest.length == 0) return res.json(finalValue);

    blotterRequest.map((value, i) => {
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
        status: value.status,
        subject: value.subject,
        narrative: value.narrative,
        incident_type: value.incident_type,
        place_incident: value.place_incident,
        time_of_incident: value.time_of_incident,
        date_of_incident: value.date_of_incident,
        time_schedule: value.time_schedule,
        date_schedule: value.date_schedule,
      });

      if (blotterRequest.length == i + 1) {
        return res.json(finalValue);
      }
    });
  } catch (error) {
    return res.json([]);
  }
};

exports.deleteBlotterRequest = async (req, res) => {
  const _ids = req.body._ids;

  try {
    await BlotterRequest.deleteMany({ _id: { $in: _ids } });
    return res.json("Success");
  } catch (error) {
    return res.json("Error");
  }
};

exports.recordStatus = async (req, res) => {
  const organizationId = req.params.organization_id;

  try {
    const approvedCount = await BlotterRequest.find({
      organization_id: organizationId,
      status: "Approved",
    }).count();

    const rejectedCount = await BlotterRequest.find({
      organization_id: organizationId,
      status: "Rejected",
    }).count();

    const pendingCount = await BlotterRequest.find({
      organization_id: organizationId,
      status: "Pending",
    }).count();

    return res.json([approvedCount, rejectedCount, pendingCount]);
  } catch (error) {
    return res.json([0, 0, 0]);
  }
};

exports.getLatestBlotterRequests = async (req, res) => {
  const organizationId = req.params.organization_id;
  const limit = 5;

  try {
    const blotterRequest = await BlotterRequest.find({
      organization_id: organizationId,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("reporters");

    return res.json(blotterRequest);
  } catch (error) {
    return res.json([]);
  }
};
