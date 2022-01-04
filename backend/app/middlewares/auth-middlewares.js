const { jwtSignPayload, jwtVerifyToken } = require("../modules/jwt");
const httpStatus = require("../lib/http-status");
const db = require("../database/db");

function generateToken(req, res, next) {
  const secretKey = process.env.JWT_APP_SECRET_KEY;
  const payload = { userId: req.userId };
  const expiration = "1h";
  const token = jwtSignPayload(payload, secretKey, expiration);
  req.token = token;
  next();
}

function auth(getToken, options) {
  options = options || {
    fetchCurrentUser: false
  };
  return async (request, response, next) => {
    try {
      const token = getToken(request);
      const decodedPayload = jwtVerifyToken(token);
      const userId = decodedPayload.userId;
      request.jwtPayload = decodedPayload;
      if (options.fetchCurrentUser) {
        const user = await db.getUserById(userId);
        if (user) {
          request.user = user;
          return next();
        }
      } else {
        return next();
      }
    } catch (e) {}
    response.status(httpStatus.HTTP_UNAUTHORIZED).json({
      message: "unauthorized"
    });
  };
}

function getTokenFromCookie(request) {
  const { token } = request.cookies;
  return token;
}

module.exports = { generateToken, auth, getTokenFromCookie };
