module.exports = (app) => {
  const commentController = require("../../../../controller/admin/app-view/comment/comment.controller");
  const auth = require("../../../../auth");
  var router = require("express").Router();
  router.get(
    "/:campaign_id/:organization_id",
    auth.authenticationToken,
    commentController.getComments
  );
  router.post(
    "/create",
    auth.authenticationToken,
    commentController.createComment
  );
  router.post(
    "/delete",
    auth.authenticationToken,
    commentController.deleteComment
  );
  app.use("/api/comment", router);
};
