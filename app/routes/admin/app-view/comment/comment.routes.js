module.exports = (app) => {
  const commentController = require("../../../../controller/admin/app-view/comment/comment.controller");
  const auth = require("../../../../auth");
  var router = require("express").Router();
  router.get(
    "/:general_id/:organization_id",
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
  router.post(
    "/reply",
    auth.authenticationToken,
    commentController.replyComment
  );
  router.post(
    "/update",
    auth.authenticationToken,
    commentController.updateComment
  );
  app.use("/api/comment", router);
};
