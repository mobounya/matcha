const bcrypt = require("bcrypt");

function bcryptHash(password) {
    const saltRounds = 8;
    return bcrypt.hash(password, saltRounds);
}

function bcryptCompare(plainPassword, hash, callback) {
    return bcrypt.compare(plainPassword, hash, callback)
}

module.exports = { bcryptHash, bcryptCompare };