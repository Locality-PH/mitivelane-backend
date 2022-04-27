module.exports = (mongoose) => {
    var supplyGivenSchema = mongoose.Schema(
      {
        _id: { type: mongoose.Schema.Types.ObjectId },
        household_name: { type: String },
        amount: { type: String },
        date: { type: Date},
        barangay_id: { type: mongoose.Schema.Types.ObjectId, ref: "barangays" },
      },
      { timestamps: true }
    );
    supplyGivenSchema.method("toJSON", function () {
      const { __v, _id, ...object } = this.toObject();
      object.supply_given_id = _id;
      return object;
    });
    const Tokens = mongoose.model("supply_givens", supplyGivenSchema);
    return Tokens;
  };
  