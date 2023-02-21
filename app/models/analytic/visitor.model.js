module.exports = (mongoose) => {
  var visitorSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      view: { type: Number },
      organization_id: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "organizations",
        },
      ],
    },
    { timestamps: true }
  );
  visitorSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.visitor_id = _id;
    return object;
  });
  const Tokens = mongoose.model("visitors", visitorSchema);
  return Tokens;
};
