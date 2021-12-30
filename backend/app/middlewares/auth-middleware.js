const { jwtSignPayload } = require("./../modules/jwt")

function generateToken(req, res, next) {
    const secretKey = process.env.JWT_APP_SECRET_KEY;
    const payload = { userId: req.userId };
    const expiration = "1h";
    const token = jwtSignPayload(payload, secretKey, expiration);
    req.token = token
    next()
}

module.exports = { generateToken }