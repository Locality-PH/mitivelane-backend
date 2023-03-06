const fb = require("../../app/config/firebase.config");
const { uuid } = require("uuidv4");
const fs = require("fs");
const storage = fb.admin.storage();
const functions = require("firebase-functions");
const mongoose = require("mongoose")

const db = require("../models");
const Campaign = db.campaign;
const Account = db.account;



exports.testApi = (req, res) => {
  res.json({ profile_url: req.body.profile_url });
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
    var organization_id = req.query.orgId
    const search = req.query.search || "";
    organization_id = mongoose.Types.ObjectId(organization_id);

    const filterSearch = [
      {
        "suggestor_docs.full_name": { $regex: search, $options: "i" },
      },
    ];

    const query = await Campaign.aggregate([
      {
        $match: {organization: organization_id},
      },
      {
        $lookup: {
          from:'accounts_infos',
          localField:'suggestor',
          foreignField:'_id',
          as:'suggestor_docs',
        },
      },
    ]);
    res.json(query)


  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error" });
  }
};
