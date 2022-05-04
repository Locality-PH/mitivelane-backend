const db = require("../../../../models");
const Certificate = db.certificates;
var mongoose = require("mongoose");

exports.createCertificate = async (req, res) => {
  var id = new mongoose.Types.ObjectId();
  let data = { _id: id, barangay_id: [req.user.auth_barangay] };
  const cert = new Certificate(data);

  await cert
    .save(cert)
    .then((_) => {
      return res.json({ id: id });
    })
    .catch((err) => {
      return res, json(err);
    });

  //   await users
  //     .save(users)
  //     .then(async (_) => {
  //       return res.status(200).json({ id: id });
  //     })
  //     .catch((error) => {
  //       return res.status(400).json(error);
  //     });
};

exports.getCertificate = async (req, res) => {
  //   const data = req.param;
  //   await Certificate.find(data.id);
  //   return res.json("get");
};

exports.getCertificateAll = async (req, res) => {
  try {
    const result = new Number(req.query.result);
    const start = new Number(req.query.start);
    console.log(req.query.result);
    if (result || start)
      await Certificate.find({ barangay_id: req.user.auth_barangay })
        .skip(start)
        .limit(result)
        .then((data) => {
          console.log(data);
          return res.json(data);
        })
        .catch((_) => {
          return res.json("Something went wrong please try again");
        });
  } catch (e) {
    res.json(e);
  }

  //   const data = req.param;
  //   await Certificate.find(data.id);
  //   return res.json("get");
};
