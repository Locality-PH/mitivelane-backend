const db = require("../../../../models");
const CertificateRequest = db.certificates_request;
const Certificate = db.certificates;
const Account = db.account;

var mongoose = require("mongoose");

const pageSizeOptions = [5, 10, 20, 50, 100];

exports.getCertificateRequest = async (req, res) => {
  console.log(req.query.search);
  try {
    let limit = parseInt(req.query.pageSize) || 10;
    limit = pageSizeOptions.includes(limit) ? limit : pageSizeOptions[0];
    const search = req.query.search || "";

    const filterSearch = [
      { email: { $regex: search, $options: "i" } },
      { status: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { certificate_type: { $regex: search, $options: "i" } },
      { issuer: { $regex: search, $options: "i" } },
      {
        "billing_info.mobile": { $regex: search, $options: "i" },
      },
      {
        "billing_info.address": { $regex: search, $options: "i" },
      },
      {
        "billing_info.address2": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "billing_info.city": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "billing_info.postal": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "billing_info.country": {
          $regex: search,
          $options: "i",
        },
      },
      { description: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
    ];
    console.log(limit);
    const getRequest = await CertificateRequest.find({
      organization_id: req.query.org,
      $or: filterSearch,
    })
      .skip(req.query.page)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate({
        path: "user_id",
        model: "accounts_infos",
        select: ["_id", "profileLogo", "full_name", "profileUrl"],
      });
    const count = await CertificateRequest.countDocuments({
      organization_id: req.query.org,
      $or: filterSearch,
    });

    Promise.all([getRequest, count]).then(() => {
      return res.json({ getRequest, count });
    });
  } catch (err) {
    return res.json(err);
  }
};

exports.getCertificateRequestLatest = async (req, res) => {
  try {
    let limit = parseInt(req.query.pageSize) || 10;
    limit = pageSizeOptions.includes(limit) ? limit : pageSizeOptions[0];

    const getRequest = await CertificateRequest.find({
      organization_id: req.query.org,
      updatedAt: { $gte: new Date() },
    }).limit(limit);

    Promise.all([getRequest]).then(() => {
      return res.json(getRequest);
    });
  } catch (err) {
    return res.json(err);
  }
};
exports.createCertificateRequest = async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId();

    const user = await Account.find({ uuid: req.user.auth_id });

    const data = {
      _id: id,
      organization_id: [req.body.organizationId],
      email: req.body.email,
      user_id: user[0]._id,
      status: "pending",
      name: req.body.name,
      description: req.body.description,
      certificate_type: req.body.certificate_type,
      issuer: req.body.issuer,
      billing_info: {
        mobile: req.body.phoneNumber,
        address: req.body.address,
        address2: req.body.address2,
        city: req.body.city,
        postal: req.body.postcode,
        country: req.body.country,
      },
    };

    const cert = await new CertificateRequest(data);
    cert.save();
    Promise.all([user, cert]).then(() => {
      return res.json("saved");
    });
  } catch (err) {
    return res.json(err);
  }
};

exports.updateCertificateRequest = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).send({ Error: "something went wrong" });
    }
    const updatedCertificate = await CertificateRequest.findOneAndUpdate(
      {
        _id: req.body.certificate_requests_id,
      },
      {
        $set: {
          status: req.body.status,
          notes: req.body.notes,
          issuer: req.body.issuer,
          attach_file: req.body.attach_file,
        },
      }
    );
    Promise.all([updatedCertificate]).then(() => {
      return res.json("success");
    });
  } catch (err) {
    return res.json(err);
  }
};

exports.createCertificateActive = async (req, res) => {
  try {
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
