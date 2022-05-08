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
const {
  patchAccountSchema
} = require("../notJoi_schemas/patch-account-schema");
const { userIdParamSchema } = require("../notJoi_schemas/userId-param-schema");
const { pictureIdParamSchema } = require("../notJoi_schemas/pictureId-param-schema");
const userControllers = require("../controllers/user-controllers");
const userMiddlewares = require("../middlewares/users-middlewares");
const tokenValidatorMiddlewares = require("../middlewares/token-validator-middleware");
const authMiddleware = require("../middlewares/auth-middlewares");

const { uploadPicture, fileFilter } = require("../modules/upload-picture");

function getEmailFromDecodedJwtPayload(request) {
  return request.jwtPayload.email;
}

function getEmailFromBody(request) {
  return request.body.email;
}

function getUserIdFromJwtPayload(request) {
  return request.jwtPayload.userId;
}

function getUserIdFromParams(request) {
  return request.params.userId;
}

/*
  Profile routes
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

// Post user picture
router.post(
	"/pictures",
	authMiddleware.auth(authMiddleware.getTokenFromCookie, {fetchCurrentUser: true}),
	uploadPicture,
	fileFilter,
	userMiddlewares.insertUserPicture,
	userMiddlewares.savePicture,
	userControllers.sendUserResponse
);

// Get user's pictures Ids
router.get(
	"/pictures",
	authMiddleware.auth(authMiddleware.getTokenFromCookie, {fetchCurrentUser: true}),
	userMiddlewares.getUserIdFromRequest,
	userControllers.getUserPicturesIds
)

// Get other user's pictures Ids by user Id
router.get(
	"/:userId/pictures",
	authMiddleware.auth(authMiddleware.getTokenFromCookie),
	validateSchema(userIdParamSchema, requestFields.PARAMS),
	userMiddlewares.getUserIdFromParam,
	userMiddlewares.checkIfUserExist,
	userControllers.getUserPicturesIds
)

// Get user picture by picture id
router.get(
	"/pictures/:pictureId",
	authMiddleware.auth(authMiddleware.getTokenFromCookie),
	validateSchema(pictureIdParamSchema, requestFields.PARAMS),
	userMiddlewares.getPictureIdFromParam,
	userMiddlewares.checkIfPictureExist,
	userControllers.getUserPicture
)

// Get user profile picture
router.get(
	"/:userId/pictures/profile",
	authMiddleware.auth(authMiddleware.getTokenFromCookie),
	validateSchema(userIdParamSchema, requestFields.PARAMS),
	userMiddlewares.getUserIdFromParam,
	userMiddlewares.checkIfUserExist,
	userControllers.getUserProfilePicture
)

// Delete user picture
router.delete(
	"/pictures/:pictureId",
	authMiddleware.auth(authMiddleware.getTokenFromCookie),
	validateSchema(pictureIdParamSchema, requestFields.PARAMS),
	userMiddlewares.getUserIdFromRequest,
	userMiddlewares.getPictureIdFromParam,
	userMiddlewares.checkIfPictureExist,
	userMiddlewares.checkIfUserIsOwnerOfPicture,
	userControllers.deleteUserPictureByPictureId
)

router.put(
  "/",
  authMiddleware.auth(authMiddleware.getTokenFromCookie),
  validateSchema(profileSchema, requestFields.BODY),
  userMiddlewares.validateProfileData,
  userMiddlewares.checkIfProfileExist(getUserIdFromJwtPayload),
  userControllers.editProfile(getUserIdFromJwtPayload)
);

router.get(
  "/:userId",
  authMiddleware.auth(authMiddleware.getTokenFromCookie),
  validateSchema(userIdParamSchema, requestFields.PARAMS),
  userMiddlewares.checkIfProfileExist(getUserIdFromParams),
  userControllers.getUserProfile(getUserIdFromParams)
);

/*
  Tags routes
*/

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
  userControllers.getUserTags(getUserIdFromJwtPayload)
);

router.get(
  "/:userId/tags",
  authMiddleware.auth(authMiddleware.getTokenFromCookie),
  validateSchema(userIdParamSchema, requestFields.PARAMS),
  userMiddlewares.checkIfProfileExist(getUserIdFromParams),
  userControllers.getUserTags(getUserIdFromParams)
);

router.post(
  "/signin",
  validateSchema(signinSchema, requestFields.BODY),
  userMiddlewares.checkCredentials,
  authMiddleware.generateToken,
  userControllers.sendAuthToken
);

/* Account routes */

router.post(
  "/account",
  validateSchema(signupSchema, requestFields.BODY),
  userMiddlewares.checkDuplicateEmail,
  userMiddlewares.hashPassword,
  userControllers.insertUser
);

router.get(
  "/account",
  authMiddleware.auth(authMiddleware.getTokenFromCookie),
  userControllers.getUserAccount
);

router.patch(
  "/account",
  authMiddleware.auth(authMiddleware.getTokenFromCookie),
  validateSchema(patchAccountSchema, requestFields.BODY),
  userControllers.editUserAccount
);

/* Email verification routes */

router.post(
  "/send-verification-email",
  authMiddleware.auth(authMiddleware.getTokenFromCookie),
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

/* --------------- */

router.post(
  "/send-reset-password-email",
  validateSchema(emailSchema, requestFields.BODY),
  userMiddlewares.checkIfAccountIsValid(getEmailFromBody),
  userControllers.sendResetPasswordEmail
);

/* TODO: bug in this endpoint, changeUserPassword uses id instead of email to filter the specific user */
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

router.patch(
  "/change-password",
  authMiddleware.auth(authMiddleware.getTokenFromCookie),
  validateSchema(passwordSchema, requestFields.BODY),
  userMiddlewares.hashPassword,
  userControllers.changeUserPassword(getUserIdFromJwtPayload)
);

module.exports = router;
