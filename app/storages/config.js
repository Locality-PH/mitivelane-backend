module.exports = (gcloud) => {
  var storage = gcloud.storage({
    projectId: "<projectID>",
    keyFilename: "service-key.json",
  });

  var bucket = storage.bucket("organization-dev.appspot.com");

  return AuthenticateToken;
};
