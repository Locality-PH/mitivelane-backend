const db = require("../../../../models");
const CertificateRequest = db.certificates_request;
const Certificate = db.certificates;

var mongoose = require("mongoose");

exports.getCertificateRequest = async (req, res) => {
  try {
    const getRequest = await CertificateRequest.find({
      user_id: req.user.auth_id,
    });
    Promise.all([getRequest]).then(() => {
      return res.json(getRequest);
    });
  } catch (err) {
    return res.json(err);
  }
};
// email: req.body.,
// user_id: req.body.,
// name: req.body.,
// description: req.body.,
// certificate_type: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: "certificates",
// },
// billing_info: {
//   address1: req.body.,
//   address2: req.body.,
//   mobile: req.body.,
//   address: req.body.,
//   address2: req.body.,
//   city: req.body.,
//   postal: req.body.,
//   country: req.body.,
// },
exports.createCertificateRequest = async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId();

    const data = {
      _id: id,
      organization_id: [req.body.organizationId],
      email: req.body.email,
      user_id: req.user.auth_id,
      status: "pending",
      name: req.body.name,
      description: req.body.description,
      certificate_type: req.body.certificate_type,
      attach_file: {
        file_name: req.body.fileName,
        file_url: req.body.url,
      },
      billing_info: {
        mobile: req.body.phoneNumber,
        address: req.body.address,
        address2: req.body.address2,
        city: req.body.city,
        postal: req.body.postcode,
        country: req.body.country,
      },
    };
    console.log(data);
    const cert = await new CertificateRequest(data);
    cert.save();
    return res.json("saved");
  } catch (err) {
    return res.json(err);
  }
};

exports.createCertificateActive = async (req, res) => {
  try {
    console.log(req.query.org);

    await Certificate.find({
      organization_id: req.query.org,
      status: true,
    })
      .select("_id, organization_id , cert_type , title , status ")
      .then((data) => {
        return res.json(data);
      })
      .catch((_) => {
        return res.json("Something went wrong please try again");
      });
  } catch (e) {
    res.json(e);
  }
};
