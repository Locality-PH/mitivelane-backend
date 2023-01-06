const db = require("../../app/models");

module.exports = async () => {
  try {
    await db.mongoose
      .connect(db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("Connected to the database!");
      })
      .catch((err) => {
        console.log("Cannot connect to the database!", err);
        process.exit();
      });
  } catch (e) {
    console.log(e.message);
  }
};
