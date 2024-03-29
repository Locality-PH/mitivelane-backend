module.exports = (mongoose) => {
    var messageSchema = mongoose.Schema(
        {
            _id: { type: mongoose.Schema.Types.ObjectId },
			sender_uuid: { type: String },
			content: { type: String },
			unread: { type: Boolean }
           
        },
        { timestamps: true }
    );
   
    const Tokens = mongoose.model("messages", messageSchema);
    return Tokens;
};
