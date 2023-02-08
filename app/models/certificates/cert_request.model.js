module.exports = (mongoose) => {
  var certificateRequestSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      email: { type: String },
      user_id: { type: String },
      organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
      },
      name: { type: String },
      description: { type: String },
      certificate_type: { type: String },
      attach_file: {
        file_name: { type: String },
        file_url: { type: String },
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
      note: { type: Object },
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
