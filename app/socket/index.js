var users = []
var countGlobal = 0

const addUser = (userAuthToken, socketId) => {
	!users.some((user) => user.userAuthToken === userAuthToken) &&
		users.push({
			userAuthToken,
			socketId
		})
}

const removeUser = (socketId) => {
	users = users.filter(user => user.socketId !== socketId)
}

const getUser = (userAuthToken) => {
	return users.find(user => user.userAuthToken === userAuthToken)
}

module.exports = (io) => {
	io.on("connection", (socket) => {
  console.log("Client connected ", socket.id);
  
  socket.on("disconnect", () => console.log("Client disconnected"));
  
  socket.on("socket:add-user", authToken => {
	  io.emit("socket:new-user", authToken)
  })

  const sendMessage = (conversationId, receiverAuthToken, message) => {
    // const user = getUser(receiverAuthToken)

    try {
      io.emit("chat:receive-message", conversationId, message)
    } catch (error) {
      // Do nothing for now

    }
  }

  socket.on("chat:send-message", sendMessage)
});
}
