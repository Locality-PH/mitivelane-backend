module.exports = (mongoose) => {
    var supplyArchiveSchema = mongoose.Schema(
      {
        _id: { type: mongoose.Schema.Types.ObjectId },
        year: { type: Date },
        stocks: { type: Array },
        received: { type: Array },
        given: { type: Array },
        organization_id: { type: mongoose.Schema.Types.ObjectId, ref: "barangays" },
      },
      { timestamps: true }
    );
    supplyArchiveSchema.method("toJSON", function () {
      const { __v, _id, ...object } = this.toObject();
      object.supply_archive_id = _id;
      return object;
    });
    const Tokens = mongoose.model("supply_archives", supplyArchiveSchema);
    return Tokens;
  };
  