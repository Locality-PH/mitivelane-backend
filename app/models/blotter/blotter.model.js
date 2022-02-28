module.exports = (mongoose) => {
    var blotterSchema = mongoose.Schema(
        {
            _id: { type: mongoose.Schema.Types.ObjectId },
            barangay_id:
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "barangays",
            },
            blotter_id: { type: String },
            settlement_status: { type: String },
            reporters: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "residents"
            }],
            victims: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "residents"
            }],
            suspects: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "residents"
            }],
            respondents: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "residents"
            }],
            subject: { type: String },
            incident_type: { type: String },
            place_incident: { type: String },
            time_of_incident: { type: Date },
            date_of_incident: { type: Date }
        },
        { timestamps: true }
    );
    // blotterSchema.method("toJSON", function () {
    //     const { __v, _id, ...object } = this.toObject();
    //     object.barangay_id = _id;
    //     return object;
    // });
    const Tokens = mongoose.model("blotters", blotterSchema);
    return Tokens;
};