module.exports = (mongoose) => {
  var organizationRequestSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
      },
      email: {
        type: String
      },
      code: {
        type: String
      },
      role: {
        type: String
      },
      status: {
        type: String
      }
    },
    { timestamps: true }
  );

  const Tokens = mongoose.model("organization_requests", organizationRequestSchema);
  return Tokens;
};

