const bcrypt = require("bcrypt");

function bcryptHash(password) {
    const saltRounds = 8;
    return bcrypt.hash(password, saltRounds);
}

function bcryptCompare(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash)
}

module.exports = { bcryptHash, bcryptCompare };