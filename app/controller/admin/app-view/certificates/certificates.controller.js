const db = require("../../../../models");
const Certificate = db.certificates;
var mongoose = require("mongoose");

exports.createCertificate = async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.body.certificate_id);

    const data = {
      _id: id,
      organization_id: [req.user.auth_organization],
      firstLogo: req.body.firstLogo,
      status: false,
      secondLogo: req.body.secondLogo,
      signatures: req.body.signatures,
      line_height: req.body.line_height,
      color_picker: req.body.color_picker,
      title: req.body.title || "Untitled #",
      country: req.body.country,
      municipality: req.body.municipality,
      municipality: req.body.province,
      or_number: req.body.or_number,
      issued_at: req.body.issued_at,
      issued_on: req.body.issued_on,
      organization: req.body.organization,
      office: req.body.office,
      cert_type: req.body.cert_type || "cert",
      font_family: req.body.font_family || "Tinos",
      template_type: req.body.template_type || "simple_border",
      font_size: "S",
      color: "#000000ff",
      content: req.body.content || [{ entityMap: {}, blocks: [] }],
      clearance: req.body.clearance,
    };

    const cert = new Certificate(data);
    await cert.save();
    res.json({ id });
  } catch (error) {
    res.json(error);
  }
};

exports.getCertificate = async (req, res) => {
  try {
    const data = await Certificate.findOne({
      _id: req.params.id,
      organization_id: req.user.auth_organization,
    });

    if (!data) {
      res.statusCode = 404;
      return res.json({ message: "Certificate not found" });
    }

    res.json(data);
  } catch (error) {
    res.json(error);
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
};

exports.getCertificateName = async (req, res) => {
  try {
    console.log(req.query.cert_type);

    await Certificate.find({
      organization_id: req.user.auth_organization,
      cert_type: req.query.cert_type,
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

exports.updateCertificate = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).send({ Error: "something went wrong" });
    }
    const updatedCertificate = await Certificate.findOneAndUpdate(
      {
        _id: req.body.certificate_id,
      },
      {
        $set: {
          organization_id: req.user.auth_organization,
          firstLogo: req.body.firstLogo,
          secondLogo: req.body.secondLogo,
          color: req.body.color,
          font_size: req.body.font_size,
          signatures: req.body.signatures,
          title: req.body.title,
          is_active: req.body.is_active,
          line_height: req.body.line_height,
          color_picker: req.body.color_picker,
          province: req.body.province,
          country: req.body.country,
          or_number: req.body.or_number,
          issued_at: req.body.issued_at,
          issued_on: req.body.issued_on,
          municipality: req.body.municipality,
          status: req.body.status,
          organization: req.body.organization,
          office: req.body.office,
          cert_type: req.body.cert_type,
          font_family: req.body.font_family,
          template_type: req.body.template_type,
          content: req.body.content,
          clearance: req.body.clearance,
        },
      }
    );

    return res.json(updatedCertificate);
  } catch (err) {
    return res.json(err);
  }
};

exports.deleteCertificate = async (req, res) => {
  const certificateId = req.params.id;
  const organizationId = req.user?.auth_organization;

  try {
    if (!organizationId) {
      return res.status(404).send({ Error: "something went wrong" });
    }

    await Certificate.deleteOne({
      _id: certificateId,
      organization_id: organizationId,
    });
    return res.json("Delete Success");
  } catch (err) {
    return res.json(err);
  }
};
