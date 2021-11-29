const express = require("express");
const dotenv = require("dotenv");
const app = express();

dotenv.config();

const port = process.env.APP_PORT;

app.use("/", (req, res) => {
  res.send("This is matcha");
});

app.listen(port, () => {
  console.log("express listening on", port);
});
