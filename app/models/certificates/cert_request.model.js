module.exports = (mongoose) => {
  var certificateRequestSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      email: { type: String },
      user_id: { type: String, ref: "accounts_infos" },
      organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
      },
      name: { type: String },
      description: { type: String },
      certificate_type: { type: String },
      attach_file: {
        uid: { type: mongoose.Schema.Types.ObjectId },
        name: { type: String },
        status: { type: String },
        url: { type: String },
      },
      status: { type: String },
      billing_info: {
        address: { type: String },
        address2: { type: String },
        mobile: { type: String },
        city: { type: String },
        postal: { type: String },
        country: { type: String },
      },
      notes: { type: Object },
      issuer: { type: String },
    },
    { timestamps: true }
  );
  certificateRequestSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.certificate_requests_id = _id;
    return object;
  });
  const Tokens = mongoose.model(
    "certificate_requests",
    certificateRequestSchema
  );
  return Tokens;
};
