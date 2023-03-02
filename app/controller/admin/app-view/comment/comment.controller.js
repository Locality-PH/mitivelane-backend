const db = require("../../../../models");
var mongoose = require("mongoose");

const Comment = db.comment;
const Account = db.account;

exports.getComments = async (req, res) => {
  const result = new Number(req.query.result);
  const start = new Number(req.query.start);
  console.log(req.params.campaign_id);
  const commentData = await Comment.find({
    campaign_id: req.params.campaign_id,
    organization_id: req.params.organization_id,
  })
    .skip(start)
    .limit(result)
    .sort({ createdAt: -1 })
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
    const campaignId = new mongoose.Types.ObjectId(req.body.campaignId);
    const orgId = new mongoose.Types.ObjectId(req.body.organizationId);

    const user = await Account.findOne({ uuid: req.user.auth_id }).select({
      profileLogo: 1,
      _id: 1, // include _id in the query results
    });

    console.log(user?._id);

    const data = {
      _id: id,
      campaign_id: campaignId,
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
exports.replyComment = (req, res) => {
  res.json("succes");
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
