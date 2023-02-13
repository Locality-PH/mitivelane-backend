const db = require("../../../../models");
const CertificateRequest = db.certificates_request;
const Certificate = db.certificates;
const Account = db.account;

var mongoose = require("mongoose");

const pageSizeOptions = [5, 10, 20, 50, 100];

exports.getCertificateRequest = async (req, res) => {
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

    const getRequest = await CertificateRequest.find({
      organization_id: req.query.org,
      $and: [
        { archive: req.query.archive },
        {
          $or: filterSearch,
        },
      ],
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
      $and: [
        { archive: req.query.archive },
        {
          $or: filterSearch,
        },
      ],
    });

    Promise.all([getRequest, count]).then(() => {
      res.set("x-total-count", count);
      return res.json(getRequest);
    });
  } catch (err) {
    return res.json(err);
  }
};

exports.getCertificateRequestPrivateData = async (req, res) => {
  try {
    const result = new Number(req.query.result);
    const start = new Number(req.query.start);
    console.log(req.user.auth_id);
    const getRequest = await CertificateRequest.find({
      uuid: req.user.auth_id,
    })
      .skip(start)
      .limit(result)
      .sort({ createdAt: -1 })
      .populate({
        path: "user_id",
        model: "accounts_infos",
        select: ["_id", "profileLogo", "full_name", "profileUrl"],
      })
      .populate({
        path: "organization_id",
        model: "organizations",
        select: ["_id", "organization_name"],
      });
    console.log(getRequest);
    Promise.all([getRequest]).then(() => {
      return res.json(getRequest);
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
      uuid: req.user.auth_id,
      status: "pending",
      name: req.body.name,
      description: req.body.description,
      certificate_type: req.body.certificate_type,
      issuer: req.body.issuer,
      archive: false,
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
    const updatedCertificate = await CertificateRequest.updateMany(
      {
        _id: { $in: req.body.certificate_requests_id },
        organization_id: req.body.organization_id,
      },
      {
        $set: {
          status: req.body.status,
          notes: req.body.notes,
          issuer: req.body.issuer,
          attach_file: req.body.attach_file,
          archive: req.body.archive,
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

exports.deleteCertificateRequest = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).send({ Error: "something went wrong" });
    }
    const deletedCertificate = await CertificateRequest.deleteMany({
      _id: { $in: req.body.certificate_requests_id },
      organization_id: req.body.organization_id,
    });
    Promise.all([deletedCertificate]).then(() => {
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
