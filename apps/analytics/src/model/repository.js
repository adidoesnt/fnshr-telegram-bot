const mongoose = require("mongoose");

async function initDb() {
  const mongoDB =
    process.env.ENV === "PROD"
      ? process.env.DB_CLOUD_URI
      : process.env.DB_LOCAL_URI;

  await mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
};

async function closeDb() {
  await mongoose.disconnect();
}

module.exports = { initDb, closeDb };
