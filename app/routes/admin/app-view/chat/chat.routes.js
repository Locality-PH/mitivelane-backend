module.exports = (app) => {
    const chat = require("../../../../controller/admin/app-view/chat/chat.controller");
    const auth = require("../../../../auth");
    var router = require("express").Router();
	
	router.post("/start-conversation", auth.authenticationToken, chat.startConversation);
    router.post("/send-message", auth.authenticationToken, chat.sendMessage);
    router.get("/get-conversation/:user_uuid", auth.authenticationToken, chat.getConversations);

    app.use("/api/chat", router);
};

