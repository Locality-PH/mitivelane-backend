module.exports = (mongoose) => {
  var accountSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      email: { type: String },
      role: { type: String },
      organization_id: { type: String },
      account: { type: mongoose.Schema.Types.ObjectId, ref: "accounts_infos" },
      // organization: [{ type: mongoose.Schema.Types.ObjectId, ref: "organizations" }],
    },
    { timestamps: true }
  );
  accountSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.organization_member_id = _id;
    return object;
  });
  const Tokens = mongoose.model("organization_members", accountSchema);
  return Tokens;
};
