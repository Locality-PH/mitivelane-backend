module.exports = (mongoose) => {
  var sessionSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
      },
      account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "accounts_infos",
      },
      message: { type: String },
      action: { type: String },
      module: { type: String }
    },
    { timestamps: true }
  );
  sessionSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.session_id = _id;
    return object;
  });
  const Tokens = mongoose.model("sessions", sessionSchema);
  return Tokens;
};
