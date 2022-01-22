module.exports = (app) => {
  const accounts = require("../../controller/auth/accounts.controller.js");
  const auth = require("../../auth/");
  var router = require("express").Router();
  var token = require("express").Router();

  // router.post("/add", accounts.add);
  router.post("/register", accounts.registerUser);
  router.get("/login/:auth_id", auth.authenticationToken, accounts.loginUser);
  token.post("/refresh/", accounts.accessToken);

  app.use("/api/", token);
  app.use("/api/auth", router);
};
