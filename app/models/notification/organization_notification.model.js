module.exports = (mongoose) => {
  var accountSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      message: { type: String },
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: "accounts_infos" },
      uuid: { type: String },
      is_read: { type: Boolean },
      organization_id: [
        { type: mongoose.Schema.Types.ObjectId, ref: "organizations" },
      ],
    },
    { timestamps: true }
  );
  accountSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.notification_id = _id;
    return object;
  });
  const Tokens = mongoose.model("notifications", accountSchema);
  return Tokens;
};
