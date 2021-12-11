const express = require("express");
const router = express.Router();

const {
  validateSchema,
  requestFields
} = require("../middlewares/schema-validator");

const { signupSchema } = require("../notJoi_schemas/signup-schema");
const { verifyEmailSchema } = require("../notJoi_schemas/verify-email-schema");

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
  "/verify-account",
  validateSchema(verifyEmailSchema, requestFields.BODY),
  userMiddlewares.checkIfAccountIsValid,
  userMiddlewares.sendAccountVerificationEmail
);

module.exports = router;
