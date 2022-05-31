module.exports = (mongoose) => {
  var supplyInventorySchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      given_month: { type: Array },
      received_month: { type: Array },
      year: { type: String },
      organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
      },
    },
    { timestamps: true }
  );
  supplyInventorySchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.supply_inventories_id = _id;
    return object;
  });

  const Tokens = mongoose.model("supply_inventories", supplyInventorySchema);
  return Tokens;
};
