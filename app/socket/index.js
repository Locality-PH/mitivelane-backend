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
		
		setInterval(() => {
			  countGlobal+=1
			  
			  io.emit("chat:receive-message", "6263675a0ff7b70f44ef2fba", {
				 countGlobal,
			  avatar: "",
			  content: "Infinite to",
				from: "opposite",
				msgType: "text",
				time: "",
				unread: false
		  })
		  
		  }, 10000)
		
		// Chat 
		chat(socket, getUser)

	}

	io.on("connection", onConnection)
}
