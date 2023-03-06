const jwt = require("jsonwebtoken");
const multer = require("multer");
const upload = multer();

module.exports = (app) => {
  const testApi = require("./controller.js");
  var router = require("express").Router();
  // router.post("/add", accounts.add);
  router.get(
    "/posts",
    //authenticateToken,
    testApi.testApi
  );
  router.post(
    "/upload/test",
    //authenticateToken,
    testApi.testUploadFirebase
  );
  router.get(
    "/aggregate",
    //authenticateToken,
    testApi.aggregate
  );
  app.use("/api/", router);
};

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
