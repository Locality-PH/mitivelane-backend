module.exports = (socket, getUser) => {
	const sendMessage = (conversationId, receiverAuthToken, message) => {
		const user = getUser(receiverAuthToken)
		console.log(message)
		
		try{
			socket.to(user.socketId).emit("chat:receive-message", conversationId, message)
		}catch(error){
			// Do nothing for now
			
		}
	}
	
	socket.on("chat:send-message", sendMessage)
}


