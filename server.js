const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const http = require("http");
const server = http.createServer(app);
const socketIO = require("socket.io");
const io = socketIO(server);
// const io = new Server(server, {
//   cors: {
//     origins: ["http://localhost:3000", "https://mitivelane-test.online"],
//   },
// });
// server-side
// const io = new Server(server, {
//   origins: ["https://mitivelane-test.online:*", "http://localhost:*"],
//   credentials: true,
//   methods: ["GET", "POST"],
//   handlePreflightRequest: (req, res) => {
//     res.writeHead(200, {
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "GET,POST",
//       "Access-Control-Allow-Credentials": true,
//     });
//     res.end();
//   },
// });
// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:3000", "https://mitivelane-test.online:*"],
//     methods: ["GET", "POST"],
//     credentials: true,
//     handlePreflightRequest: (req, res) => {
//       res.writeHead(200, {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "GET,POST",
//         "Access-Control-Allow-Credentials": true,
//       });
//       res.end();
//     },
//   },
// });

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("disconnect", () => console.log("Client disconnected"));
  
  socket.on("chat:send-message", (conversationId, receiverAuthToken, message) => {
		// const user = getUser(receiverAuthToken)
		
		try{
			console.log("Message ", message.content)
			io.emit("chat:receive-message", conversationId, message)
		}catch(error){
			// Do nothing for now
			
		}
	})
});
const db = require("./app/models");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
global.fetch = require("node-fetch");
// or all the headers helmet offers
app.use(helmet.hsts());
var serviceAccount = require("./service-key.json");
const admin = require("firebase-admin");
require("./app/auth");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://barangay-dev-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "randomDB-f12d3.appspot.com",
});
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });
//simple route
app.get("/", (_, res) => {
  res.json({ message: "Welcome to MITIVELANE application." });
});
//routes
// require("./app/routes/users.routes")(app);
// require("./app/routes/exercises.routes")(app);
require("./app/routes/")(app);

//socket
// require("./app/socket/")(io);

//test Auth
app.get("/api/posts", authenticateToken, (req, res) => {
  // res.json(posts.filter((post) => post.username === req.user.name));
  res.json(req.user);
});
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err);
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}
// s
// set port, listen for requests
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

setInterval(() => io.emit("chat:receive-message", "6263675a0ff7b70f44ef2fba", 
{
	avatar: "", 
	content: "hep",
	from: "opposite",
	msgType: "text",
	time: "",
	unread: false
}
), 5000)