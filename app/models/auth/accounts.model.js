module.exports = (mongoose) => {
  var accountSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      email: { type: String },
      uuid: { type: String, unique: true },
      profileUrl: {
        data: String,
        contentType: String,
      },
      first_name: { type: String },
      last_name: { type: String },
      middle_name: { type: String },
      birthday: { type: Date },
      gender: { type: String },
      civil_status: { type: String },
      province: { type: String },
      municipality: { type: String },
      telephone: { type: Number },
      mobile: { type: Number },
      address: { type: String },
      first_time: { type: Boolean },
      permission: { type: Boolean },

      country: { type: String },
      remember_me: { type: Boolean },
      full_name: { type: String },
      profileLogo: { type: String },
      sessions: [
        {
          user_agent: { type: String, required: true },
          access_token: { type: String, required: true },
          refresh_token: { type: String, required: true },
          host: { type: String },
          country: { type: String },
          city: { type: String },
          os: { type: String },
          browser: { type: String },
          date: { type: Date },
        },
      ],
      // access_token: { type: String, required: true },
      // refresh_token: { type: String, required: true },
      // expiration: { type: Date, required: true },

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
