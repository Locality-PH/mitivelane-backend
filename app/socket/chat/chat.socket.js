module.exports = (socket, getUser) => {
	const sendMessage = (conversationId, receiverAuthToken, message) => {
		const user = getUser(receiverAuthToken)

		socket.to(user.socketId).emit("chat:receive-message", conversationId, message)
	}
	
	socket.on("chat:send-message", sendMessage)
}


