module.exports = (mongoose) => {
    var householdMembersSchema = mongoose.Schema(
      {
        _id: { type: mongoose.Schema.Types.ObjectId },
        first_name: {type: String},
        last_name: {type: String},
        birthday: {type: Date},
        age: {type: String},
        blood_type: {type: String},
        civil_status: {type: String},
        educational_attainment: {type: String},
        occupation: {type: String},
        ofw: {type: String},
        illness: {type: String},
      },
      { timestamps: true }
    );
    householdMembersSchema.method("toJSON", function () {
      const { __v, _id, ...object } = this.toObject();
      object.household_members_id = _id;
      return object;
    });
    const Tokens = mongoose.model("household_members", householdMembersSchema);
    return Tokens;
  };