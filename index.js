const dotenv = require("dotenv");
const app = require("./app");

dotenv.config();

const port = process.env.APP_PORT;

app.listen(port, () => {
  console.log("express listening on", port);
});
