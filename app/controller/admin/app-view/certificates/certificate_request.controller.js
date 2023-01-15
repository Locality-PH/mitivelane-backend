const db = require("../../../../models");
const CertificateRequest = db.certificates_request;
var mongoose = require("mongoose");

exports.getCertificateRequest = async (req, res) => {
  try {
    return res.json("get Success");
  } catch (err) {
    return res.json(err);
  }
};
exports.createCertificateRequest = async (req, res) => {
  try {
    return res.json("create Success");
  } catch (err) {
    return res.json(err);
  }
};
