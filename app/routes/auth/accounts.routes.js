module.exports = (app) => {
  const accounts = require("../../controller/auth/accounts.controller.js");

  var router = require("express").Router();

  // router.post("/add", accounts.add);
  router.post("/register", accounts.registerUser);
  router.get("/login/:auth_id", accounts.loginUser);

  app.use("/api/auth", router);
};
