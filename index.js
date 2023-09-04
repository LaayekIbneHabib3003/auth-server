const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const initiateMongoDB = require("./config");
const user = require("./routes");
const PORT = process.env.PORT || 8000;

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
initiateMongoDB();

app.get("/", (req, res) => {
  res.json({ message: "Hello world" });
});

app.use("/user", user);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
