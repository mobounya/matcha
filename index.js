const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");

const port = 3000;

app.listen(port, () => {
  console.log("express listening on", port);
});
