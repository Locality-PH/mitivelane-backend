const { Storage } = require("@google-cloud/storage");

const gcloud = {};
gcloud.config = Storage.storage({
  projectId: "barangay-dev",
  keyFilename: "service-key.json",
});

gcloud = Storage.bucket("barangay-dev.appspot.com");
module.exports = gcloud;
