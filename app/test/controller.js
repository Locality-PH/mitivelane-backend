const fb = require("../../app/config/firebase.config");
const { uuid } = require("uuidv4");
const fs = require("fs");
const storage = fb.admin.storage();
const functions = require("firebase-functions");
const db = require("../models");

const CertificateRequest = db.certificates_request;
const Account = db.account;
const Campaign = db.campaign;
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
  ])
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

exports.getCampaignPage = async (req, res) => {
  try {
    console.log("req.query", req.query)
    var organization_id = req.query.orgId
    const search = req.query.search || "";
    const searchRegex = new RegExp(search, "si");
    organization_id = mongoose.Types.ObjectId(organization_id);

    const filterSearch = [
      { suggestor_full_name: { $regex: search, $options: "i" } },
      { title: { $regex: search, $options: "i" } },
    ];

    const sorter = { title: 1 }
    const query = await Campaign.aggregate([
      {
        $lookup: {
          from: "accounts_infos",
          localField: "suggestor",
          foreignField: "_id",
          as: "suggestor_docs"
        }
      },
      {
        $unwind: "$suggestor_docs"
      },
      {
        $project: {
          "suggestor_docs.first_name": 1,
          "suggestor_docs.last_name": 1,
          "suggestor_docs.full_name": { $concat: ["$suggestor_docs.first_name", "$suggestor_docs.last_name"] },
          "suggestor_docs.full_name_no_space": {
            $replaceAll: {
              input: { $concat: ["$suggestor_docs.first_name", "$suggestor_docs.last_name"] },
              find: " ",
              replacement: ""
            }
          },
          "suggestor_docs.profileLogo": 1,
          "suggestor_docs.profileUrl": 1,
          "suggestor_docs.email": 1,
          title: 1,
          organization: 1,
          category: 1,
          description: 1,
          status: 1,
          starting_date: 1,
          participantCounter: 1,
          likeCounter: 1,
        },
      },
      {
        $match: {
          $and: [
            { organization: organization_id }, // manoks
            {
              $or: [
                {
                  "suggestor_docs.first_name": {
                    $regex: searchRegex
                  }
                },
                {
                  "suggestor_docs.last_name": {
                    $regex: searchRegex
                  }
                },
                {
                  "suggestor_docs.full_name": {
                    $regex: searchRegex
                  }
                },
                {
                  "suggestor_docs.full_name_no_space": {
                    $regex: searchRegex
                  }
                },
                {
                  title: {
                    $regex: searchRegex
                  }
                }
              ],
            },
          ],
        }
      },
      {
        $sort: {
          title: 1
        }
      },
      {
        $facet: {
          total: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 }
              }
            }
          ],
          groups: [
            { $skip: 0 },
            { $limit: 5 },
          ]
        }
      }
    ], { collation: { locale: "en_US", strength: 2 } })
    res.json(query)

  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};
