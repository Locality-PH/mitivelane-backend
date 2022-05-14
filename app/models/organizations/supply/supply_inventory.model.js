module.exports = (mongoose) => {
  var supplyStockSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      month: { type: String },
      total_supply: { type: Number },
      organization_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organizations",
      },
    },
    { timestamps: true }
  );
  supplyStockSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.supply_stock_id = _id;
    return object;
  });
  const Tokens = mongoose.model("supply_stocks", supplyStockSchema);
  return Tokens;
};
