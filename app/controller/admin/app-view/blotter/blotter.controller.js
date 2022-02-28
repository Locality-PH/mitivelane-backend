const db = require("../../../../models");
const Blotter = db.blotter
var mongoose = require("mongoose");

exports.createBlotter = async (req, res) => {
    const values = req.body
    const blotterId = new mongoose.Types.ObjectId()

    try {
        const blotterData = new Blotter({
            _id: blotterId,
            barangay_id: values.barangay_id,
            blotter_id: values.blotter_id,
            settlement_status: values.settlement_status,
            subject: values.subject,
            incident_type: values.incident_type,
            place_incident: values.place_incident,
            time_of_incident: values.time_of_incident,
            date_of_incident: values.date_of_incident
        })
        await blotterData.save()

        return res.json("Success")
    } catch (error) {
        return res.json("Error")
    }
};

exports.getBlotters = async (req, res) => {
    const barangayId = req.params.barangay_id

    try {
        const blotter = await Blotter.find({ barangay_id: barangayId })
        return res.json(blotter)
    } catch (error) {
        return res.json("Error")
    }

};
