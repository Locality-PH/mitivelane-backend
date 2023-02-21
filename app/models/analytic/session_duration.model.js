module.exports = (mongoose) => {
  var SessionSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      duration: { type: Number },
      uuid: { type: String },
      organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
      },
    },
    { timestamps: true }
  );
  SessionSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.session_duration_id = _id;
    return object;
  });
  const Tokens = mongoose.model("session_durations", SessionSchema);
  return Tokens;
};
