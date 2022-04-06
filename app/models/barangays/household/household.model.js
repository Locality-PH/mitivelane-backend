module.exports = (mongoose) => {
    var householdSchema = mongoose.Schema(
      {
        _id: { type: mongoose.Schema.Types.ObjectId },
        name: {type: String},
        house_number: {type: String},
        purok: {type: String},
        house_status: {type: String},
        family_planning: {type: String},
        ayuda: {type: String},
        water_source: {type: String},
        toilet_type: {type: String},
        waste_management: {type: String},
        barangay:{ type: mongoose.Schema.Types.ObjectId },
        household_members: [{
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'household_members'
        }]
      },
      { timestamps: true }
    );
    householdSchema.method("toJSON", function () {
      const { __v, _id, ...object } = this.toObject();
      object.household_id = _id;
      return object;
    });
    const Tokens = mongoose.model("households", householdSchema);
    return Tokens;
  };