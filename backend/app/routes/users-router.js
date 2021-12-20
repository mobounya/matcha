const express = require("express");
const router = express.Router();

const {
  validateSchema,
  requestFields
} = require("../middlewares/schema-validator");

const { signupSchema } = require("../notJoi_schemas/signup-schema");
const { verifyEmailSchema } = require("../notJoi_schemas/verify-email-schema");
const { tokenSchema } = require("../notJoi_schemas/token-schema");
const {
  resetPasswordSchema
} = require("../notJoi_schemas/reset-password-schema");

const userControllers = require("../controllers/user-controllers");
const userMiddlewares = require("../middlewares/users-middlewares");

/*
  User routes
*/

router.post(
  "/signup",
  validateSchema(signupSchema, requestFields.BODY),
  userMiddlewares.checkDuplicateEmail,
  userMiddlewares.hashPassword,
  userControllers.insertUser
);

router.post(
  "/send-verification-email",
  validateSchema(verifyEmailSchema, requestFields.BODY),
  userMiddlewares.checkIfAccountIsValid,
  userMiddlewares.sendAccountVerificationEmail
);

router.post(
  "/verify-email",
  validateSchema(tokenSchema, requestFields.BODY),
  userMiddlewares.verifyToken,
  userMiddlewares.checkIfAccountIsValid,
  userControllers.verifyEmail
);

router.post(
  "/send-reset-password-email",
  validateSchema(resetPasswordSchema, requestFields.BODY),
  userMiddlewares.checkIfAccountIsValid,
  userMiddlewares.sendResetPasswordVerificationEmail
);

module.exports = router;
