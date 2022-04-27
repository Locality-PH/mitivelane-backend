const db = require("../../../../models");
const Conversation = db.conversation
const Message = db.message
const Account = db.account
var mongoose = require("mongoose");

// My account _id 62284d4700fd9e2d45af89cd
// Giann _id 62284d3500fd9e2d45af89c6
exports.startConversation = async (req, res) => {
	const values = req.body
	const messageId = new mongoose.Types.ObjectId()
	const conversationId = new mongoose.Types.ObjectId()

	try {
		const messageData = new Message({
            _id: messageId,
            sender_uuid: values.sender_uuid,
            content: values.content,
            unread: false
        })
		
        await messageData.save()
		
		const conversationData = new Conversation({
		_id: conversationId,
		participants: values.participants,
		messages: [messageId]
		})
		
		await conversationData.save()

		return res.json("Success")
	} catch (error) {
		return res.json("Error")
	}
};

exports.sendMessage = async (req, res) => {
    const values = req.body
    const messageId = new mongoose.Types.ObjectId()

    try {
        const messageData = new Message({
            _id: messageId,
            sender_uuid: values.sender_uuid,
            content: values.content,
            unread: false
        })
        await messageData.save()
		
		await Conversation.updateOne({_id: values.conversation_id }, {$push: { messages: messageData }})

        return res.json("Success")
    } catch (error) {
        return res.json("Error")
    }
};


exports.getConversations = async (req, res) => {
    const userUuid = req.params.user_uuid

    var finalValue = []

    try {
		const account = await Account.findOne({uuid: userUuid})
		const account_id = account._id
		
		const conversation = await Conversation.find({participants: {$in: [account_id]}})
			.populate("participants")
			.populate("messages").sort({updatedAt: -1})
			
		conversation.map((conversation, conversationIndex) => {
			var participants = conversation.participants.filter(item => item.uuid != userUuid)
			var count = 0
			
			finalValue.push({
				_id: conversation._id,
				receiver_uuid: participants[0].uuid,
				name: `${participants[0].first_name} ${participants[0].last_name}`,
				my_avatar: account.profileUrl.data,
				avatar: participants[0].profileUrl.data,
				messages: [],
				unread: count,
				time: ""
			})
			
			conversation.messages.map((messages, messagesIndex) => {
				if(messages.sender_uuid == userUuid){
					finalValue[conversationIndex].messages.push({
						sender_uuid: messages.sender_uuid,
						content: messages.content,
						from: "me",
						msgType: "text"
					})
				}else{
					finalValue[conversationIndex].messages.push({
						  sender_uuid: messages.sender_uuid,
						content: messages.content,
						from: "opposite",
						msgType: "text",
						avatar: participants[0].profileUrl.data
					})
					
					if(messages.unread == false){
						count+=1
						finalValue[conversationIndex].unread = count
					}
					
				}
				
				if(conversation.messages.length == messagesIndex + 1){
					finalValue[conversationIndex].time = new Date(messages.createdAt).toLocaleTimeString()
					
				}
			})
		})
		
		return res.json(finalValue)

    } catch (error) {
		console.log(error)
        return res.json([])
    }

};





