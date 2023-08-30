require("dotenv").config();
const mongoose = require("mongoose");
const URI = process.env.URI;

const initiateMongoDB = async () => {
  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
    });
    console.log("Connected to MongoDB");
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = initiateMongoDB;
