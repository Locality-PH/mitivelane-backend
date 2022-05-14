module.exports = (mongoose) => {
  var purokSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String },
      organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
      },
    },
    { timestamps: true }
  );
  purokSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.purok_id = _id;
    return object;
  });

  const Tokens = mongoose.model("puroks", purokSchema);
  return Tokens;
};
