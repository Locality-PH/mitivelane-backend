module.exports = (mongoose) => {
    var campaignSchema = mongoose.Schema(
        {
            _id: { type: mongoose.Schema.Types.ObjectId },
            title: { type: String },
            category: { type: String },
            description: { type: String },
            status: { type: String },
            starting_date: { type: Date },
            likeCounter: { type: Number, default: 0},
            participantCounter: { type: Number, default: 0 },
            likes: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "accounts_infos",
                default: []
            }],
            participants: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "accounts_infos",
                default: []
            }],
            images: [{
                data: String,
                name: String,
                contentType: String,
            }],
            suggestor: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "accounts_infos",
            },
            publisher: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "accounts_infos",
            },
            organization: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "organizations",
            },
        },
        { timestamps: true }
    );
    campaignSchema.method("toJSON", function () {
        const { __v, _id, ...object } = this.toObject();
        object.campaign_id = _id;
        return object;
    });

    const Tokens = mongoose.model("campaigns", campaignSchema);
    return Tokens;
};