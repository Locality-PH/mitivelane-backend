module.exports = (mongoose) => {
  var analyticSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      visitor_id: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "visitors",
        },
      ],
      organization_id: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "organizations",
        },
      ],
      session_duration_id: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "session_durations",
        },
      ],
    },
    { timestamps: true }
  );
  analyticSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.analytic_id = _id;
    return object;
  });
  const Tokens = mongoose.model("analytics", analyticSchema);
  return Tokens;
};
