module.exports = (mongoose) => {
  var barangaySchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      slug: { type: String },
      barangay_name: { type: String },
      municipality: { type: String },
      province: { type: String },
      country: { type: String },
      address: { type: String },
      barangay_supply: { type: Number, default: 0 },
      barangay_member: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "barangay_members",
        },
      ],
    },
    { timestamps: true }
  );
  barangaySchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.barangay_id = _id;
    return object;
  });
  const Tokens = mongoose.model("barangays", barangaySchema);
  return Tokens;
};

// barangay_name: values.barangay,
// email: currentUser?.email,
// auth_id: user_id,
// province: values.province,
// municipality: values.municipality,
// address: values.address,
