module.exports = (mongoose) => {
  var organizationSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      slug: { type: String },
      organization_name: { type: String },
      municipality: { type: String },
      province: { type: String },
      country: { type: String },
      address: { type: String },
      phone_number: { type: String },
      website: { type: String },
      about: { type: String },
      mission: { type: String },
      vision: { type: String },
      organization_status: { type: Boolean },
      organization_supply: { type: Number, default: 0 },
      organization_supply: { type: Number, default: 0 },
      followers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "accounts_infos",
        },
      ],
      organization_member: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "organization_members",
        },
      ],
      profile: {
        "fileUrl": String,
        "fileType": String,
      }
    },
    { timestamps: true }
  );
  organizationSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.organization_id = _id;
    return object;
  });
  const Tokens = mongoose.model("organizations", organizationSchema);
  return Tokens;
};

// organization_name: values.organization,
// email: currentUser?.email,
// auth_id: user_id,
// province: values.province,
// municipality: values.municipality,
// address: values.address,
