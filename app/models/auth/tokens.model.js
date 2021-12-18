module.exports = (mongoose) => {
  var tokensSchema = mongoose.Schema(
    {
      access_token: { type: String, required: true },
      refresh_token: { type: String, required: true },
      expiration: { type: Date, required: true },
    },
    { timestamps: true }
  );
  tokensSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.account_id = _id;
    return object;
  });
  const Tokens = mongoose.model("tokens", tokensSchema);
  return Tokens;
};
