module.exports = (mongoose) => {
  var certificateRequestSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      email: { type: String },
      user_id: { type: String },
      name: { type: String },
      description: { type: String },
      certificate_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "certificates",
      },
      billing_info: {
        address1: { type: String },
        address2: { type: String },
        mobile: { type: String },
        address: { type: String },
        address2: { type: String },
        city: { type: String },
        postal: { type: String },
        country: { type: String },
      },
      note: { type: String },
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
