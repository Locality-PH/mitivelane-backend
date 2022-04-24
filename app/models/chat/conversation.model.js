module.exports = (mongoose) => {
    var conversationSchema = mongoose.Schema(
        {
            _id: { type: mongoose.Schema.Types.ObjectId },
            participants: [{
                type: mongoose.Schema.Types.ObjectId,
				ref: "accounts_infos"
            }],
			messages: [{
                type: mongoose.Schema.Types.ObjectId,
				ref: "messages"
            }]
        },
        { timestamps: true }
    );
   
    const Tokens = mongoose.model("conversations", conversationSchema);
    return Tokens;
};
