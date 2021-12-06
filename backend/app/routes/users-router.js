const express = require("express");
const router = express.Router();

const {
  validateSchema,
  requestFields
} = require("../middlewares/schema-validator");

const { signupSchema } = require("../notJoi_schemas/signup-schema");
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

module.exports = router;
