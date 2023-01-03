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
      address2: { type: String },
      first_time: { type: Boolean },
      city: { type: String },
      postal: { type: String },
      permission: { type: Boolean },
      status: { type: Boolean },
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
      billing_method: [
        {
          card_number: { type: String, required: true },
          card_holder: { type: String, required: true },
          issuer: { type: String, required: true },
          valid_thru: { type: String },
          cvc: { type: String },
          active_card: { type: Boolean },
        },
      ],
      // access_token: { type: String, required: true },
      // refresh_token: { type: String, required: true },
      // expiration: { type: Date, required: true },

      members: [
        [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "organization_members",
          },
        ],
      ],
      organizations: [
        [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "organization_members",
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
