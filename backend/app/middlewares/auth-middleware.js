const { jwtSignPayload } = require("./../modules/jwt")

function generateToken(req, res, next) {
    const secretKey = process.env.JWT_EMAIL_VERIFICATION_SECRET_KEY;
    const payload = { user_id: req.user_id };
    const expiration = "1h";
    const token = jwtSignPayload(payload, secretKey, expiration);
    req.token = token
    next()
}

module.exports = { generateToken }