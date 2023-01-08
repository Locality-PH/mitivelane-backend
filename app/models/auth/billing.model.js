module.exports = (mongoose) => {
  var billingSchema = mongoose.Schema(
    {
      card_number: { type: String, required: true },
      card_holder: { type: String, required: true },
      issuer: { type: String, required: true },
      valid_thru: { type: String },
      cvc: { type: String },
      active_card: { type: Boolean },
      user_id: { type: String, required: true },
    },
    { timestamps: true }
  );
  billingSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.billing_id = _id;
    return object;
  });
  const Tokens = mongoose.model("billings", billingSchema);
  return Tokens;
};
