const db = require("../../../../models");
const Certificate = db.certificates;
var mongoose = require("mongoose");

exports.createCertificate = async (req, res) => {
  var id = new mongoose.Types.ObjectId(req.body.certificate_id);
  let data = {
    _id: id,
    organization_id: [req.user.auth_organization],
    firstLogo: req.body.firstLogo,
    is_active: false,
    secondLogo: req.body.secondLogo,
    signatures: req.body.signatures,
    line_height: req.body.line_height,
    color_picker: req.body.color_picker,
    title: req.body.title ? req.body.title : "Untitled #",
    country: req.body.country,
    status: req.body.status,
    municipality: req.body.municipality,
    organization: req.body.organization,
    office: req.body.office,
    cert_type: req.body.cert_type ? req.body.cert_type : "cert",
    font_family: req.body.font_family ? req.body.font_family : "Tinos",
    template_type: req.body.template_type
      ? req.body.template_type
      : "simple_border",
    content: req.body.content
      ? req.body.content
      : [
          {
            entityMap: {},
            blocks: [],
          },
        ],
    clearance: req.body.clearance,
  };

  const cert = new Certificate(data);

  await cert
    .save(cert)
    .then((_) => {
      return res.json({ id: id });
    })
    .catch((err) => {
      return res.json(err);
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
    const result = new Number(req.body.cert_type);
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

exports.getCertificateName = async (req, res) => {
  try {
    console.log(req.query.cert_type);

    await Certificate.find({
      organization_id: req.user.auth_organization,
      cert_type: req.query.cert_type,
    })
      .select("_id, organization_id , cert_type , title , status")
      .then((data) => {
        //  console.log(data);

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

  await Certificate.findOneAndUpdate(
    {
      _id: req.body.certificate_id,
    },
    {
      $set: {
        organization_id: req.user.auth_organization,
        firstLogo: req.body.firstLogo,
        secondLogo: req.body.secondLogo,
        signatures: req.body.signatures,
        title: req.body.title,
        status: req.body.status,
        is_active: req.body.is_active,
        line_height: req.body.line_height,
        color_picker: req.body.color_picker,
        country: req.body.country,
        municipality: req.body.municipality,
        organization: req.body.organization,
        office: req.body.office,
        cert_type: req.body.cert_type,
        font_family: req.body.font_family,
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

exports.deleteCertificate = async (req, res) => {
  console.log(req.params.id);
  try {
    let certificate_id = req.params.id;
    if (!req.user)
      return res.status(404).send({ Error: "something went wrong" });

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

    await Certificate.deleteOne({
      _id: certificate_id,
      organization_id: req.user.auth_organization,
    })
      .then(() => {
        console.log("delete");
        return res.json("Delete Success");
      })
      .catch((err) => {
        return res.json(err);
      });
  } catch (err) {
    return res.json(err);
  }
};
