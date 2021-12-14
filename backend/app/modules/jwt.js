const jwt = require("jsonwebtoken");

const defaultSecretKey = process.env.JWT_APP_SECRET_KEY;

function jwtSignPayload(payload, secretKey, expiresIn) {
  return jwt.sign(payload, secretKey || defaultSecretKey, {
    expiresIn: expiresIn
  });
}

function jwtVerifyToken(token, secretKey) {
  return jwt.verify(token, secretKey || defaultSecretKey);
}

module.exports = { jwtSignPayload, jwtVerifyToken };
