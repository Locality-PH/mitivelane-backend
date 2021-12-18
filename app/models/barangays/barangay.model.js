module.exports = (mongoose) => {
  var barangaySchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      barangay_name: { type: String },
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
