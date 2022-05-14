module.exports = (mongoose) => {
    var supplyReceiveSchema = mongoose.Schema(
      {
        _id: { type: mongoose.Schema.Types.ObjectId },
        source: { type: String },
        amount: { type: Number },
        date: { type: Date},
        current_supply: { type: Number },
        barangay_id: { type: mongoose.Schema.Types.ObjectId, ref: "barangays" },
      },
      { timestamps: true }
    );
    supplyReceiveSchema.method("toJSON", function () {
      const { __v, _id, ...object } = this.toObject();
      object.supply_receive_id = _id;
      return object;
    });
    const Tokens = mongoose.model("supply_receives", supplyReceiveSchema);
    return Tokens;
  };
  