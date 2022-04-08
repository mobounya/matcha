const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middlewares");
const searchMiddlewares = require("../middlewares/search-profiles-middlewares");
const userMiddlewares = require("../middlewares/users-middlewares");

function getUserIdFromJwtPayload(request) {
  return request.jwtPayload.userId;
}

router.get(
  "/",
  authMiddleware.auth(authMiddleware.getTokenFromCookie),
  userMiddlewares.checkIfProfileExist(getUserIdFromJwtPayload),
  searchMiddlewares.getProfileDataToMatch
);

module.exports = router;
