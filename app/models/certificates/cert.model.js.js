module.exports = (mongoose) => {
  var certificateSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      barangay_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "barangays",
      },
      country: { type: String },
      municipality: { type: String },
      barangay: { type: String },
      office: { type: String },
    },
    { timestamps: true }
  );
  certificateSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.certificate_id = _id;
    return object;
  });
  const certificate = mongoose.model("certificates", certificateSchema);
  return certificate;
};
