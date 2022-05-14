module.exports = (mongoose) => {
  var blotterRequestSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
      },
      blotter_id: { type: String },
      uuid: {
        type: String,
      },
      settlement_status: { type: String },
      status: { type: String },
      reporters: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "residents",
        },
      ],
      victims: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "residents",
        },
      ],
      suspects: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "residents",
        },
      ],
      respondents: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "residents",
        },
      ],
      subject: { type: String },
      narrative: { type: Object },
      incident_type: { type: String },
      place_incident: { type: String },
      time_of_incident: { type: Date },
      date_of_incident: { type: Date },
      time_schedule: { type: Date },
      date_schedule: { type: Date },
    },
    { timestamps: true }
  );

  const Tokens = mongoose.model("blotter_requests", blotterRequestSchema);
  return Tokens;
};
