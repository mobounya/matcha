const bcrypt = require("bcrypt");

function bcryptHash(password) {
  const saltRounds = 8;
  return bcrypt.hash(password, saltRounds);
}

module.exports = { bcryptHash };
