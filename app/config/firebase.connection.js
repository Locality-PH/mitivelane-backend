const fb = require("./firebase.config");

module.exports = async () => {
  try {
    if (fb.admin.app()) {
      console.log("firebase-admin is connected");
    } else {
      console.log("firebase-admin is not connected");
    }
  } catch (e) {
    console.log(e.message);
  }
};
