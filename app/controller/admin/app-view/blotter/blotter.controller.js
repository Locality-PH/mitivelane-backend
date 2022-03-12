const db = require("../../../../models");
const Blotter = db.blotter
var mongoose = require("mongoose");

exports.createBlotter = async (req, res) => {
    const values = req.body
    const _id = new mongoose.Types.ObjectId()

    try {
        const blotterCount = await Blotter.find({ barangay_id: values.barangay_id }).count()

        const blotterData = new Blotter({
            _id: _id,
            barangay_id: values.barangay_id,
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
            date_schedule: values.date_schedule
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
        const blotter = await Blotter.find({ barangay_id: barangayId }).populate("reporters")
        return res.json(blotter)
    } catch (error) {
        return res.json([])
    }

};

exports.getBlotterInitialValue = async (req, res) => {
    const _id = req.params._id

    try {
        const blotter = await Blotter.findOne({ _id: _id })
        return res.json(blotter)

    } catch (error) {
        return res.json({})
    }

}

exports.editBlotter = async (req, res) => {
    const values = req.body
    const _id = req.params._id

    try {
        await Blotter.updateOne({ _id: _id },
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
                date_schedule: values.date_schedule
            })

        return res.json("Success")

    } catch (error) {
        return res.json("Error")

    }

}

exports.deleteBlotter = async (req, res) => {
    const _ids = req.body._ids

    try {
        await Blotter.deleteMany({ _id: { $in: _ids } })
        return res.json("Success")

    } catch (error) {
        return res.json("Error")
    }

}

exports.recordCases = async (req, res) => {
    const barangayId = req.params.barangay_id

    try {
        const settledCount = await Blotter.find({
            barangay_id: barangayId,
            settlement_status: "Settled"
        }).count()

        const unscheduledCount = await Blotter.find({
            barangay_id: barangayId,
            settlement_status: "Unscheduled"
        }).count()

        const unSettledCount = await Blotter.find({
            barangay_id: barangayId,
            settlement_status: "Unsettled"
        }).count()

        const scheduledCount = await Blotter.find({
            barangay_id: barangayId,
            settlement_status: "Scheduled"
        }).count()

        return res.json([settledCount, scheduledCount, unscheduledCount, unSettledCount])

    } catch (error) {
        return res.json([0, 0, 0, 0])

    }

}
