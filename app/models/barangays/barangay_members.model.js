module.exports = (mongoose) => {
  var accountSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      email: { type: String },
      role: { type: String },
      barangay_id: { type: String },
      account: { type: mongoose.Schema.Types.ObjectId, ref: "accounts_infos" },
      barangay: [{ type: mongoose.Schema.Types.ObjectId, ref: "barangays" }],
    },
    { timestamps: true }
  );
  accountSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.barangay_member_id = _id;
    return object;
  });
  const Tokens = mongoose.model("barangay_members", accountSchema);
  return Tokens;
};
