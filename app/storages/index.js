const { Storage } = require("@google-cloud/storage");

const gcloud = {};
gcloud.config = Storage.storage({
  projectId: "organization-dev",
  keyFilename: "service-key.json",
});

gcloud = Storage.bucket("organization-dev.appspot.com");
module.exports = gcloud;
