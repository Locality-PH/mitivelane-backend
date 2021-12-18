module.exports = (mongoose) => {
  var accountSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      email: { type: String },
      uuid: { type: String },
      members: [
        [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "barangay_members",
          },
        ],
      ],
      barangays: [
        [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "barangay_members",
          },
        ],
      ],
    },
    { timestamps: true }
  );
  accountSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.auth_id = _id;
    return object;
  });
  const Tokens = mongoose.model("accounts_infos", accountSchema);
  return Tokens;
};
