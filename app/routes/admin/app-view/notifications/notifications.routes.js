module.exports = (app) => {
  const notification = require("../../../../controller/admin/app-view/notification/notification.controller");
  const auth = require("../../../../auth");
  var router = require("express").Router();

  // router.post("/add", accounts.add);
  router.get(
    "/notification",
    auth.authenticationToken,
    notification.getNotificationPrivateData
  );
  router.post(
    "/notification/update",
    auth.authenticationToken,
    notification.updateNotificationPrivateDataNotification
  );
  app.use("/api/app", router);
};
