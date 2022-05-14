const db = require("../../../../models");
const Blotter = db.blotter;
var mongoose = require("mongoose");

// exports.getBlotters = async (req, res) => {
// const organizationId = req.params.organization_id

// try {
// const blotter = await Blotter.find({ organization_id: organizationId }).populate("reporters")
// .populate("victims")
// .populate("suspects")
// .populate("respondents")

// return res.json(blotter)
// } catch (error) {
// return res.json([])
// }

// };

// exports.editBlotter = async (req, res) => {
// const values = req.body
// const _id = req.params._id

// try {
// await Blotter.updateOne({ _id: _id },
// {
// settlement_status: values.settlement_status,

// reporters: values.reporters,
// victims: values.victims,
// suspects: values.suspects,
// respondents: values.respondents,

// subject: values.subject,
// incident_type: values.incident_type,
// place_incident: values.place_incident,
// time_of_incident: values.time_of_incident,
// date_of_incident: values.date_of_incident,
// time_schedule: values.time_schedule,
// date_schedule: values.date_schedule
// })

// return res.json("Success")

// } catch (error) {
// return res.json("Error")

// }

// }
