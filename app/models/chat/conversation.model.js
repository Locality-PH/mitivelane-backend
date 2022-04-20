module.exports = (mongoose) => {
    var conversationSchema = mongoose.Schema(
        {
            _id: { type: mongoose.Schema.Types.ObjectId },
            participants: [{
                type: String,
            }],
        },
        { timestamps: true }
    );
   
    const Tokens = mongoose.model("conversations", conversationSchema);
    return Tokens;
};
