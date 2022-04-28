var users = []

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
	const chat = require("./chat/chat.socket")

	const onConnection = (socket) => {
		// User connection and disconnection in socket
		socket.on("socket:add-user", authToken => {
			addUser(authToken, socket.id)
			console.log(users)
		})
		
		socket.on("disconnect", () => {
			removeUser(socket.id)
			console.log("User disconnect ", socket.id)
		})
		
		// Chat 
		chat(io, getUser)

	}

	io.on("connection", onConnection)
}
