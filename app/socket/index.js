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
  io.on("connection", (socket) => {
    // console.log("Client connected with socket ", socket.id);

    socket.on("disconnect", () => {
      removeUser(socket.id)
      // console.log("Client disconnected ", users)
    });

    socket.on("socket:add-user", authToken => {
      addUser(authToken, socket.id)
      socket.broadcast.emit("socket:new-user", authToken)

      // console.log(users)
    })

    const chat = require("./chat/chat.socket")
    chat(socket, getUser)

    // const sendMessage = (conversationId, receiverAuthToken, message) => {
    // // const user = getUser(receiverAuthToken)

    // try {
    // io.emit("chat:receive-message", conversationId, message)
    // } catch (error) {
    // // Do nothing for now

    // }
    // }

    // socket.on("chat:send-message", sendMessage)
  });
}
