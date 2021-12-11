const jwt = require("jsonwebtoken");

const defaultSecretKey = process.env.JWT_APP_SECRET_KEY;

function jwtSignPayload(payload, secretKey, expiresIn) {
  return jwt.sign(payload, secretKey || defaultSecretKey, {
    expiresIn: expiresIn
  });
}

module.exports = { jwtSignPayload };
