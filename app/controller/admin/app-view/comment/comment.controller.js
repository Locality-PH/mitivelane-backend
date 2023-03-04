const db = require("../../../../models");
var mongoose = require("mongoose");
const NotificationMiddleware = require("../../../../helper/notification");

const Comment = db.comment;
const Account = db.account;

exports.getComments = async (req, res) => {
  const result = new Number(req.query.result);
  const start = new Number(req.query.start);
  console.log(req.params.genera_id);
  const commentData = await Comment.find({
    general_id: req.params.general_id,
    organization_id: req.params.organization_id,
    parentOfRepliedCommentId: { $exists: false },
  })
    .skip(start)
    .limit(result)

    .populate({
      path: "account",
      model: "accounts_infos",
      select: ["_id", "profileLogo", "full_name", "profileUrl", "uuid"],
    })
    .populate({
      path: "replies",
      model: "comment_sections",
      populate: {
        path: "account",
        model: "accounts_infos",
        select: ["_id", "profileLogo", "full_name", "profileUrl", "uuid"],
      },
    });

  res.json(commentData);
};

exports.createComment = async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId();
    const generalId = new mongoose.Types.ObjectId(req.body.generalId);
    const orgId = new mongoose.Types.ObjectId(req.body.organizationId);

    const user = await Account.findOne({ uuid: req.user.auth_id }).select({
      profileLogo: 1,
      _id: 1, // include _id in the query results
    });

    console.log(user?._id);

    const data = {
      _id: id,
      general_id: generalId,
      replies: [],
      comId: req.body.comId,
      account: user?._id,
      text: req.body.text,
      organization_id: orgId,
    };
    const comment = await new Comment(data);

    comment.save();
    Promise.all([comment]).then(() => {
      return res.json(data);
    });
  } catch (err) {
    return res.json(err);
  }
};
exports.replyComment = async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId();
    const generalId = new mongoose.Types.ObjectId(req.body.generalId);
    const orgId = new mongoose.Types.ObjectId(req.body.organizationId);

    const user = await Account.findOne({ uuid: req.user.auth_id }).select({
      profileLogo: 1,
      _id: 1, // include _id in the query results
    });

    console.log(user?._id);

    const data = {
      _id: id,
      campaign_id: generalId,
      replies: [],
      comId: req.body.comId,
      account: user?._id,
      text: req.body.text,
      organization_id: orgId,
      parentOfRepliedCommentId:
        req.body.parentOfRepliedCommentId || req.body.repliedToCommentId,
    };
    const comment = await new Comment(data);

    comment.save();
    const comment2 = await Comment.findOneAndUpdate(
      {
        comId: req.body.parentOfRepliedCommentId || req.body.repliedToCommentId,
      },
      {
        $push: {
          replies: {
            _id: id,
            comId: req.body.comId,
          },
        },
      },
      { new: true, multi: true }
    );
    comment2.save();
    const comment3 = await Comment.findOne({
      comId: req.body.repliedToCommentId || req.body.parentOfRepliedCommentId,
    })
      .select({
        organization_id: 3,
        account: 2,
        _id: 1, // include _id in the query results
      })
      .populate({
        path: "account",
        model: "accounts_infos",
        select: ["_id", "uuid"],
      });
    console.log(comment3);

    NotificationMiddleware.notificationDocument({
      organization_id: comment3.organization_id,
      message: "has replied to your comment",
      user_id: comment3.account._id,
      uuid: comment3.account.uuid,
      is_read: false,
      type: "user",
    });
    Promise.all([comment, comment2]).then(() => {
      return res.json(req.body);
    });
  } catch (error) {
    return res.json("Error: " + error);
  }
};

exports.deleteComment = async (req, res) => {
  const comId = req.body.comIdToDelete;
  try {
    const deleteComment = await Comment.deleteOne({
      comId: comId,
    });
    if (req.body.parentOfDeleteId) {
      const deleteParentComment = await Comment.findAndUpdate(
        {
          comId: req.body.parentOfDeleteId,
        },
        { $pull: { comId: comId } }, // Update to remove 'red' from the 'colors' array
        { new: true } // Return the updated document
      );
      Promise.all([deleteComment, deleteParentComment]).then(() => {
        return res.json({
          comId: comId,
          deleteParentComment: req.body.comIdToDelete,
        });
      });
    }
    Promise.all([deleteComment]).then(() => {
      return res.json({
        comId: comId,
      });
    });
  } catch (err) {
    return res.json(err);
  }
};

exports.updateComment = async (req, res) => {
  try {
    const updateComment = await Comment.findOneAndUpdate(
      {
        comId: req.body.comId,
      },
      {
        $set: {
          text: req.body.text,
        },
      }
    );

    return res.json(updateComment);
  } catch (err) {
    return res.json(err);
  }
};
