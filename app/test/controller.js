const fb = require("../../app/config/firebase.config");
const { uuid } = require("uuidv4");
const fs = require("fs");
const storage = fb.admin.storage();
const functions = require("firebase-functions");
const db = require("../models");
const CertificateRequest = db.certificates_request;
const Account = db.account;
const pageSizeOptions = [5, 10, 20, 50, 100];
var mongoose = require("mongoose");

exports.testApi = (req, res) => {
  res.json({ profile_url: req.body.profile_url });
};

exports.aggregate2 = async (req, res) => {
  const data = await Account.aggregate([
    {
      $match: {
        uuid: "Rz2mvrFjszS80AAnuhjxhGqVsb02",
      },
    },
    {
      $lookup: {
        from: "certificate_requests",
        localField: "uuid",
        foreignField: "uuid",
        as: "certificate_data",
      },
    },
    {
      $unwind: {
        path: "$certificate_data",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        sessions: 0,
        members: 0,
      },
    },
  ]);
  console.log(data);
  res.json(data);
};

exports.aggregate = async (req, res) => {
  let limit = parseInt(req.query.pageSize) || 10;
  let skip = parseInt(req.query.page) || 0;
  limit = pageSizeOptions.includes(limit) ? limit : pageSizeOptions[0];
  const search = req.query.search || "";
  const archive = req.query.archive; // example archive value

  const filterSearch = [
    { email: { $regex: search, $options: "i" } },
    { status: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
    { certificate_type: { $regex: search, $options: "i" } },
    { issuer: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
    { name: { $regex: search, $options: "i" } },
    { full_name: { $regex: search, $options: "i" } },
    { profileLogo: { $regex: search, $options: "i" } },
    {
      "account_details.full_name": { $regex: search, $options: "i" },
    },
    {
      "account_details.profileLogo": { $regex: search, $options: "i" },
    },
  ];

  const org = req.query.org; // example organization id
  const id = new mongoose.Types.ObjectId(req.query.org);
  let archiveCondition = false;

  if (req.query.archive === "true") {
    archiveCondition = true;
  }
  const data = await CertificateRequest.aggregate([
    {
      $lookup: {
        from: "accounts_infos",
        let: { user_id: "$user_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$user_id"] },
              $or: filterSearch,
            },
          },
          {
            // sub parent array
            $project: {
              _id: 0,
              full_name: 1,
              profileLogo: 1,
              profileUrl: 1,
            },
          },
        ],
        as: "account_details",
      },
    },
    {
      $unwind: {
        path: "$account_details",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      // parent array
      $project: {
        root: "$$ROOT",
        full_name: "$account_details.full_name",
        profileLogo: "$account_details.profileLogo",
        organization_id: 1,
        archive: 1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $match: {
        $and: [
          { archive: archiveCondition }, // false
          { organization_id: id }, // manoks
          {
            $or: filterSearch,
          },
        ],
      },
    },
  ]);
  console.log(data);
  res.json(data);
};
exports.testUploadFirebase = functions.https.onRequest((req, res) => {
  const fileName = `${uuid}.jpg`;

  // Get the file as a base64 string
  const base64String = req.body.file;
  const metadata = {
    contentType: req.body.type,
    metadata: {
      firebaseStorageDownloadTokens: uuid,
    },
  };
  // Create a new file in Firebase Storage and get its URL
  const file = storage.bucket().file(fileName);

  file.save(
    base64String,
    {
      metadata: metadata,
    },
    (error) => {
      if (error) {
        console.log(error.message);
        return res.status(500).send("Unable to upload the image.");
      }
      return res.status(200).send("Uploaded");
    }
  );
  // file.save(
  //   new Buffer(base64String, "base64"),
  //   { metadata: metadata },
  //   (error) => {
  //     if (error) {
  //       console.log(error.message);
  //       res.status(500).send(error);
  //     } else {
  //       file.getSignedUrl(
  //         {
  //           action: "read",
  //           expires: "03-09-2491",
  //         },
  //         (error, url) => {
  //           if (error) {
  //             res.status(500).send(error);
  //           } else {
  //             res.send(url);
  //           }
  //         }
  //       );
  //     }
  //   }
  // );
});
exports.publish = functions.https.onRequest((req, res) => {
  // Convert the base64 string back to an image to upload into the Google Cloud Storage bucket
  var base64EncodedImageString = req.body.Thumbnail64,
    mimeType = "image/jpeg",
    fileName = "Thumbnail64.jpg",
    imageBuffer = new Buffer(base64EncodedImageString, "base64");

  var bucket = admin.storage().bucket();

  // Upload the image to the bucket
  var file = bucket.file("profile-images/" + fileName);
  file.save(
    imageBuffer,
    {
      metadata: { contentType: mimeType },
    },
    (error) => {
      if (error) {
        return res.status(500).send("Unable to upload the image.");
      }
      return res.status(200).send("Uploaded");
    }
  );
});
