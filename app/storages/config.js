module.exports = (gcloud) => {
  var storage = gcloud.storage({
    projectId: "<projectID>",
    keyFilename: "service-key.json",
  });

  var bucket = storage.bucket("barangay-dev.appspot.com");

  return AuthenticateToken;
};
