require("dotenv").config();

// Declare Middleware
global.fetch = require("node-fetch");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const helmet = require("helmet");
const app = express();
const http = require("http");
const server = http.createServer(app);
const bodyParser = require("body-parser");

// Declare Connection
const connectionDatabase = require("./app/config/db.connection");
const connectionFirebase = require("./app/config/firebase.connection");

//Socket
const { io } = require("./app/config/socket.config");

// Middleware
app.use(cors());
app.use(helmet.hsts());
// app.use(express.json());
// app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  bodyParser.json({
    limit: "50mb",
  })
);

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    parameterLimit: 100000,
    extended: true,
  })
);

//Firebase
const fb = require("./app/config/firebase.config");

// uuid
const { uuid } = require("uuidv4");

// Database & Firebase Connection
connectionDatabase();
connectionFirebase();

// Security JWT
require("./app/auth");

// Routes
require("./app/routes/")(app);

// Socket
// require("./app/socket/")(io);


// test API
require("./app/test/routes")(app);

// Welcome page API
app.get("/", (_, res) => {
  res.json({ message: "Welcome to MITIVELANE application." });
});

app.get("/test", (_, res) => {
  res.json({ message: "Welcome to MITIVELANE application." });
});

// set port, listen for requests
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
