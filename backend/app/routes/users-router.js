const express = require("express");
const router = express.Router();

const {
  validateSchema,
  requestFields
} = require("../middlewares/schema-validator-middleware");

const { signupSchema } = require("../notJoi_schemas/signup-schema");
const { signinSchema } = require("../notJoi_schemas/signin-schema");
const { tokenSchema } = require("../notJoi_schemas/token-schema");
const { emailSchema } = require("../notJoi_schemas/email-schema");
const { passwordSchema } = require("../notJoi_schemas/password-schema");
const { profileSchema } = require("../notJoi_schemas/profile-schema");
const { tagsSchema } = require("../notJoi_schemas/tags-schema");

const userControllers = require("../controllers/user-controllers");
const userMiddlewares = require("../middlewares/users-middlewares");
const tokenValidatorMiddlewares = require("../middlewares/token-validator-middleware");
const authMiddleware = require("../middlewares/auth-middlewares");

function getEmailFromDecodedJwtPayload(request) {
  return request.decodedPayload.email;
}

function getEmailFromBody(request) {
  return request.body.email;
}

function getUserIdFromJwtPayload(request) {
  return request.jwtPayload.userId;
}

/*
  User routes
*/

router.post(
  "/",
  validateSchema(profileSchema, requestFields.BODY),
  authMiddleware.auth(authMiddleware.getTokenFromCookie),
  userControllers.checkDuplicateProfile((request) => {
    return request.jwtPayload.userId;
  }),
  userMiddlewares.validateProfileData,
  userControllers.addUserProfile
);

router.put(
  "/",
  authMiddleware.auth(authMiddleware.getTokenFromCookie),
  validateSchema(profileSchema, requestFields.BODY),
  userMiddlewares.validateProfileData,
  userMiddlewares.checkIfProfileExist(getUserIdFromJwtPayload),
  userControllers.editProfile(getUserIdFromJwtPayload)
);

router.post(
  "/tags",
  authMiddleware.auth(authMiddleware.getTokenFromCookie),
  validateSchema(tagsSchema, requestFields.BODY),
  userMiddlewares.removeDuplicateTags,
  userMiddlewares.validateTags,
  userControllers.addUserTags
);

router.patch(
  "/tags",
  authMiddleware.auth(authMiddleware.getTokenFromCookie),
  validateSchema(tagsSchema, requestFields.BODY),
  userMiddlewares.removeDuplicateTags,
  userMiddlewares.validateTags,
  userControllers.removeTags
);

router.get(
  "/tags",
  authMiddleware.auth(authMiddleware.getTokenFromCookie),
  userControllers.getUserTags
);

router.post(
  "/signin",
  validateSchema(signinSchema, requestFields.BODY),
  userMiddlewares.checkCredentials,
  authMiddleware.generateToken,
  userControllers.sendAuthToken
);

router.post(
  "/signup",
  validateSchema(signupSchema, requestFields.BODY),
  userMiddlewares.checkDuplicateEmail,
  userMiddlewares.hashPassword,
  userControllers.insertUser
);

router.post(
  "/send-verification-email",
  validateSchema(emailSchema, requestFields.BODY),
  userMiddlewares.checkIfAccountIsValid(getEmailFromBody),
  userControllers.sendAccountVerificationEmail
);

router.patch(
  "/verify-email",
  validateSchema(tokenSchema, requestFields.BODY),
  tokenValidatorMiddlewares.verifyToken(
    process.env.JWT_EMAIL_VERIFICATION_SECRET_KEY,
    requestFields.BODY
  ),
  userMiddlewares.checkIfAccountIsValid(getEmailFromDecodedJwtPayload),
  userControllers.verifyEmail
);

router.post(
  "/send-reset-password-email",
  validateSchema(emailSchema, requestFields.BODY),
  userMiddlewares.checkIfAccountIsValid(getEmailFromBody),
  userControllers.sendResetPasswordEmail
);

router.put(
  "/reset-password",
  validateSchema(tokenSchema, requestFields.QUERY),
  tokenValidatorMiddlewares.verifyToken(
    process.env.JWT_RESET_PASSWORD_SECRET_KEY,
    requestFields.QUERY
  ),
  validateSchema(passwordSchema, requestFields.BODY),
  userMiddlewares.checkIfAccountIsValid(getEmailFromDecodedJwtPayload),
  userMiddlewares.hashPassword,
  userControllers.changeUserPassword(getEmailFromDecodedJwtPayload)
);

module.exports = router;
