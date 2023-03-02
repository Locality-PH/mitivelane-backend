module.exports = (mongoose) => {
  var commentSectionSchema = mongoose.Schema(
    {
      _id: { type: mongoose.Schema.Types.ObjectId },
      comId: { type: String },
      organization_id: { type: mongoose.Schema.Types.ObjectId },
      campaign_id: { type: mongoose.Schema.Types.ObjectId },

      text: { type: String },
      account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account_infos",
      },
      replies: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "comment_sections",
        },
      ],
    },
    { timestamps: true }
  );
  commentSectionSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.comment_id = _id;
    return object;
  });
  const Tokens = mongoose.model("comment_sections", commentSectionSchema);
  return Tokens;
};
