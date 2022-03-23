module.exports = (mongoose) => {
  var residentSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      barangay_id: { type: mongoose.Schema.Types.ObjectId, ref: "barangays" },
      lastname: { type: String },
      firstname: { type: String },
      middlename: { type: String },
      alias: { type: String },
      birthday: { type: String },
      age: { type: Number },
      birth_of_place: { type: String },
      gender: { type: String },
      voter_status: { type: String },
      civil_status: { type: String },
      occupation: { type: String },
      citizenship: { type: String },
      telephone: { type: String },
      mobile_number: { type: String },
      religion: { type: String },
      area: { type: String },
      height: { type: Object },
      weight: { type: Object },
      email: { type: String },
      pag_ibig: { type: String },
      philhealth: { type: String },
      sss: { type: String },
      tin: { type: String },
      spouse: { type: String },
      father: { type: String },
      mother: { type: String },
      address_1: { type: String },
      address_2: { type: String },
      avatarColor: { type: String }
    },
    { timestamps: true }
  );
  residentSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.resident_id = _id;
    return object;
  });
  const Tokens = mongoose.model("residents", residentSchema);
  return Tokens;
};