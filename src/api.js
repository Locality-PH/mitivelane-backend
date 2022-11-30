require("dotenv").config();
global.fetch = require("node-fetch");
const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const db = require("../app/models");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    transports: ["websocket", "polling", "flashsocket"],
  },
});
const router = express.Router();
app.use(`/.netlify/functions/api`, router);
// or all the headers helmet offers
app.use(helmet.hsts());
var serviceAccount = require("./service-key.json");
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://organization-dev-default-rtdb.asia-southeast1.firebasedatabase.app",
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
router.get("/", (_, res) => {
  res.json({ message: "Welcome to MITIVELANE application." });
});
require("../app/auth");

require("../app/routes/")(router);

//socket
require("../app/socket/")(io);

// set port, listen for requests
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}.`);
// });
module.exports.handler = serverless(app);
