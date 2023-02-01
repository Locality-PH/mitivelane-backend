module.exports = (mongoose) => {
  var certificateSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
      },
      title: { type: String },
      country: { type: String },
      firstLogo: { type: String },
      secondLogo: { type: String },
      is_active: { type: Boolean },
      municipality: { type: String },
      organization: { type: String },
      or_number: { type: String },
      issued_at: { type: Date },
      issued_on: { type: Date },
      clearance: { type: String },
      province: { type: String },
      status: { type: Boolean },
      line_height: { type: String },
      color_picker: { type: String },
      office: { type: String },
      cert_type: { type: String },
      template_type: { type: String },
      content: { type: Object },
      font_family: { type: String },
      font_size: { type: String },
      color: { type: String },
      signatures: [
        {
          id: { type: String },
          formName: { type: String },
          formName2: { type: String },
          active: { type: Boolean },
          image: { type: String },
        },
      ],
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
