const db = require("../../../../models");
var mongoose = require("mongoose");

const Session = db.session;

exports.getSession = async (req, res) => {
  const organization_id = req.body.organization_id;

  try {
    const session = await Session.find({ organization_id });
    res.json(session);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

exports.addSession = async (req, res) => {
  const newSessionData = req.body.values;
  newSessionData._id = new mongoose.Types.ObjectId();
  newSessionData.organization_id = mongoose.Types.ObjectId(
    req.body.organization_id
  );

  try {
    const newSession = new Session(newSessionData);
    console.log(newSession);
    await newSession.save();
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

exports.deleteSession = async (req, res) => {
  console.log("id", id)
  console.log("organization_id", organization_id)

  try {
    const query = await Session.findOneAndDelete({ id, organization_id });
    res.json("deleted");
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error });
  }
};

exports.updateSession = async (req, res) => {
  const newSessionData = values;

  console.log("id", id)
  console.log("organization_id", organization_id)
  console.log("newSessionData", newSessionData)

  res.json("udpated")

  // try {
  //   const query = await Session.findOneandUpdate({organization_id, _id:id}, {newSessionData});
  //   res.json("updated");
  // } catch (error) {
  //   console.log(error);
  //   res.status(500).send({ error: error });
  // }
};
