const db = require("../../../../models");
const Certificate = db.certificates;
var mongoose = require("mongoose");

exports.createCertificate = async (req, res) => {
  var id = new mongoose.Types.ObjectId();
  let data = {
    _id: id,
    organization_id: [req.user.auth_organization],
    cert_type: "cert",
    title: "Untitled #",
    template_type: "simple_border",
    content: [
      {
        entityMap: {},
        blocks: [],
      },
    ],
  };
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

  try {
    await Certificate.find({
      _id: req.params.id,
      organization_id: req.user.auth_organization,
    })
      .limit(1)
      .then((data) => {
        console.log(data);
        return res.json(data);
      })
      .catch((err) => {
        res.statusCode = 401;
        return res.json("Error: " + err);
      });
  } catch (e) {
    res.json(e);
  }
};

exports.getCertificateAll = async (req, res) => {
  try {
    const result = new Number(req.query.result);
    const start = new Number(req.query.start);
    console.log(req.query.result);
    if (result || start)
      await Certificate.find({ organization_id: req.user.auth_organization })
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

exports.updateCertificate = async (req, res) => {
  if (!req.user) {
    return res.status(404).send({ Error: "something went wrong" });
  }

  // let data = {};
  // data = {
  //   organization_id: req.user.auth_organization,
  //   full_name: req.body.country,
  //   signatures: req.body.signatures,
  //   country: req.body.country,
  //   municipality: req.body.municipality,
  //   organization: req.body.organization,
  //   office: req.body.office,
  //   cert_type: req.body.cert_type,
  //   template_type: req.body.template_type,
  //   content: req.body.content,
  // };

  return await Certificate.findOneAndUpdate(
    {
      _id: req.body.certificate_id,
    },
    {
      $set: {
        organization_id: req.user.auth_organization,
        full_name: req.body.country,
        firstLogo: req.body.firstLogo,
        secondLogo: req.body.secondLogo,
        signatures: req.body.signatures,
        country: req.body.country,
        municipality: req.body.municipality,
        organization: req.body.organization,
        office: req.body.office,
        cert_type: req.body.cert_type,
        template_type: req.body.template_type,
        content: req.body.content,
        clearance: req.body.clearance,
      },
    }
    // { new: true },
    // (err, _) => {
    //   if (err) {
    //     return res.json("Error: " + err);
    //   }
    //   return res.json(req.body);
    // }
  )
    .then(() => {
      return res.json(req.body);
    })
    .catch((err) => {
      return res.json(err);
    });
  //   const data = req.param;
  //   await Certificate.find(data.id);
  //   return res.json("get");
};
