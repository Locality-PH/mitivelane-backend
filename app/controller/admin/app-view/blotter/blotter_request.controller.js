const db = require("../../../../models");
const Blotter = db.blotter
const BlotterRequest = db.blotter_request
var mongoose = require("mongoose");

exports.requestBlotter = async (req, res) => {
	const values = req.body
    const _id = new mongoose.Types.ObjectId()

    try {
		values._id = _id
		const blotterRequestData = new BlotterRequest(values)
		
		await blotterRequestData.save()
		
        return res.json("Success")

    } catch (error) {
        return res.json("Error")

    }

}

exports.getBlotterRequest = async (req, res) => {
	const barangayId = req.params.barangay_id

    try {
		const blotterRequest = await BlotterRequest.find({ barangay_id: barangayId }).populate("reporters")
        return res.json(blotterRequest)

    } catch (error) {
        return res.json([])

    }

}

exports.deleteBlotterRequest = async (req, res) => {
    const _ids = req.body._ids

    try {
        await BlotterRequest.deleteMany({ _id: { $in: _ids } })
        return res.json("Success")

    } catch (error) {
        return res.json("Error")
    }

}

exports.getLatestBlotterRequests = async (req, res) => {
	const barangayId = req.params.barangay_id
	const limit = 5

    try {
        const blotterRequest = await BlotterRequest.find({ barangay_id: barangayId }).sort({createdAt: -1}).limit(limit).populate("reporters")

        return res.json(blotterRequest)

    } catch (error) {
        return res.json([])

    }
	
}

