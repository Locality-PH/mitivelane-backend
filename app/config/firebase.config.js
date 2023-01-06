const { Storage } = require("@google-cloud/storage");
const admin = require("firebase-admin");
var serviceAccount = require("../../service-key.json");
const bucketName = process.env.REACT_APP_FIREBASE_STORAGE_BUCKET;
const storage = new Storage({
  keyFilename: serviceAccount,
});
const bucket = storage.bucket(process.env.REACT_APP_FIREBASE_STORAGE_BUCKET);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `${process.env.REACT_APP_FIREBASE_DATABASE_URL}`,
  storageBucket: `${process.env.REACT_APP_FIREBASE_STORAGE_BUCKET}`,
});

module.exports = {
  storage,
  admin,
  bucket,
  bucketName,
};
