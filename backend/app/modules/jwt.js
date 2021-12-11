const jwt = require("jsonwebtoken");

const defaultSecretKey = "LQ9YeFehRhLrd48tJiG5DEyTP";

function jwtSignPayload(payload, secretKey, expiresIn) {
  return jwt.sign(payload, secretKey || defaultSecretKey, {
    expiresIn: expiresIn
  });
}

module.exports = { jwtSignPayload };
